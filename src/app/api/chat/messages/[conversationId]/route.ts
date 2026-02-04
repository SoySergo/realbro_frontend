import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateMockProperty } from '@/shared/api/mocks/properties-mock';

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
                properties: [generateMockProperty(0, { cardType: 'horizontal' })],
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
                properties: [
                    generateMockProperty(1, { cardType: 'horizontal' }),
                    generateMockProperty(2, { cardType: 'horizontal' }),
                    generateMockProperty(3, { cardType: 'horizontal' })
                ],
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
                properties: Array.from({ length: 5 }, (_, i) => generateMockProperty(10 + i, { cardType: 'horizontal' })),
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
