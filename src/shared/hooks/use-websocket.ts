'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/features/chat-messages';

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
 * WebSocket hook для real-time чат сообщений (p2p, support)
 * 
 * Канал: chat:{conversationId}
 * 
 * Особенности:
 * - Автоматическое переподключение с exponential backoff
 * - Heartbeat (ping/pong) для поддержания соединения
 * - Обработка входящих сообщений чата
 * 
 * Примечание: Для AutoSearch используйте useAutosearchWebSocket
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        url = typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket/chat` : '',
        autoConnect = false, // Changed to false - connect when user opens chat
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
        heartbeatInterval = 30000,
        heartbeatTimeout = 10000,
    } = options;

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isIntentionalCloseRef = useRef(false);

    const { addIncomingMessage } = useChatStore();

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
                console.log('[Chat WS] Connected successfully');
                setStatus('connected');
                setReconnectAttempts(0);
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

                        case 'chat:message':
                            // Новое сообщение в чате
                            addIncomingMessage(data.message);
                            break;

                        case 'error':
                            console.error('[Chat WS] Server error:', data);
                            break;

                        default:
                            console.log('[Chat WS] Unknown message type:', data.type);
                    }
                } catch (err) {
                    console.error('[Chat WS] Parse error:', err);
                }
            };

            ws.onerror = (error) => {
                console.log('[Chat WS] Error occurred:', error);
                setStatus('error');
            };

            ws.onclose = (event) => {
                console.log('[Chat WS] Connection closed', {
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
                        console.log(`[Chat WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);

                        setReconnectAttempts(prev => prev + 1);
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect();
                        }, delay);
                    } else {
                        console.log('[Chat WS] Max reconnect attempts reached');
                        setStatus('error');
                    }
                }
            };
        } catch (error) {
            console.error('[Chat WS] Failed to create connection:', error);
            setStatus('error');
        }
    }, [
        url,
        maxReconnectAttempts,
        reconnectAttempts,
        addIncomingMessage,
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
            wsRef.current.close();
            wsRef.current = null;
        }

        setStatus('disconnected');
        setReconnectAttempts(0);
    }, [stopHeartbeat]);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
    }, [autoConnect, connect]);

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
