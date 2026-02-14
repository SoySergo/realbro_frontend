'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAutosearchStore } from '@/features/autosearch';
import type { AutosearchPropertyMessage, AutosearchProperty } from '@/entities/autosearch';
import type { Property } from '@/entities/property';

export type AutosearchWebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseAutosearchWebSocketOptions {
    url?: string;
    userId?: string;
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    heartbeatTimeout?: number;
}

interface UseAutosearchWebSocketReturn {
    status: AutosearchWebSocketStatus;
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
    reconnectAttempts: number;
}

/**
 * WebSocket hook для real-time уведомлений от AutoSearch через Centrifugo
 * 
 * Канал: autosearch:user_{userId}
 * 
 * Особенности:
 * - Подписка на канал autosearch:user_{userId}
 * - Автоматическое переподключение с exponential backoff
 * - Heartbeat (ping/pong) для поддержания соединения
 * - Обработка входящих объектов недвижимости
 */
export function useAutosearchWebSocket(
    options: UseAutosearchWebSocketOptions = {}
): UseAutosearchWebSocketReturn {
    const {
        url = typeof window !== 'undefined' 
            ? `${window.location.protocol === 'https:' : 'wss:' : 'ws:'}//${window.location.host}/api/websocket/autosearch` 
            : '',
        userId = 'current_user', // TODO: Получать из auth store
        autoConnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        heartbeatInterval = 30000,
        heartbeatTimeout = 10000,
    } = options;

    const [status, setStatus] = useState<AutosearchWebSocketStatus>('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isIntentionalCloseRef = useRef(false);

    const { addIncomingProperty } = useAutosearchStore();

    /**
     * Конвертировать AutosearchPropertyMessage в AutosearchProperty
     */
    const convertToAutosearchProperty = useCallback(
        (message: AutosearchPropertyMessage): AutosearchProperty => {
            const { payload, filter_ids } = message;
            
            // Базовый Property объект
            const property: Property = {
                id: message.property_id,
                slug: payload.slug,
                type: payload.property_type as any,
                category: payload.category as any,
                title: payload.title,
                price: payload.price,
                pricePerMeter: payload.area ? Math.round(payload.price / payload.area) : 0,
                rooms: payload.rooms,
                area: payload.area,
                city: payload.city,
                province: 'Barcelona', // По умолчанию
                country: payload.country,
                images: payload.main_photo ? [payload.main_photo] : [],
                isNew: true,
                isVerified: false,
                features: [],
                description: '',
                address: '',
                coordinates: { lat: 0, lng: 0 },
                createdAt: new Date(payload.created_at),
                updatedAt: new Date(payload.created_at),
            };

            // Добавляем metadata для AutoSearch
            const autosearchProperty: AutosearchProperty = {
                ...property,
                autosearchMetadata: {
                    receivedAt: new Date().toISOString(),
                    filterIds: filter_ids,
                    filterNames: [], // TODO: Получить названия фильтров
                    isNew: true,
                    channel: 'online', // Пришло через WebSocket = online канал
                },
            };

            return autosearchProperty;
        },
        []
    );
    
    // Остановить heartbeat
    const stopHeartbeat = useCallback(() => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
            heartbeatTimeoutRef.current = null;
        }
    }, []);
    
    // Отправить ping
    const sendPing = useCallback(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        
        try {
            wsRef.current.send(JSON.stringify({
                type: 'ping',
                channel: `autosearch:user_${userId}`,
                timestamp: Date.now(),
            }));
            
            heartbeatTimeoutRef.current = setTimeout(() => {
                console.log('[AutoSearch WS] Heartbeat timeout - no pong received');
                wsRef.current?.close();
            }, heartbeatTimeout);
        } catch (error) {
            console.error('[AutoSearch WS] Failed to send ping:', error);
        }
    }, [heartbeatTimeout, userId]);
    
    // Запустить heartbeat
    const startHeartbeat = useCallback(() => {
        stopHeartbeat();
        sendPing();
        
        heartbeatIntervalRef.current = setInterval(() => {
            sendPing();
        }, heartbeatInterval);
    }, [heartbeatInterval, sendPing, stopHeartbeat]);
    
    // Обработать pong
    const handlePong = useCallback(() => {
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
            heartbeatTimeoutRef.current = null;
        }
    }, []);
    
    // Вычислить задержку для переподключения (exponential backoff)
    const getReconnectDelay = useCallback((attempt: number): number => {
        return Math.min(reconnectInterval * Math.pow(2, attempt), 60000);
    }, [reconnectInterval]);

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setStatus('connecting');
        isIntentionalCloseRef.current = false;

        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[AutoSearch WS] Connected successfully');
                
                // Подписаться на канал autosearch:user_{userId}
                ws.send(JSON.stringify({
                    type: 'subscribe',
                    channel: `autosearch:user_${userId}`,
                }));
                
                setStatus('connected');
                setReconnectAttempts(0);
                startHeartbeat();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'pong':
                            handlePong();
                            break;
                            
                        case 'property':
                        case 'autosearch:property':
                            // Новый объект от AutoSearch
                            const propertyMessage: AutosearchPropertyMessage = data.payload || data;
                            const autosearchProperty = convertToAutosearchProperty(propertyMessage);
                            addIncomingProperty(autosearchProperty);
                            console.log('[AutoSearch WS] New property received', {
                                id: autosearchProperty.id,
                                filterIds: autosearchProperty.autosearchMetadata.filterIds,
                            });
                            break;
                            
                        case 'subscribed':
                            console.log('[AutoSearch WS] Subscribed to channel', data.channel);
                            break;
                            
                        case 'error':
                            console.error('[AutoSearch WS] Server error:', data);
                            break;
                            
                        default:
                            console.log('[AutoSearch WS] Unknown message type:', data.type);
                    }
                } catch (err) {
                    console.error('[AutoSearch WS] Parse error:', err);
                }
            };

            ws.onerror = (error) => {
                console.log('[AutoSearch WS] Error occurred:', error);
                setStatus('error');
            };

            ws.onclose = (event) => {
                console.log('[AutoSearch WS] Connection closed', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                });
                
                stopHeartbeat();
                setStatus('disconnected');
                wsRef.current = null;

                // Переподключение если не был преднамеренный дисконнект
                if (!isIntentionalCloseRef.current) {
                    if (reconnectAttempts < maxReconnectAttempts) {
                        const delay = getReconnectDelay(reconnectAttempts);
                        console.log(
                            `[AutoSearch WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`
                        );
                        
                        setReconnectAttempts(prev => prev + 1);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, delay);
                    } else {
                        console.log('[AutoSearch WS] Max reconnect attempts reached');
                        setStatus('error');
                    }
                }
            };
        } catch (error) {
            console.error('[AutoSearch WS] Failed to create connection:', error);
            setStatus('error');
        }
    }, [
        url,
        userId,
        maxReconnectAttempts,
        reconnectAttempts,
        addIncomingProperty,
        convertToAutosearchProperty,
        startHeartbeat,
        stopHeartbeat,
        handlePong,
        getReconnectDelay,
    ]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        isIntentionalCloseRef.current = true;
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        stopHeartbeat();
        
        if (wsRef.current) {
            // Отписаться от канала перед закрытием
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'unsubscribe',
                    channel: `autosearch:user_${userId}`,
                }));
            }
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setStatus('disconnected');
        setReconnectAttempts(0);
    }, [stopHeartbeat, userId]);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect && userId) {
            const timer = setTimeout(() => {
                connect();
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [autoConnect, userId, connect]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        status,
        connect,
        disconnect,
        isConnected: status === 'connected',
        reconnectAttempts,
    };
}
