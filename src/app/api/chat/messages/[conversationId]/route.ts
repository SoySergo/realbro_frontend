import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const { conversationId } = await params;
    const now = new Date();

    let messages;

    if (conversationId === 'conv_ai_agent') {
        messages = [
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
                content: 'Searching for properties matching "Barcelona Center"...',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 6 * 24 * 3600000).toISOString(),
            },
            {
                id: 'msg_ai_3',
                conversationId,
                senderId: 'ai-agent',
                type: 'property',
                content: '',
                properties: [generateProperty(0)],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 5 * 24 * 3600000).toISOString(),
                metadata: { filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
            {
                id: 'msg_ai_5',
                conversationId,
                senderId: 'ai-agent',
                type: 'property-batch',
                content: '3 new properties while you were away',
                properties: [generateProperty(1), generateProperty(2), generateProperty(3)],
                status: 'delivered',
                createdAt: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
                metadata: { batchId: 'batch_1', filterName: 'Gracia Budget', filterId: 'filter_2' },
            },
            {
                id: 'msg_ai_7',
                conversationId,
                senderId: 'ai-agent',
                type: 'property-batch',
                content: '5 new properties while you were away',
                properties: Array.from({ length: 5 }, (_, i) => generateProperty(10 + i)),
                status: 'delivered',
                createdAt: new Date(now.getTime() - 30 * 60000).toISOString(),
                metadata: { batchId: 'batch_2', filterName: 'Barcelona Center', filterId: 'filter_1' },
            },
        ];
    } else if (conversationId === 'conv_support') {
        messages = [
            {
                id: 'msg_s_1',
                conversationId,
                senderId: 'support',
                type: 'system',
                content: 'Welcome to RealBro Support!',
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
    } else {
        messages = [
            {
                id: `msg_${conversationId}_1`,
                conversationId,
                senderId: conversationId.replace('conv_', ''),
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
                content: 'Hello! Yes, it is still available.',
                status: 'read',
                createdAt: new Date(now.getTime() - 47 * 3600000).toISOString(),
            },
            {
                id: `msg_${conversationId}_3`,
                conversationId,
                senderId: conversationId.replace('conv_', ''),
                type: 'text',
                content: 'That would be great! What times work for you?',
                status: 'delivered',
                createdAt: new Date(now.getTime() - 5 * 3600000).toISOString(),
            },
        ];
    }

    return NextResponse.json({
        messages,
        pagination: { page: 1, limit: 50, total: messages.length, hasMore: false },
    });
}

function generateProperty(index: number) {
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = ['Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi', 'Sants'];
    const type = types[index % types.length];
    const neighborhood = neighborhoods[index % neighborhoods.length];
    const bedrooms = type === 'studio' ? 0 : (index % 3) + 2;
    const area = 60 + index * 10;
    const price = 800 + index * 150;

    return {
        id: `prop_api_${index}`,
        title: `${neighborhood} - ${bedrooms}BR ${type}`,
        type,
        price,
        pricePerMeter: Math.round(price / area),
        bedrooms,
        bathrooms: 1 + (index % 2),
        area,
        floor: (index % 6) + 1,
        totalFloors: 7,
        address: `Passeig de Gràcia, ${index + 1}`,
        city: 'Barcelona',
        province: 'Barcelona',
        coordinates: { lat: 41.39 + index * 0.002, lng: 2.17 + index * 0.002 },
        description: `Beautiful ${type} in ${neighborhood}.`,
        features: ['parking', 'elevator', 'airConditioning'],
        images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop&q=80',
        ],
        isNew: index % 3 === 0,
        isVerified: true,
        nearbyTransport: {
            type: 'metro',
            name: 'Diagonal',
            line: 'L3',
            color: '#339933',
            walkMinutes: 3 + index,
        },
        author: {
            id: `agent_${index % 3}`,
            name: ['Maria Garcia', 'José Martinez', 'Ana López'][index % 3],
            avatar: `https://i.pravatar.cc/150?u=agent_${index % 3}`,
            type: 'agent',
            isVerified: true,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}
