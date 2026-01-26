'use client';

import type { Property } from '@/entities/property';
import type {
    ChatMessage,
    Conversation,
    AIAgentSettings,
    PropertyBatch,
    DayFilter,
} from '@/entities/chat';

const API_BASE = '/api/chat';

// ============ API Functions ============

export async function getConversations(): Promise<Conversation[]> {
    try {
        const response = await fetch(`${API_BASE}/conversations`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.conversations;
    } catch (error) {
        console.error('[API] Failed to get conversations:', error);
        return generateMockConversations();
    }
}

export async function getMessages(
    conversationId: string,
    page = 1
): Promise<{
    messages: ChatMessage[];
    pagination: { page: number; limit: number; total: number; hasMore: boolean };
}> {
    try {
        const response = await fetch(
            `${API_BASE}/messages/${conversationId}?page=${page}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get messages:', error);
        return {
            messages: generateMockMessages(conversationId),
            pagination: { page: 1, limit: 50, total: 20, hasMore: false },
        };
    }
}

export async function sendMessage(
    conversationId: string,
    content: string
): Promise<ChatMessage> {
    try {
        const response = await fetch(`${API_BASE}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId, content }),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Failed to send message:', error);
        return {
            id: `msg_${Date.now()}`,
            conversationId,
            senderId: 'current_user',
            type: 'text',
            content,
            status: 'sent',
            createdAt: new Date().toISOString(),
        };
    }
}

export async function getAIProperties(params: {
    dayFilter?: DayFilter;
    filterIds?: string[];
}): Promise<{ batches: PropertyBatch[]; totalProperties: number }> {
    try {
        const searchParams = new URLSearchParams();
        if (params.dayFilter) searchParams.set('dayFilter', params.dayFilter);
        if (params.filterIds?.length)
            searchParams.set('filterIds', params.filterIds.join(','));

        const response = await fetch(
            `${API_BASE}/ai-properties?${searchParams.toString()}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get AI properties:', error);
        const batches = generateMockPropertyBatches();
        return {
            batches,
            totalProperties: batches.reduce((acc, b) => acc + b.properties.length, 0),
        };
    }
}

export async function getAISettings(): Promise<AIAgentSettings> {
    try {
        const response = await fetch(`${API_BASE}/settings`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get AI settings:', error);
        return {
            isActive: true,
            notificationStartHour: 7,
            notificationEndHour: 22,
            notificationFrequency: '30min',
            linkedFilterIds: ['filter_1', 'filter_2'],
        };
    }
}

export async function updateAISettings(
    settings: Partial<AIAgentSettings>
): Promise<AIAgentSettings> {
    try {
        const response = await fetch(`${API_BASE}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('[API] Failed to update AI settings:', error);
        return {
            isActive: true,
            notificationStartHour: 7,
            notificationEndHour: 22,
            notificationFrequency: '30min',
            linkedFilterIds: ['filter_1', 'filter_2'],
            ...settings,
        };
    }
}

// ============ Mock Data Generators ============

const imageCollections = [
    [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80',
    ],
    [
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop&q=80',
    ],
];

export function generateMockProperty(index: number): Property {
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = [
        'Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi',
        'Montjuïc', 'Sants', 'Les Corts', 'Horta-Guinardó',
    ];
    const streets = [
        'Passeig de Gràcia', 'Gran Via', 'Carrer de Aribau',
        'Avenida Diagonal', 'Carrer de Còrsega', 'Carrer del Consell de Cent',
    ];

    const type = types[index % types.length];
    const neighborhood = neighborhoods[index % neighborhoods.length];
    const street = streets[index % streets.length];
    const images = imageCollections[index % imageCollections.length];

    const bedrooms = type === 'studio' ? 0 : Math.floor(Math.random() * 3) + 2;
    const area = Math.floor(Math.random() * 80) + (bedrooms > 1 ? 80 : 40);
    const price = Math.floor(800 + Math.random() * 2000);

    return {
        id: `prop_chat_${index}_${Date.now()}`,
        title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : bedrooms + 'BR'} ${type}`,
        type,
        price,
        pricePerMeter: Math.round(price / area),
        bedrooms,
        bathrooms: Math.floor(Math.random() * 2) + 1,
        area,
        floor: Math.floor(Math.random() * 6) + 1,
        totalFloors: Math.floor(Math.random() * 4) + 5,
        address: `${street}, ${Math.floor(Math.random() * 200) + 1}`,
        city: 'Barcelona',
        province: 'Barcelona',
        coordinates: {
            lat: 41.3851 + (Math.random() - 0.5) * 0.08,
            lng: 2.1734 + (Math.random() - 0.5) * 0.08,
        },
        description: `Beautiful ${type} in the heart of Barcelona. Perfect for professionals and families.`,
        features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'],
        images,
        isNew: Math.random() > 0.7,
        isVerified: Math.random() > 0.3,
        nearbyTransport: {
            type: (['metro', 'train', 'bus'] as const)[Math.floor(Math.random() * 3)],
            name: ['Diagonal', 'Passeig de Gràcia', 'Lesseps', 'Fontana'][
                Math.floor(Math.random() * 4)
            ],
            line: `L${Math.floor(Math.random() * 5) + 1}`,
            color: ['#EE352E', '#0066CC', '#FFC72C', '#339933'][Math.floor(Math.random() * 4)],
            walkMinutes: Math.floor(Math.random() * 12) + 2,
        },
        author: {
            id: `agent_${index % 5}`,
            name: ['Maria Garcia', 'José Martinez', 'Ana López', 'Carlos Rodríguez', 'Isabel Fernández'][index % 5],
            avatar: `https://i.pravatar.cc/150?u=agent_${index % 5}`,
            type: (['agent', 'owner', 'agency'] as const)[Math.floor(Math.random() * 3)],
            isVerified: Math.random() > 0.4,
        },
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
    };
}

export function generateMockConversations(): Conversation[] {
    const now = new Date();
    return [
        {
            id: 'conv_ai_agent',
            type: 'ai-agent',
            title: 'AI Agent',
            participants: ['current_user', 'ai-agent'],
            lastMessage: {
                id: 'msg_ai_last',
                conversationId: 'conv_ai_agent',
                senderId: 'ai-agent',
                type: 'property-batch',
                content: '5 new properties matching "Barcelona Center"',
                properties: Array.from({ length: 5 }, (_, i) => generateMockProperty(i)),
                status: 'delivered',
                createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
            },
            unreadCount: 5,
            isPinned: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
            aiSettings: {
                isActive: true,
                notificationStartHour: 7,
                notificationEndHour: 22,
                notificationFrequency: '30min',
                linkedFilterIds: ['filter_1', 'filter_2'],
            },
        },
        {
            id: 'conv_support',
            type: 'support',
            title: 'Support',
            participants: ['current_user', 'support'],
            lastMessage: {
                id: 'msg_support_last',
                conversationId: 'conv_support',
                senderId: 'support',
                type: 'text',
                content: 'How can we help you?',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
            },
            unreadCount: 0,
            isPinned: true,
            createdAt: '2026-01-01T00:00:00Z',
            updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
        },
        {
            id: 'conv_user_1',
            type: 'p2p',
            title: 'Maria Garcia',
            avatar: 'https://i.pravatar.cc/150?u=maria_garcia',
            participants: ['current_user', 'user_1'],
            lastMessage: {
                id: 'msg_p2p_last_1',
                conversationId: 'conv_user_1',
                senderId: 'user_1',
                type: 'text',
                content: 'Is the apartment still available?',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
            },
            unreadCount: 2,
            isPinned: false,
            createdAt: '2026-01-15T00:00:00Z',
            updatedAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
        {
            id: 'conv_user_2',
            type: 'p2p',
            title: 'José Martinez',
            avatar: 'https://i.pravatar.cc/150?u=jose_martinez',
            participants: ['current_user', 'user_2'],
            lastMessage: {
                id: 'msg_p2p_last_2',
                conversationId: 'conv_user_2',
                senderId: 'current_user',
                type: 'text',
                content: 'Thank you for the tour!',
                status: 'read',
                createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
            },
            unreadCount: 0,
            isPinned: false,
            createdAt: '2026-01-10T00:00:00Z',
            updatedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
        },
        {
            id: 'conv_user_3',
            type: 'p2p',
            title: 'Ana López',
            avatar: 'https://i.pravatar.cc/150?u=ana_lopez',
            participants: ['current_user', 'user_3'],
            lastMessage: {
                id: 'msg_p2p_last_3',
                conversationId: 'conv_user_3',
                senderId: 'user_3',
                type: 'text',
                content: 'Can we schedule a viewing?',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
            },
            unreadCount: 1,
            isPinned: false,
            createdAt: '2026-01-08T00:00:00Z',
            updatedAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
        },
    ];
}

export function generateMockMessages(conversationId: string): ChatMessage[] {
    const now = new Date();

    if (conversationId === 'conv_ai_agent') {
        return [
            {
                id: 'msg_ai_1',
                conversationId,
                senderId: 'ai-agent',
                type: 'system',
                content: 'AI Agent started monitoring your search filters',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(),
            },
            {
                id: 'msg_ai_2',
                conversationId,
                senderId: 'ai-agent',
                type: 'ai-status',
                content: 'Searching for properties matching "Barcelona Center, 2+ rooms, up to 1500 EUR"...',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 6 * 24 * 3600000).toISOString(),
            },
            {
                id: 'msg_ai_3',
                conversationId,
                senderId: 'ai-agent',
                type: 'property',
                content: '',
                properties: [generateMockProperty(10)],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
                metadata: { filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
            {
                id: 'msg_ai_4',
                conversationId,
                senderId: 'ai-agent',
                type: 'property',
                content: '',
                properties: [generateMockProperty(11)],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 4 * 24 * 3600000).toISOString(),
                metadata: { filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
            {
                id: 'msg_ai_5',
                conversationId,
                senderId: 'ai-agent',
                type: 'property-batch',
                content: '3 new properties while you were away',
                properties: [
                    generateMockProperty(20),
                    generateMockProperty(21),
                    generateMockProperty(22),
                ],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
                metadata: { batchId: 'batch_1', filterName: 'Gracia Budget', filterId: 'filter_2' },
            },
            {
                id: 'msg_ai_6',
                conversationId,
                senderId: 'ai-agent',
                type: 'ai-status',
                content: 'Found 2 new properties matching your filters',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
            },
            {
                id: 'msg_ai_7',
                conversationId,
                senderId: 'ai-agent',
                type: 'property',
                content: '',
                properties: [generateMockProperty(30)],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 20 * 3600000).toISOString(),
                metadata: { filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
            {
                id: 'msg_ai_8',
                conversationId,
                senderId: 'ai-agent',
                type: 'property-batch',
                content: '5 new properties while you were away',
                properties: Array.from({ length: 5 }, (_, i) => generateMockProperty(40 + i)),
                status: 'delivered',
                createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
                metadata: { batchId: 'batch_2', filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
        ];
    }

    if (conversationId === 'conv_support') {
        return [
            {
                id: 'msg_s_1',
                conversationId,
                senderId: 'support',
                type: 'system',
                content: 'Welcome to RealBro Support! We are here to help you.',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 7 * 24 * 3600000).toISOString(),
            },
            {
                id: 'msg_s_2',
                conversationId,
                senderId: 'support',
                type: 'text',
                content: 'How can we help you?',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
            },
        ];
    }

    // P2P conversations
    const otherUser = conversationId.replace('conv_', '');
    return [
        {
            id: `msg_${conversationId}_1`,
            conversationId,
            senderId: otherUser,
            type: 'text',
            content: 'Hi! I saw the listing you posted.',
            status: 'read',
            createdAt: new Date(now.getTime() - 48 * 3600000).toISOString(),
        },
        {
            id: `msg_${conversationId}_2`,
            conversationId,
            senderId: 'current_user',
            type: 'text',
            content: 'Hello! Yes, it is still available. Would you like to schedule a viewing?',
            status: 'read',
            createdAt: new Date(now.getTime() - 47 * 3600000).toISOString(),
        },
        {
            id: `msg_${conversationId}_3`,
            conversationId,
            senderId: otherUser,
            type: 'text',
            content: 'That would be great! What times work for you?',
            status: 'read',
            createdAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
        },
        {
            id: `msg_${conversationId}_4`,
            conversationId,
            senderId: 'current_user',
            type: 'text',
            content: 'I am available tomorrow afternoon, around 3-5 PM. Does that work?',
            status: 'read',
            createdAt: new Date(now.getTime() - 23 * 3600000).toISOString(),
        },
        {
            id: `msg_${conversationId}_5`,
            conversationId,
            senderId: otherUser,
            type: 'text',
            content: 'Perfect, see you then!',
            status: 'delivered',
            createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
        },
    ];
}

export function generateMockPropertyBatches(): PropertyBatch[] {
    const now = new Date();
    return [
        {
            id: 'batch_today_1',
            properties: Array.from({ length: 5 }, (_, i) => generateMockProperty(100 + i)),
            filterId: 'filter_1',
            filterName: 'Barcelona Center',
            receivedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
            isViewed: false,
        },
        {
            id: 'batch_today_2',
            properties: Array.from({ length: 3 }, (_, i) => generateMockProperty(110 + i)),
            filterId: 'filter_2',
            filterName: 'Gracia Budget',
            receivedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
            isViewed: false,
        },
        {
            id: 'batch_yesterday_1',
            properties: Array.from({ length: 4 }, (_, i) => generateMockProperty(120 + i)),
            filterId: 'filter_1',
            filterName: 'Barcelona Center',
            receivedAt: new Date(now.getTime() - 24 * 3600000).toISOString(),
            isViewed: true,
        },
    ];
}
