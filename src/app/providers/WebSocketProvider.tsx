'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/features/chat-messages';
import { generateMockProperty } from '@/shared/api/chat';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketContextValue {
    status: WebSocketStatus;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
    status: 'disconnected',
    isConnected: false,
});

export function useWebSocketContext() {
    return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
    children: React.ReactNode;
}

/**
 * Global WebSocket provider for real-time property updates
 * Runs in background regardless of which page user is on
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const propertyCounterRef = useRef(200);
    const hasStartedRef = useRef(false);

    const { addIncomingMessage, conversations } = useChatStore();

    // Get AI agent conversation ID
    const getAIConversationId = useCallback(() => {
        const aiConv = conversations.find(c => c.type === 'ai-agent');
        return aiConv?.id || 'conv_ai_agent';
    }, [conversations]);

    // Simulate property message
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

    // Start simulation
    const startSimulation = useCallback(() => {
        if (simulationIntervalRef.current || hasStartedRef.current) return;
        
        hasStartedRef.current = true;
        console.log('[WebSocket] Starting global simulation');
        setStatus('connected');
        
        // Simulate messages every 5-10 seconds
        simulationIntervalRef.current = setInterval(() => {
            simulatePropertyMessage();
        }, 5000 + Math.random() * 5000);
    }, [simulatePropertyMessage]);

    // Start simulation on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            startSimulation();
        }, 2000);
        
        return () => {
            clearTimeout(timer);
            if (simulationIntervalRef.current) {
                clearInterval(simulationIntervalRef.current);
                simulationIntervalRef.current = null;
            }
        };
    }, [startSimulation]);

    return (
        <WebSocketContext.Provider value={{ status, isConnected: status === 'connected' }}>
            {children}
        </WebSocketContext.Provider>
    );
}
