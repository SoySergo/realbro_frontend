import { NextResponse } from 'next/server';
import { generateMockProperty } from '@/shared/api/mocks/properties-mock';

export async function GET() {
    const now = new Date();

    return NextResponse.json({
        batches: [
            {
                id: 'batch_1',
                properties: Array.from({ length: 5 }, (_, i) => generateMockProperty(i, { cardType: 'horizontal' })),
                filterId: 'filter_1',
                filterName: 'Barcelona Center',
                receivedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
                isViewed: false,
            },
            {
                id: 'batch_2',
                properties: Array.from({ length: 3 }, (_, i) => generateMockProperty(10 + i, { cardType: 'horizontal' })),
                filterId: 'filter_2',
                filterName: 'Gracia Budget',
                receivedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
                isViewed: false,
            },
        ],
        totalProperties: 8,
        filters: [
            { id: 'filter_1', name: 'Barcelona Center', count: 5 },
            { id: 'filter_2', name: 'Gracia Budget', count: 3 },
        ],
    });
}
