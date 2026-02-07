import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Mock: имитируем задержку обработки
    await new Promise((resolve) => setTimeout(resolve, 800));

    const { propertyId, reason, description } = body;

    if (!propertyId || !reason || !description) {
        return NextResponse.json(
            { success: false, error: 'Missing required fields' },
            { status: 400 }
        );
    }

    // Mock: всегда успешный ответ
    return NextResponse.json({
        success: true,
        data: {
            id: `complaint-${Date.now()}`,
            propertyId,
            reason,
            description,
            status: 'pending',
            createdAt: new Date().toISOString(),
        },
    });
}
