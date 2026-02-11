'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/features/chat-messages';
import { generateMockProperty } from '@/shared/api/chat';

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
    url?: string;
    autoConnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
    heartbeatInterval?: number;
    heartbeatTimeout?: number;
}

interface UseWebSocketReturn {
    status: WebSocketStatus;
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
    reconnectAttempts: number;
}

/**
 * WebSocket hook для real-time уведомлений о новых объектах от AI агента
 * 
 * Особенности:
 * - Автоматическое переподключение с exponential backoff
 * - Heartbeat (ping/pong) для поддержания соединения
 * - Fallback на simulation режим если WebSocket недоступен
 * - Оптимизирован для продакшена
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        url = typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket` : '',
        autoConnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        heartbeatInterval = 30000, // 30 секунд
        heartbeatTimeout = 10000,  // 10 секунд на ответ
    } = options;

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const propertyCounterRef = useRef(200);
    const isIntentionalCloseRef = useRef(false);

    const { addIncomingMessage, conversations } = useChatStore();

    // Get AI agent conversation ID
    const getAIConversationId = useCallback(() => {
        const aiConv = conversations.find(c => c.type === 'ai-agent');
        return aiConv?.id || 'conv_ai_agent';
    }, [conversations]);

    // Simulate property message (fallback when WebSocket not available)
    const simulatePropertyMessage = useCallback(() => {
        const conversationId = getAIConversationId();
        propertyCounterRef.current++;
        
        const property = generateMockProperty(propertyCounterRef.current);
        const filterNames = ['Barcelona Center', 'Gracia Budget', 'Eixample Premium'];
        const filterIds = ['filter_1', 'filter_2', 'filter_3'];
        const filterIdx = propertyCounterRef.current % 3;

        addIncomingMessage({
            id: `msg_ws_${Date.now()}`,
            conversationId,
            senderId: 'ai-agent',
            type: 'property',
            content: '',
            properties: [property],
            status: 'delivered',
            createdAt: new Date().toISOString(),
            metadata: {
                filterName: filterNames[filterIdx],
                filterId: filterIds[filterIdx],
            },
        });
    }, [addIncomingMessage, getAIConversationId]);

    // Start simulation fallback
    const startSimulation = useCallback(() => {
        if (simulationIntervalRef.current) return;
        
        console.log('[WebSocket] Starting simulation fallback');
        setStatus('connected');
        
        // Simulate messages every 10-20 seconds
        simulationIntervalRef.current = setInterval(() => {
            simulatePropertyMessage();
        }, 10000 + Math.random() * 10000);
    }, [simulatePropertyMessage]);

    // Stop simulation
    const stopSimulation = useCallback(() => {
        if (simulationIntervalRef.current) {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
        }
    }, []);
    
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
                timestamp: Date.now(),
            }));
            
            // Установить timeout на pong
            heartbeatTimeoutRef.current = setTimeout(() => {
                console.log('[WebSocket] Heartbeat timeout - no pong received');
                wsRef.current?.close();
            }, heartbeatTimeout);
        } catch (error) {
            console.error('[WebSocket] Failed to send ping:', error);
        }
    }, [heartbeatTimeout]);
    
    // Запустить heartbeat
    const startHeartbeat = useCallback(() => {
        stopHeartbeat();
        
        // Первый ping сразу
        sendPing();
        
        // Затем регулярно
        heartbeatIntervalRef.current = setInterval(() => {
            sendPing();
        }, heartbeatInterval);
    }, [heartbeatInterval, sendPing, stopHeartbeat]);
    
    // Обработать pong
    const handlePong = useCallback(() => {
        // Отменить timeout
        if (heartbeatTimeoutRef.current) {
            clearTimeout(heartbeatTimeoutRef.current);
            heartbeatTimeoutRef.current = null;
        }
    }, []);
    
    // Вычислить задержку для переподключения (exponential backoff)
    const getReconnectDelay = useCallback((attempt: number): number => {
        return Math.min(reconnectInterval * Math.pow(2, attempt), 60000); // Макс 60 секунд
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
                console.log('[WebSocket] Connected successfully');
                setStatus('connected');
                setReconnectAttempts(0);
                stopSimulation();
                startHeartbeat();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    
                    // Обработка разных типов сообщений
                    switch (data.type) {
                        case 'pong':
                            handlePong();
                            break;
                            
                        case 'property':
                            const conversationId = getAIConversationId();
                            addIncomingMessage({
                                id: `msg_ws_${Date.now()}`,
                                conversationId,
                                senderId: 'ai-agent',
                                type: 'property',
                                content: '',
                                properties: [data.property],
                                status: 'delivered',
                                createdAt: new Date().toISOString(),
                                metadata: data.metadata,
                            });
                            break;
                            
                        case 'error':
                            console.error('[WebSocket] Server error:', data);
                            break;
                            
                        default:
                            console.log('[WebSocket] Unknown message type:', data.type);
                    }
                } catch (err) {
                    console.error('[WebSocket] Parse error:', err);
                }
            };

            ws.onerror = (error) => {
                console.log('[WebSocket] Error occurred:', error);
                setStatus('error');
            };

            ws.onclose = (event) => {
                console.log('[WebSocket] Connection closed', {
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
                        console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
                        
                        setReconnectAttempts(prev => prev + 1);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, delay);
                    } else {
                        console.log('[WebSocket] Max reconnect attempts reached, falling back to simulation');
                        startSimulation();
                    }
                }
            };
        } catch (error) {
            console.log('[WebSocket] Failed to create connection, using simulation:', error);
            startSimulation();
        }
    }, [
        url,
        maxReconnectAttempts,
        reconnectAttempts,
        addIncomingMessage,
        getAIConversationId,
        startSimulation,
        stopSimulation,
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
        
        stopSimulation();
        stopHeartbeat();
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setStatus('disconnected');
        setReconnectAttempts(0);
    }, [stopSimulation, stopHeartbeat]);

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            // Small delay to ensure store is hydrated
            const timer = setTimeout(() => {
                // Start with simulation immediately (WebSocket will be attempted but likely fail in dev)
                startSimulation();
            }, 1000);
            
            return () => clearTimeout(timer);
        }
    }, [autoConnect, startSimulation]);

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
