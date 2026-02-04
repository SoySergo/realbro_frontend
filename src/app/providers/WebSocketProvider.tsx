'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useChatStore, useToastStore } from '@/features/chat-messages';
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
 * Shows toast notifications when user is not on chat page
 */
export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const [status, setStatus] = useState<WebSocketStatus>('disconnected');
    const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const propertyCounterRef = useRef(200);
    const hasStartedRef = useRef(false);
    const pathname = usePathname();

    const { addIncomingMessage, conversations } = useChatStore();
    const { addToast } = useToastStore();

    // Проверяем, находится ли пользователь на странице чата
    const isOnChatPage = pathname?.includes('/chat');

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
        property.isNew = true; // Помечаем как новый
        
        const filterNames = ['Barcelona Center', 'Gracia Budget', 'Eixample Premium'];
        const filterIds = ['filter_1', 'filter_2', 'filter_3'];
        const filterIdx = propertyCounterRef.current % 3;
        const filterName = filterNames[filterIdx];

        const messageId = `msg_ws_${Date.now()}`;

        addIncomingMessage({
            id: messageId,
            conversationId,
            senderId: 'ai-agent',
            type: 'property',
            content: '',
            properties: [property],
            status: 'delivered',
            createdAt: new Date().toISOString(),
            metadata: {
                filterName,
                filterId: filterIds[filterIdx],
            },
        });

        // Показываем тост если пользователь НЕ на странице чата
        if (!isOnChatPage) {
            addToast({
                id: `toast_${messageId}`,
                property,
                filterName,
            });
        }
    }, [addIncomingMessage, getAIConversationId, addToast, isOnChatPage]);

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
