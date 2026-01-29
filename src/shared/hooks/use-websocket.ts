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
}

interface UseWebSocketReturn {
    status: WebSocketStatus;
    connect: () => void;
    disconnect: () => void;
    isConnected: boolean;
}

/**
 * WebSocket hook for real-time property updates from AI Agent
 * Falls back to polling simulation if WebSocket is unavailable
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
    const {
        url = typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket` : '',
        autoConnect = true,
        reconnectInterval = 3000,
        maxReconnectAttempts = 5,
    } = options;

    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const propertyCounterRef = useRef(200);

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

    // Connect to WebSocket
    const connect = useCallback(() => {
        if (typeof window === 'undefined') return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        setStatus('connecting');

        try {
            // Try to connect to WebSocket
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Connected');
                setStatus('connected');
                reconnectAttemptsRef.current = 0;
                stopSimulation();
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'property') {
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
                    }
                } catch (err) {
                    console.error('[WebSocket] Parse error:', err);
                }
            };

            ws.onerror = (error) => {
                console.log('[WebSocket] Error, falling back to simulation:', error);
                setStatus('error');
            };

            ws.onclose = () => {
                console.log('[WebSocket] Closed');
                setStatus('disconnected');
                wsRef.current = null;

                // Try to reconnect or fall back to simulation
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, reconnectInterval);
                } else {
                    // Fall back to simulation
                    startSimulation();
                }
            };
        } catch (error) {
            console.log('[WebSocket] Failed to create, using simulation:', error);
            startSimulation();
        }
    }, [url, maxReconnectAttempts, reconnectInterval, addIncomingMessage, getAIConversationId, startSimulation, stopSimulation]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        
        stopSimulation();
        
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        
        setStatus('disconnected');
    }, [stopSimulation]);

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
    };
}
