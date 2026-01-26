import type { SearchFilters } from '@/entities/filter';
import type { Property } from '@/entities/property';

const API_BASE = process.env.BACKEND_URL || 'http://localhost:3001/api';

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
 * Сериализация фильтров в URLSearchParams
 */
function serializeFilters(filters: SearchFilters, params: URLSearchParams): void {
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
}

/**
 * Серверная функция для получения списка объектов (для ISR/SSR)
 * Используется в Server Components
 */
export async function getPropertiesListServer(
    params: PropertiesListParams
): Promise<PropertiesListResponse> {
    const { filters, page = 1, limit = 24, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    try {
        const searchParams = new URLSearchParams();

        // Pagination
        searchParams.set('page', String(page));
        searchParams.set('limit', String(limit));
        searchParams.set('sortBy', sortBy);
        searchParams.set('sortOrder', sortOrder);

        // Serialize filters
        serializeFilters(filters, searchParams);

        const response = await fetch(`${API_BASE}/properties?${searchParams.toString()}`, {
            next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('[API Server] Failed to get properties list:', error);
        // Return mock data for development
        return {
            data: generateMockProperties(limit, page),
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
 * Серверная функция для получения количества объектов
 */
export async function getPropertiesCountServer(filters: SearchFilters): Promise<number> {
    try {
        const params = new URLSearchParams();
        serializeFilters(filters, params);

        const response = await fetch(`${API_BASE}/properties/count?${params.toString()}`, {
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('[API Server] Failed to get properties count:', error);
        return Math.floor(Math.random() * 5000) + 100;
    }
}

/**
 * Парсинг фильтров из URL search params
 */
export function parseFiltersFromSearchParams(
    searchParams: Record<string, string | string[] | undefined>
): SearchFilters {
    const filters: SearchFilters = {};

    // Parse price
    if (searchParams.minPrice) {
        filters.minPrice = Number(searchParams.minPrice);
    }
    if (searchParams.maxPrice) {
        filters.maxPrice = Number(searchParams.maxPrice);
    }

    // Parse rooms
    if (searchParams.rooms) {
        const roomsStr = Array.isArray(searchParams.rooms) ? searchParams.rooms[0] : searchParams.rooms;
        filters.rooms = roomsStr.split(',').map(Number);
    }

    // Parse area
    if (searchParams.minArea) {
        filters.minArea = Number(searchParams.minArea);
    }
    if (searchParams.maxArea) {
        filters.maxArea = Number(searchParams.maxArea);
    }

    // Parse categories
    if (searchParams.categoryIds) {
        const catStr = Array.isArray(searchParams.categoryIds) ? searchParams.categoryIds[0] : searchParams.categoryIds;
        filters.categoryIds = catStr.split(',').map(Number);
    }

    // Parse marker type
    if (searchParams.markerType) {
        filters.markerType = searchParams.markerType as SearchFilters['markerType'];
    }

    // Parse admin levels
    const adminLevels = [2, 4, 6, 7, 8, 9, 10] as const;
    for (const level of adminLevels) {
        const key = `adminLevel${level}` as keyof SearchFilters;
        if (searchParams[key]) {
            const val = Array.isArray(searchParams[key]) ? searchParams[key][0] : searchParams[key];
            (filters as any)[key] = val?.split(',').map(Number);
        }
    }

    // Parse geometry
    if (searchParams.geometryIds) {
        const geoStr = Array.isArray(searchParams.geometryIds) ? searchParams.geometryIds[0] : searchParams.geometryIds;
        filters.geometryIds = geoStr.split(',').map(Number);
    }

    // Sort
    if (searchParams.sort) {
        filters.sort = searchParams.sort as SearchFilters['sort'];
    }
    if (searchParams.sortOrder) {
        filters.sortOrder = searchParams.sortOrder as SearchFilters['sortOrder'];
    }

    return filters;
}

// Mock data generator for development (same as client version)
function generateMockProperties(count: number, page: number = 1): Property[] {
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const neighborhoods = [
        'Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi',
        'Montjuïc', 'Sants', 'Les Corts', 'Horta-Guinardó',
    ];
    const streets = [
        'Passeig de Gràcia', 'Gran Via', 'Carrer de Aribau', 'Avenida Diagonal',
        'Carrer de Còrsega', 'Carrer del Consell de Cent', 'Carrer de Muntaner', 'Carrer de Mallorca',
    ];

    const imageCollections = [
        [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop&q=80',
        ],
        [
            'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop&q=80',
            'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop&q=80',
        ],
    ];

    // Сдвиг индекса на основе страницы для разных данных
    const offset = (page - 1) * count;

    return Array.from({ length: count }, (_, i) => {
        const idx = offset + i;
        const type = types[idx % types.length];
        const neighborhood = neighborhoods[idx % neighborhoods.length];
        const street = streets[idx % streets.length];
        const collectionIdx = idx % imageCollections.length;
        const images = imageCollections[collectionIdx];

        let bedrooms = 1;
        if (type === 'apartment') bedrooms = (idx % 3) + 2;
        if (type === 'house') bedrooms = (idx % 4) + 3;
        if (type === 'penthouse') bedrooms = (idx % 3) + 3;

        let basePrice = 800;
        if (type === 'studio') basePrice = 600;
        if (type === 'apartment') basePrice = 1000;
        if (type === 'penthouse') basePrice = 2500;
        if (type === 'house') basePrice = 1800;

        const area = 80 + (idx % 80) + (bedrooms > 1 ? 40 : 0);
        const price = basePrice + (idx % 1000);

        return {
            id: `prop_barcelona_${idx}`,
            title: `${neighborhood} - ${type === 'studio' ? 'Estudio' : bedrooms + 'BR'} ${type}`,
            type,
            price,
            pricePerMeter: Math.round(price / area),
            bedrooms,
            bathrooms: (idx % 2) + 1,
            area,
            floor: (idx % 6) + 1,
            totalFloors: (idx % 4) + 5,
            address: `${street}, ${(idx % 200) + 1}`,
            city: 'Barcelona',
            province: 'Barcelona',
            coordinates: {
                lat: 41.3851 + ((idx % 100) - 50) * 0.001,
                lng: 2.1734 + ((idx % 100) - 50) * 0.001,
            },
            description: `Beautiful ${type} in the heart of Barcelona. Perfect for professionals and families.`,
            features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'] as Property['features'],
            images,
            isNew: idx % 3 === 0,
            isVerified: idx % 2 === 0,
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
                isVerified: idx % 2 === 0,
            },
            createdAt: new Date(Date.now() - (idx % 7) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - (idx % 3) * 24 * 60 * 60 * 1000),
        };
    });
}
