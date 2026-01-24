'use client';

import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';

const API_BASE = '/api/backend';

export interface PropertiesCountResponse {
    count: number;
}

export interface PropertiesListResponse {
    data: Property[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface PropertiesListParams {
    filters: SearchFilters;
    page?: number;
    limit?: number;
    sortBy?: 'price' | 'area' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Получить количество объектов по фильтрам
 */
export async function getPropertiesCount(filters: SearchFilters): Promise<number> {
    try {
        const params = new URLSearchParams();

        // Serialize filters to query params
        if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
        if (filters.rooms?.length) params.set('rooms', filters.rooms.join(','));
        if (filters.minArea) params.set('minArea', String(filters.minArea));
        if (filters.maxArea) params.set('maxArea', String(filters.maxArea));
        if (filters.categoryIds?.length) params.set('categoryIds', filters.categoryIds.join(','));
        if (filters.markerType && filters.markerType !== 'all') params.set('markerType', filters.markerType);

        // Admin levels for location
        if (filters.adminLevel2?.length) params.set('adminLevel2', filters.adminLevel2.join(','));
        if (filters.adminLevel4?.length) params.set('adminLevel4', filters.adminLevel4.join(','));
        if (filters.adminLevel6?.length) params.set('adminLevel6', filters.adminLevel6.join(','));
        if (filters.adminLevel7?.length) params.set('adminLevel7', filters.adminLevel7.join(','));
        if (filters.adminLevel8?.length) params.set('adminLevel8', filters.adminLevel8.join(','));
        if (filters.adminLevel9?.length) params.set('adminLevel9', filters.adminLevel9.join(','));
        if (filters.adminLevel10?.length) params.set('adminLevel10', filters.adminLevel10.join(','));

        // Geometry for draw/isochrone/radius
        if (filters.geometryIds?.length) params.set('geometryIds', filters.geometryIds.join(','));

        const response = await fetch(`${API_BASE}/properties/count?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PropertiesCountResponse = await response.json();
        return data.count;
    } catch (error) {
        console.error('[API] Failed to get properties count:', error);
        // Return mock count for development
        return Math.floor(Math.random() * 5000) + 100;
    }
}

/**
 * Получить список объектов с пагинацией
 */
export async function getPropertiesList(params: PropertiesListParams): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    try {
        const searchParams = new URLSearchParams();

        // Pagination
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);

        // Serialize filters
        if (filters.minPrice) searchParams.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice) searchParams.set('maxPrice', String(filters.maxPrice));
        if (filters.rooms?.length) searchParams.set('rooms', filters.rooms.join(','));
        if (filters.minArea) searchParams.set('minArea', String(filters.minArea));
        if (filters.maxArea) searchParams.set('maxArea', String(filters.maxArea));
        if (filters.categoryIds?.length) searchParams.set('categoryIds', filters.categoryIds.join(','));
        if (filters.markerType && filters.markerType !== 'all') searchParams.set('markerType', filters.markerType);

        // Admin levels
        if (filters.adminLevel2?.length) searchParams.set('adminLevel2', filters.adminLevel2.join(','));
        if (filters.adminLevel4?.length) searchParams.set('adminLevel4', filters.adminLevel4.join(','));
        if (filters.adminLevel6?.length) searchParams.set('adminLevel6', filters.adminLevel6.join(','));
        if (filters.adminLevel7?.length) searchParams.set('adminLevel7', filters.adminLevel7.join(','));
        if (filters.adminLevel8?.length) searchParams.set('adminLevel8', filters.adminLevel8.join(','));
        if (filters.adminLevel9?.length) searchParams.set('adminLevel9', filters.adminLevel9.join(','));
        if (filters.adminLevel10?.length) searchParams.set('adminLevel10', filters.adminLevel10.join(','));

        // Geometry
        if (filters.geometryIds?.length) searchParams.set('geometryIds', filters.geometryIds.join(','));

        const response = await fetch(`${API_BASE}/properties?${searchParams.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to get properties list:', error);
        // Return mock data for development
        return {
            data: generateMockProperties(limit),
            pagination: {
                page,
                limit,
                total: 1234,
                totalPages: Math.ceil(1234 / limit),
            },
        };
    }
}

/**
 * Сохранить геометрию (polygon/isochrone/radius) на бекенд
 */
export async function saveGeometry(geometry: {
    type: 'polygon' | 'isochrone' | 'radius';
    coordinates: number[][][] | { center: [number, number]; radius: number };
    metadata?: Record<string, unknown>;
}): Promise<{ id: number }> {
    try {
        const response = await fetch(`${API_BASE}/geometries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geometry),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API] Failed to save geometry:', error);
        // Return mock ID for development
        return { id: Date.now() };
    }
}

// Mock data generator for development
function generateMockProperties(count: number): Property[] {
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = [
        'Eixample',
        'Gothic Quarter',
        'Gracia',
        'Sarrià-Sant Gervasi',
        'Montjuïc',
        'Sants',
        'Les Corts',
        'Horta-Guinardó',
    ];
    const streets = [
        'Passeig de Gràcia',
        'Gran Via',
        'Carrer de Aribau',
        'Avenida Diagonal',
        'Carrer de Còrsega',
        'Carrer del Consell de Cent',
        'Carrer de Muntaner',
        'Carrer de Mallorca',
    ];

    // Реальные изображения недвижимости Barcelona
    const imageCollections = [
        [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556020685-abce8704e29c?w=800&h=600&fit=crop&q=80',
        ],
        [
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop&q=80',
        ],
        [
            'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1565182999559-d1e8e5f9ab49?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop&q=80',
        ],
        [
            'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1494203484021-3c454daf695d?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop&q=80',
        ],
    ];

    return Array.from({ length: count }, (_, i) => {
        const type = types[Math.floor(Math.random() * types.length)];
        const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
        const street = streets[Math.floor(Math.random() * streets.length)];
        const collectionIdx = Math.floor(Math.random() * imageCollections.length);
        const images = imageCollections[collectionIdx];

        // Random bedrooms based on type
        let bedrooms = 1;
        if (type === 'apartment') bedrooms = Math.floor(Math.random() * 3) + 2;
        if (type === 'house') bedrooms = Math.floor(Math.random() * 4) + 3;
        if (type === 'penthouse') bedrooms = Math.floor(Math.random() * 3) + 3;

        // Price based on type and area
        let basePrice = 800;
        if (type === 'studio') basePrice = 600;
        if (type === 'apartment') basePrice = 1000;
        if (type === 'penthouse') basePrice = 2500;
        if (type === 'house') basePrice = 1800;

        const area = Math.floor(Math.random() * 80) + (bedrooms > 1 ? 80 : 40);
        const price = Math.floor(basePrice + Math.random() * 1000);

        return {
            id: `prop_barcelona_${i}`,
            title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : bedrooms + 'BR'} ${type}`,
            type,
            price,
            pricePerMeter: Math.round(price / area),
            bedrooms,
            bathrooms: Math.floor(Math.random() * 2) + 1,
            area,
            floor: Math.floor(Math.random() * 6) + 1,
            totalFloors: Math.floor(Math.random() * 4) + 5,
            address: `${street}, ${Math.floor(Math.random() * 200) + 1}`,
            city: 'Barcelona',
            province: 'Barcelona',
            coordinates: {
                lat: 41.3851 + (Math.random() - 0.5) * 0.08,
                lng: 2.1734 + (Math.random() - 0.5) * 0.08,
            },
            description: `Beautiful ${type} in the heart of Barcelona. Perfect for professionals and families.`,
            features: [
                'parking',
                'elevator',
                'airConditioning',
                'balcony',
                'furnished',
            ] as Property['features'],
            images,
            isNew: Math.random() > 0.7,
            isVerified: Math.random() > 0.3,
            nearbyTransport: {
                type: ['metro', 'train', 'bus'][Math.floor(Math.random() * 3)] as any,
                name: ['Diagonal', 'Passeig de Gràcia', 'Lesseps', 'Fontana'][
                    Math.floor(Math.random() * 4)
                ],
                line: `L${Math.floor(Math.random() * 5) + 1}`,
                color: ['#EE352E', '#0066CC', '#FFC72C', '#339933', '#B51D13'][
                    Math.floor(Math.random() * 5)
                ],
                walkMinutes: Math.floor(Math.random() * 12) + 2,
            },
            author: {
                id: `agent_${i % 5}`,
                name: [
                    'Maria Garcia',
                    'José Martinez',
                    'Ana López',
                    'Carlos Rodríguez',
                    'Isabel Fernández',
                ][i % 5],
                avatar: `https://i.pravatar.cc/150?u=agent_${i % 5}`,
                type: ['agent', 'owner', 'agency'][Math.floor(Math.random() * 3)] as any,
                isVerified: Math.random() > 0.4,
                agencyName:
                    Math.random() > 0.5
                        ? ['Barcelona Real Estate', 'Casa Perfecta', 'La Llave'][
                              Math.floor(Math.random() * 3)
                          ]
                        : undefined,
            },
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
            updatedAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
        };
    });
}
