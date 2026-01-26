import { NextResponse } from 'next/server';

export async function GET() {
    const now = new Date();

    return NextResponse.json({
        batches: [
            {
                id: 'batch_1',
                properties: Array.from({ length: 5 }, (_, i) => generateProperty(i)),
                filterId: 'filter_1',
                filterName: 'Barcelona Center',
                receivedAt: new Date(now.getTime() - 30 * 60000).toISOString(),
                isViewed: false,
            },
            {
                id: 'batch_2',
                properties: Array.from({ length: 3 }, (_, i) => generateProperty(10 + i)),
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

function generateProperty(index: number) {
    const types = ['apartment', 'studio', 'house', 'penthouse'] as const;
    const neighborhoods = ['Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià'];
    const type = types[index % types.length];
    const neighborhood = neighborhoods[index % neighborhoods.length];
    const bedrooms = type === 'studio' ? 0 : (index % 3) + 2;
    const area = 55 + index * 12;
    const price = 750 + index * 200;

    return {
        id: `prop_batch_${index}`,
        title: `${neighborhood} - ${bedrooms}BR ${type}`,
        type,
        price,
        pricePerMeter: Math.round(price / area),
        bedrooms,
        bathrooms: 1,
        area,
        floor: (index % 5) + 1,
        totalFloors: 6,
        address: `Gran Via, ${100 + index}`,
        city: 'Barcelona',
        province: 'Barcelona',
        coordinates: { lat: 41.385 + index * 0.003, lng: 2.17 + index * 0.003 },
        description: `A ${type} in ${neighborhood}.`,
        features: ['elevator', 'airConditioning'],
        images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        ],
        isNew: index < 2,
        isVerified: true,
        nearbyTransport: { type: 'metro', name: 'Passeig de Gràcia', line: 'L2', color: '#9B2592', walkMinutes: 5 },
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
