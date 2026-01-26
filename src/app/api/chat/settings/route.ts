import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const defaultSettings = {
    isActive: true,
    notificationStartHour: 7,
    notificationEndHour: 22,
    notificationFrequency: '30min' as const,
    linkedFilterIds: ['filter_1', 'filter_2'],
};

export async function GET() {
    return NextResponse.json(defaultSettings);
}

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const updated = { ...defaultSettings, ...body };
    return NextResponse.json(updated);
}
