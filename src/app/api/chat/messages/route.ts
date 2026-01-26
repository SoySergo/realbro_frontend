import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { conversationId, content } = body;

    const message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId: 'current_user',
        type: 'text',
        content,
        status: 'sent',
        createdAt: new Date().toISOString(),
    };

    return NextResponse.json(message, { status: 201 });
}
