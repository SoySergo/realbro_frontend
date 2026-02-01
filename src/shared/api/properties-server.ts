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
 * Получить объект недвижимости по ID (для ISR/SSR)
 */
export async function getPropertyByIdServer(id: string): Promise<Property | null> {
    try {
        const response = await fetch(`${API_BASE}/properties/${id}`, {
            next: { revalidate: 21600 }, // ISR: revalidate every 6 hours
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            // Fallback for demo if API fails
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API Server] Failed to get property ${id}:`, error);
        
        // Return mock for specific ID or Generate one
        const mockList = generateMockProperties(1);
        const mockProperty = mockList[0];
        mockProperty.id = id;
        return mockProperty;
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
            rooms: bedrooms + 1,
            bathrooms: (idx % 2) + 1,
            area,
            livingArea: Math.floor(area * 0.7),
            kitchenArea: Math.floor(area * 0.15),
            ceilingHeight: 2.7 + (idx % 5) / 10,
            floor: (idx % 6) + 1,
            totalFloors: (idx % 4) + 5,
            address: `${street}, ${(idx % 200) + 1}`,
            city: 'Barcelona',
            province: 'Barcelona',
            coordinates: {
                lat: 41.3851 + ((idx % 100) - 50) * 0.001,
                lng: 2.1734 + ((idx % 100) - 50) * 0.001,
            },
            description: `Представляем вашему вниманию эту великолепную недвижимость, расположенную в одном из самых востребованных районов Барселоны. Эта светлая и просторная квартира была недавно отремонтирована с использованием высококачественных материалов и готова к заселению.\n\nПросторная и светлая гостиная: Идеальное место для отдыха и приема гостей, с прямым выходом на большой балкон (или террасу), откуда открывается потрясающий вид на город (или море/горы). Гостиная оснащена современной мебелью и стильными элементами декора, создающими уютную атмосферу.\n\nСовременная кухня: Полностью оборудованная новой бытовой техникой премиум-класса (холодильник, духовка, посудомоечная машина, микроволновая печь). Стильный дизайн с функциональными шкафами и рабочей поверхностью из натурального камня. Здесь вы найдете все необходимое для приготовления изысканных блюд.\n\nУютные спальни: Две просторные спальни с двуспальными кроватями, встроенными шкафами и большими окнами, обеспечивающими естественное освещение. Главная спальня имеет собственную ванную команду для вашего удобства. Вторая спальня идеально подойдет для гостей или детей.\n\nРоскошные ванные комнаты: Две современные ванные комнаты, отделанные итальянской плиткой, с душевыми кабинами (или ванной) и качественной сантехникой. Подогрев полов добавит комфорта в холодное время года.\n\nКомфорт и удобства:\nКондиционер и автономное отопление для поддержания идеальной температуры круглый год.\nПаркетные полы из натурального дерева, придающие тепло и уют всей квартире.\nДвойные стеклопакеты для отличной звукоизоляции от городского шума.\nВидеодомофон и надежная входная дверь с системой против взлома.\nВысокоскоростной интернет проведен в каждую комнату.\n\nЗдание и инфраструктура:\nДом с лифтом и ухоженным подъездом, где регулярно проводится уборка.\nВозможность аренды (или покупки) парковочного места в подземном гараже под зданием.\nКладовая для хранения крупногабаритных вещей расположена на цокольном этаже.\nОбщая терраса на крыше с панорамным видом на Барселону для всех жильцов.\n\nРасположение:\nКвартира находится в шаговой доступности от метро (название станции) и автобусных остановок нескольких маршрутов.\nРядом расположены престижные школы, детские сады с международным обучением, современные супермаркеты, аптеки, зеленые парки и фитнес-центры с бассейнами.\nВсего в 15 минутах ходьбы от знаменитого пляжа Барселонеты.\n\nЭта недвижимость станет идеальным домом для семьи или пары, ценящих комфорт, стиль и удобное расположение в центре событий. Квартира полностью меблирована и укомплектована всем необходимым. Не упустите свой шанс жить в одном из лучших городов мира! Звоните прямо сейчас, чтобы договориться о просмотре в удобное для вас время. Мы также предлагаем онлайн-показ недвижимости для иностранных клиентов.`,
            descriptionOriginal: `We present to your attention this magnificent property located in one of the most sought-after areas of Barcelona. This bright and spacious apartment has been recently renovated using high-quality materials and is ready to move in.\n\nSpacious and bright living room: An ideal place for relaxing and receiving guests, with direct access to a large balcony (or terrace), offering a stunning view of the city (or sea/mountains). The living room is equipped with modern furniture and stylish decorative elements that create a cozy atmosphere.\n\nModern kitchen: Fully equipped with new premium appliances (refrigerator, oven, dishwasher, microwave). Stylish design with functional cabinets and natural stone worktop. Here you will find everything you need to prepare gourmet meals.\n\nCozy bedrooms: Two spacious bedrooms with double beds, built-in wardrobes and large windows providing natural light. The master bedroom has an en-suite bathroom for your convenience. The second bedroom is ideal for guests or children.`,
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
            
            // Extra fields for PropertyMainInfo
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
            amenities: ['wifi', 'airConditioning', 'washingMachine', 'elevator', 'balcony', 'kitchen'],
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
    });
}
