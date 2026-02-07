import { NextRequest, NextResponse } from 'next/server';
import { generateMockPropertiesByIds } from '@/shared/api/mocks/properties-mock';

/**
 * POST /api/properties/by-ids
 * Получить объекты по массиву IDs (для кластеров/маркеров)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const ids: string[] = body.ids;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'ids must be a non-empty array' },
                { status: 400 }
            );
        }

        // Mock: генерируем объекты по IDs
        const properties = generateMockPropertiesByIds(ids, {
            cardType: 'grid',
            includeAuthor: true,
            includeTransport: true,
        });

        return NextResponse.json(properties);
    } catch (error) {
        console.error('[API] Failed to get properties by ids:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
