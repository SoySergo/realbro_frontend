import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/properties
 * Получить список объектов с пагинацией и фильтрами (mock)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Генерируем mock свойства
    const total = 1234;
    const totalPages = Math.ceil(total / limit);

    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = [
        'Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi',
        'Montjuïc', 'Sants', 'Les Corts', 'Horta-Guinardó',
    ];
    const streets = [
        'Passeig de Gràcia', 'Gran Via', 'Carrer de Aribau', 'Avenida Diagonal',
        'Carrer de Còrsega', 'Carrer del Consell de Cent', 'Carrer de Muntaner', 'Carrer de Mallorca',
    ];

    const imageBase = 'https://images.unsplash.com/photo-';
    const imageIds = [
        '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2',
        '1493809842364-78817add7ffb', '1484154218962-a197022b5858',
        '1574362848149-11496d93a7c7', '1515263487990-61b07816b324',
        '1522708323590-d24dbb6b0267', '1556228578-0d85b1a4d571',
    ];

    const properties = Array.from({ length: limit }, (_, i) => {
        const idx = (page - 1) * limit + i;
        const type = types[idx % types.length];
        const neighborhood = neighborhoods[idx % neighborhoods.length];
        const street = streets[idx % streets.length];

        let bedrooms = 1;
        if (type === 'apartment') bedrooms = (idx % 3) + 2;
        if (type === 'house') bedrooms = (idx % 4) + 3;
        if (type === 'penthouse') bedrooms = (idx % 3) + 3;

        let basePrice = 800;
        if (type === 'studio') basePrice = 600;
        if (type === 'apartment') basePrice = 1000;
        if (type === 'penthouse') basePrice = 2500;
        if (type === 'house') basePrice = 1800;

        const area = 40 + (bedrooms > 1 ? 40 : 0) + (idx * 7) % 80;
        const price = basePrice + (idx * 137) % 1000;

        const images = imageIds
            .slice(0, 4 + (idx % 4))
            .map((id) => `${imageBase}${id}?w=800&h=600&fit=crop&q=80`);

        return {
            id: `prop_${idx}`,
            title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : bedrooms + 'BR'} ${type}`,
            type,
            price,
            pricePerMeter: Math.round(price / area),
            bedrooms,
            bathrooms: (idx % 2) + 1,
            area,
            floor: (idx % 6) + 1,
            totalFloors: (idx % 4) + 5,
            address: `${street}, ${(idx * 13) % 200 + 1}`,
            city: 'Barcelona',
            province: 'Barcelona',
            coordinates: {
                lat: 41.3851 + ((idx * 0.001) % 0.04) - 0.02,
                lng: 2.1734 + ((idx * 0.0013) % 0.04) - 0.02,
            },
            description: `Beautiful ${type} in ${neighborhood}. Perfect for professionals and families.`,
            features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'],
            images,
            isNew: idx % 5 === 0,
            isVerified: idx % 3 !== 0,
            nearbyTransport: {
                type: (['metro', 'train', 'bus'] as const)[idx % 3],
                name: ['Diagonal', 'Passeig de Gràcia', 'Lesseps', 'Fontana'][idx % 4],
                line: `L${(idx % 5) + 1}`,
                color: ['#EE352E', '#0066CC', '#FFC72C', '#339933', '#B51D13'][idx % 5],
                walkMinutes: (idx % 12) + 2,
            },
            author: {
                id: `agent_${idx % 5}`,
                name: ['Maria Garcia', 'José Martinez', 'Ana López', 'Carlos Rodríguez', 'Isabel Fernández'][idx % 5],
                avatar: `https://i.pravatar.cc/150?u=agent_${idx % 5}`,
                type: (['agent', 'owner', 'agency'] as const)[idx % 3],
                isVerified: idx % 3 !== 2,
            },
            createdAt: new Date(Date.now() - (idx * 3600000) % (7 * 86400000)).toISOString(),
            updatedAt: new Date(Date.now() - (idx * 1800000) % (3 * 86400000)).toISOString(),
        };
    });

    // Сортировка
    if (sortBy === 'price') {
        properties.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortBy === 'area') {
        properties.sort((a, b) => sortOrder === 'asc' ? a.area - b.area : b.area - a.area);
    }

    return NextResponse.json({
        data: properties,
        pagination: {
            page,
            limit,
            total,
            totalPages,
        },
    });
}
