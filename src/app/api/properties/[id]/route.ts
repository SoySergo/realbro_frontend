import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    // Simulate network delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Valid mock IDs format: prop_123
    // We can extract the index from the ID to generate deterministic data
    let idx = 0;
    if (id.startsWith('prop_')) {
        const parts = id.split('_');
        if (parts.length > 1 && !isNaN(Number(parts[1]))) {
            idx = Number(parts[1]);
        }
    } else {
        // Fallback for non-standard IDs
        idx = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }

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

    const type = types[idx % types.length];
    const neighborhood = neighborhoods[idx % neighborhoods.length];
    const street = streets[idx % streets.length];

    let rooms = 1;
    if (type === 'apartment') rooms = (idx % 3) + 2;
    if (type === 'house') rooms = (idx % 4) + 3;
    if (type === 'penthouse') rooms = (idx % 3) + 3;

    let basePrice = 800;
    if (type === 'studio') basePrice = 600;
    if (type === 'apartment') basePrice = 1000;
    if (type === 'penthouse') basePrice = 2500;
    if (type === 'house') basePrice = 1800;

    const area = 40 + (rooms > 1 ? 40 : 0) + (idx * 7) % 80;
    const price = basePrice + (idx * 137) % 1000;

    const images = imageIds
        .slice(0, 4 + (idx % 5)) // slightly different logic for variety
        .map((imgId) => `${imageBase}${imgId}?w=1200`);

    const property = {
        id, // Return the requested ID
        title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : rooms + 'R'} ${type}`,
        type,
        price,
        pricePerMeter: Math.round(price / area),
        rooms,
        bathrooms: (idx % 2) + 1,
        area,
        livingArea: Math.floor(area * 0.7),
        kitchenArea: Math.floor(area * 0.15),
        floor: (idx % 6) + 1,
        totalFloors: (idx % 4) + 5,
        ceilingHeight: 2.7 + (idx % 5) / 10,
        address: `${street}, ${(idx * 13) % 200 + 1}`,
        city: 'Barcelona',
        province: 'Barcelona',
        coordinates: {
            lat: 41.3851 + ((idx * 0.001) % 0.04) - 0.02,
            lng: 2.1734 + ((idx * 0.0013) % 0.04) - 0.02,
        },
        description: `Beautiful ${type} in ${neighborhood}. Fully furnished and ready to move in. \n\nLocated in a prime area with excellent transport links. The apartment features high ceilings, large windows, and modern amenities. \n\nRecent renovation, separate kitchen with all appliances. Ideal for families or professionals.`,
        features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'],
        amenities: ['wifi', 'airConditioning', 'washingMachine', 'elevator', 'balcony', 'kitchen'], // expanded mocks
        images,
        isNew: idx % 5 === 0,
        isVerified: idx % 3 !== 0,
        nearbyTransportList: [
             { type: 'metro', name: 'Diagonal', line: 'L3', color: '#33A02C', walkMinutes: 5 },
             { type: 'bus', name: 'V15', walkMinutes: 2 }
        ],
        author: {
            id: `agent_${idx % 5}`,
            name: ['Maria Garcia', 'José Martinez', 'Ana López', 'Carlos Rodríguez', 'Isabel Fernández'][idx % 5],
            avatar: `https://i.pravatar.cc/150?u=agent_${idx % 5}`,
            type: (['agent', 'owner', 'agency'] as const)[idx % 3],
            phone: '+34 600 000 000',
            isVerified: idx % 3 !== 2,
            agencyName: idx % 2 === 0 ? 'Barcelona Homes' : undefined
        },
        createdAt: new Date(Date.now() - (idx * 3600000) % (7 * 86400000)).toISOString(),
        updatedAt: new Date().toISOString(), // Always updated "now" for "today" look
        viewsCount: 1216 + (idx * 15) % 500,
        viewsToday: 33 + (idx * 2) % 10,
        
        // Extra fields
        rentalConditions: {
            deposit: price,
            commission: 50,
            commissionType: 'percent',
            prepaymentMonths: 1,
            utilitiesIncluded: false,
            utilitiesAmount: 150,
            petsAllowed: idx % 2 === 0,
            childrenAllowed: true,
            minRentalMonths: (idx % 3) * 6 + 1 // 1, 7, 13 months
        },
        tenantPreferences: {
            minRentalMonths: (idx % 3) * 6 + 1,
            prepaymentMonths: idx % 2 === 0 ? 1 : 2,
            petsAllowed: idx % 2 === 0,
            childrenAllowed: true,
            ageRange: [20 + (idx % 10), 40 + (idx % 10)],
            gender: idx % 3 === 0 ? 'any' : (idx % 3 === 1 ? 'male' : 'female'),
            occupation: idx % 2 === 0 ? 'any' : 'student',
            couplesAllowed: idx % 2 === 0,
            smokingAllowed: false
        },
        roommates: {
            gender: idx % 3 === 0 ? 'mix' : (idx % 3 === 1 ? 'female' : 'male'),
            ageRange: [20 + (idx % 5), 30 + (idx % 10)],
            occupation: idx % 2 === 0 ? 'worker' : 'student',
            ownerLivesIn: idx % 2 === 0,
            atmosphere: idx % 2 === 0 ? 'quiet' : 'friendly',
            visitsAllowed: true
        },
        roomDetails: {
            furnished: true,
            bedType: 'double',
            amenities: ['wifi', 'airConditioning'],
            windowView: 'street'
        },
        building: {
            name: 'Casa Milà Neighbor',
            type: 'brick',
            year: 1950 + (idx % 70),
            floorsTotal: (idx % 4) + 5,
            elevatorPassenger: 1,
            parkingType: 'underground',
            closedTerritory: idx % 2 === 0
        },
        video: {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Mock video
            thumbnail: images[0]
        },
        tour3d: {
            url: 'https://my.matterport.com/show/?m=5cTrQWja5Ku', // Mock 3D tour
            thumbnail: images[1] || images[0]
        },
        floorPlan: 'https://images.unsplash.com/photo-1536895058696-a69b1c7ba34d?auto=format&fit=crop&w=800&q=80' // Mock floor plan
    };

    return NextResponse.json(property);
}
