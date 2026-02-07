import type { 
    Property, 
    PropertyAuthor, 
    NearbyTransport, 
    RentalConditions, 
    TenantPreferences, 
    BuildingInfo 
} from '@/entities/property';

// Конфигурация для генерации моков
export interface MockPropertyConfig {
    // Базовые настройки
    locale?: 'en' | 'ru' | 'es' | 'ca' | 'fr' | 'it' | 'pt' | 'de' | 'uk';
    currency?: 'EUR' | 'USD' | 'RUB';
    
    // Контроль данных
    includeAuthor?: boolean;
    includeTransport?: boolean;
    includeRentalConditions?: boolean;
    includeTenantPreferences?: boolean;
    includeBuilding?: boolean;
    includeRoommates?: boolean;
    
    // Тип карточки (влияет на обязательные поля)
    cardType?: 'grid' | 'horizontal' | 'sidebar' | 'detail';
}

// Локации (Барселона)
const MOCK_NEIGHBORHOODS = [
    'Eixample', 'Gothic Quarter', 'Gracia', 'Sarrià-Sant Gervasi',
    'Montjuïc', 'Sants', 'Les Corts', 'Horta-Guinardó', 'Poble Sec',
    'El Born', 'Barceloneta', 'Sant Antoni', 'Poblenou', 'La Ribera'
];

const MOCK_STREETS = [
    'Passeig de Gràcia', 'Gran Via', 'Carrer de Aribau', 'Avenida Diagonal',
    'Carrer de Còrsega', 'Carrer del Consell de Cent', 'Carrer de Muntaner',
    'Carrer de Mallorca', 'Rambla de Catalunya', 'Carrer de Balmes'
];

// Авторы
const MOCK_AUTHORS: PropertyAuthor[] = [
    {
        id: 'agent_1',
        name: 'Maria Garcia',
        avatar: 'https://i.pravatar.cc/150?u=maria',
        type: 'agent',
        agencyName: 'Barcelona Real Estate',
        isVerified: true,
        isSuperAgent: true,
        yearsOnPlatform: 5,
        objectsCount: 45
    },
    {
        id: 'agent_2',
        name: 'José Martinez',
        avatar: 'https://i.pravatar.cc/150?u=jose',
        type: 'agent',
        agencyName: 'Casa Perfecta',
        isVerified: true,
        isSuperAgent: false,
        yearsOnPlatform: 3,
        objectsCount: 28
    },
    {
        id: 'agent_3',
        name: 'Ana López',
        avatar: 'https://i.pravatar.cc/150?u=ana',
        type: 'owner',
        isVerified: true,
        yearsOnPlatform: 2,
        objectsCount: 5
    },
    {
        id: 'agent_4',
        name: 'Carlos Rodríguez',
        avatar: 'https://i.pravatar.cc/150?u=carlos',
        type: 'agent',
        agencyName: 'La Llave Inmobiliaria',
        isVerified: true,
        isSuperAgent: true,
        yearsOnPlatform: 7,
        objectsCount: 62
    },
    {
        id: 'agent_5',
        name: 'Isabel Fernández',
        avatar: 'https://i.pravatar.cc/150?u=isabel',
        type: 'agency',
        agencyName: 'BCN Properties Group',
        isVerified: true,
        isSuperAgent: false,
        yearsOnPlatform: 4,
        objectsCount: 38
    }
];

// Транспорт
const MOCK_TRANSPORT: NearbyTransport[] = [
    { type: 'metro', name: 'Diagonal', line: 'L3', color: '#339933', walkMinutes: 5 },
    { type: 'metro', name: 'Passeig de Gràcia', line: 'L2', color: '#9B59B6', walkMinutes: 3 },
    { type: 'metro', name: 'Lesseps', line: 'L3', color: '#339933', walkMinutes: 7 },
    { type: 'metro', name: 'Fontana', line: 'L3', color: '#339933', walkMinutes: 4 },
    { type: 'metro', name: 'Sagrada Familia', line: 'L5', color: '#0066CC', walkMinutes: 6 },
    { type: 'metro', name: 'Catalunya', line: 'L1', color: '#EE352E', walkMinutes: 8 },
    { type: 'train', name: 'Sants Estació', line: 'R2', color: '#005EB8', walkMinutes: 10 },
    { type: 'train', name: 'Arc de Triomf', line: 'R1', color: '#009B3A', walkMinutes: 6 },
    { type: 'bus', name: 'Via Augusta', line: '22', color: '#FFC72C', walkMinutes: 2 },
    { type: 'bus', name: 'Gran Via', line: '55', color: '#FFC72C', walkMinutes: 3 }
];

// Коллекции изображений (реалистичные интерьеры квартир)
const IMAGE_COLLECTIONS = [
    [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=600&fit=crop&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1565182999559-d1e8e5f9ab49?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1523755231516-e43fd2e8dca5?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494203484021-3c454daf695d?w=800&h=600&fit=crop&q=80'
    ],
    [
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1556020685-abce8704e29c?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop&q=80',
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop&q=80'
    ]
];

// Описания на разных языках
const DESCRIPTIONS = {
    ru: [
        'Просторная квартира в самом сердце Барселоны с прекрасным видом. Идеально подходит для семей и профессионалов.',
        'Современная студия с качественным ремонтом. Все необходимое для комфортной жизни в шаговой доступности.',
        'Уютная квартира в тихом районе. Отличная транспортная доступность, рядом парки и магазины.',
        'Элегантная недвижимость с высокими потолками и естественным светом. Премиум-класс в престижном районе.',
        'Светлая квартира после ремонта. Идеальный вариант для долгосрочной аренды.'
    ],
    en: [
        'Spacious apartment in the heart of Barcelona with wonderful views. Perfect for families and professionals.',
        'Modern studio with quality renovation. Everything you need for comfortable living within walking distance.',
        'Cozy apartment in a quiet neighborhood. Excellent transport accessibility, near parks and shops.',
        'Elegant property with high ceilings and natural light. Premium class in a prestigious area.',
        'Bright renovated apartment. Ideal option for long-term rental.'
    ],
    es: [
        'Amplio apartamento en el corazón de Barcelona con maravillosas vistas. Perfecto para familias y profesionales.',
        'Estudio moderno con reforma de calidad. Todo lo necesario para vivir cómodamente a poca distancia.',
        'Apartamento acogedor en un barrio tranquilo. Excelente acceso al transporte, cerca de parques y tiendas.',
        'Propiedad elegante con techos altos y luz natural. Clase premium en una zona prestigiosa.',
        'Apartamento luminoso recién reformado. Opción ideal para alquiler a largo plazo.'
    ],
    ca: [
        'Ampli apartament al cor de Barcelona amb vistes meravelloses. Perfecte per a famílies i professionals.',
        'Estudi modern amb reforma de qualitat. Tot el necessari per viure còmodament a prop.',
        'Apartament acollidor en un barri tranquil. Excel·lent accés al transport, prop de parcs i botigues.',
        'Propietat elegant amb sostres alts i llum natural. Classe premium en una zona prestigiosa.',
        'Apartament lluminós recentment reformat. Opció ideal per a lloguer a llarg termini.'
    ],
    fr: [
        'Appartement spacieux au cœur de Barcelone avec de belles vues. Parfait pour les familles et les professionnels.',
        'Studio moderne avec rénovation de qualité. Tout le nécessaire pour vivre confortablement à proximité.',
        'Appartement confortable dans un quartier calme. Excellent accès aux transports, près des parcs et des magasins.',
        'Propriété élégante avec hauts plafonds et lumière naturelle. Classe premium dans un quartier prestigieux.',
        'Appartement lumineux récemment rénové. Option idéale pour location à long terme.'
    ]
};

// Детальные описания для типа карточки 'detail'
const DETAILED_DESCRIPTIONS = {
    ru: `Представляем вашему вниманию эту великолепную недвижимость, расположенную в одном из самых востребованных районов Барселоны. Эта светлая и просторная квартира была недавно отремонтирована с использованием высококачественных материалов и готова к заселению.

Просторная и светлая гостиная: Идеальное место для отдыха и приема гостей, с прямым выходом на большой балкон, откуда открывается потрясающий вид на город. Гостиная оснащена современной мебелью и стильными элементами декора, создающими уютную атмосферу.

Современная кухня: Полностью оборудованная новой бытовой техникой премиум-класса (холодильник, духовка, посудомоечная машина, микроволновая печь). Стильный дизайн с функциональными шкафами и рабочей поверхностью из натурального камня.

Уютные спальни: Просторные спальни с встроенными шкафами и большими окнами, обеспечивающими естественное освещение. Главная спальня имеет собственную ванную комнату для вашего удобства.

Роскошные ванные комнаты: Современные ванные комнаты, отделанные итальянской плиткой, с душевыми кабинами и качественной сантехникой. Подогрев полов добавит комфорта.`,
    
    en: `We present to your attention this magnificent property located in one of the most sought-after areas of Barcelona. This bright and spacious apartment has been recently renovated using high-quality materials and is ready to move in.

Spacious and bright living room: An ideal place for relaxing and receiving guests, with direct access to a large balcony offering a stunning view of the city. The living room is equipped with modern furniture and stylish decorative elements.

Modern kitchen: Fully equipped with new premium appliances (refrigerator, oven, dishwasher, microwave). Stylish design with functional cabinets and natural stone worktop.

Cozy bedrooms: Spacious bedrooms with built-in wardrobes and large windows providing natural light. The master bedroom has an en-suite bathroom for your convenience.

Luxurious bathrooms: Modern bathrooms finished with Italian tiles, with shower cabins and quality fixtures. Underfloor heating adds comfort.`,
    
    es: `Presentamos a su atención esta magnífica propiedad ubicada en una de las zonas más demandadas de Barcelona. Este apartamento luminoso y espacioso ha sido recientemente renovado con materiales de alta calidad y está listo para mudarse.

Salón amplio y luminoso: Un lugar ideal para relajarse y recibir invitados, con acceso directo a un gran balcón que ofrece una vista impresionante de la ciudad. El salón está equipado con muebles modernos y elementos decorativos elegantes.

Cocina moderna: Totalmente equipada con electrodomésticos premium nuevos (refrigerador, horno, lavavajillas, microondas). Diseño elegante con armarios funcionales y encimera de piedra natural.

Dormitorios acogedores: Dormitorios espaciosos con armarios empotrados y grandes ventanas que proporcionan luz natural. El dormitorio principal tiene baño privado para su comodidad.

Baños lujosos: Baños modernos terminados con azulejos italianos, con cabinas de ducha y accesorios de calidad. La calefacción por suelo radiante añade confort.`
};

/**
 * Генерация одного объекта недвижимости
 */
export function generateMockProperty(
    index: number, 
    config: MockPropertyConfig = {}
): Property {
    const {
        locale = 'ru',
        currency = 'EUR',
        includeAuthor = true,
        includeTransport = true,
        includeRentalConditions = false,
        includeTenantPreferences = false,
        includeBuilding = false,
        includeRoommates = false,
        cardType = 'grid'
    } = config;

    // Выбор базовых параметров
    const types = ['apartment', 'studio', 'house', 'penthouse', 'duplex'] as const;
    const type = types[index % types.length];
    const neighborhood = MOCK_NEIGHBORHOODS[index % MOCK_NEIGHBORHOODS.length];
    const street = MOCK_STREETS[index % MOCK_STREETS.length];
    
    // Изображения
    const collectionIdx = index % IMAGE_COLLECTIONS.length;
    const images = cardType === 'sidebar' 
        ? [IMAGE_COLLECTIONS[collectionIdx][0]] 
        : IMAGE_COLLECTIONS[collectionIdx];

    // Количество комнат в зависимости от типа
    let bedrooms = 1;
    if (type === 'apartment') bedrooms = (index % 3) + 2;
    if (type === 'house') bedrooms = (index % 4) + 3;
    if (type === 'penthouse') bedrooms = (index % 3) + 3;
    if (type === 'duplex') bedrooms = (index % 3) + 2;

    // Цена в зависимости от типа
    let basePrice = 800;
    if (type === 'studio') basePrice = 600;
    if (type === 'apartment') basePrice = 1000;
    if (type === 'penthouse') basePrice = 2500;
    if (type === 'house') basePrice = 1800;
    if (type === 'duplex') basePrice = 1400;

    const area = 80 + (index % 80) + (bedrooms > 1 ? 40 : 0);
    const price = basePrice + (index % 1000);

    // Описание в зависимости от типа карточки и языка
    let description: string;
    if (cardType === 'detail') {
        description = DETAILED_DESCRIPTIONS[locale as keyof typeof DETAILED_DESCRIPTIONS] 
            || DETAILED_DESCRIPTIONS.en;
    } else {
        const descriptions = DESCRIPTIONS[locale as keyof typeof DESCRIPTIONS] || DESCRIPTIONS.en;
        description = descriptions[index % descriptions.length];
    }

    // Базовые поля
    const property: Property = {
        id: `prop_barcelona_${index}`,
        title: `${neighborhood} - ${type === 'studio' ? 'Studio' : bedrooms + 'BR'} ${type}`,
        type,
        price,
        pricePerMeter: Math.round(price / area),
        rooms: bedrooms,
        bathrooms: (index % 2) + 1,
        area,
        floor: (index % 6) + 1,
        totalFloors: (index % 4) + 5,
        address: `${street}, ${(index % 200) + 1}`,
        city: 'Barcelona',
        province: 'Barcelona',
        coordinates: {
            lat: 41.3851 + ((index % 100) - 50) * 0.001,
            lng: 2.1734 + ((index % 100) - 50) * 0.001,
        },
        description,
        features: ['parking', 'elevator', 'airConditioning', 'balcony', 'furnished'],
        images,
        isNew: index % 3 === 0,
        isVerified: index % 2 === 0,
        createdAt: new Date(Date.now() - (index % 7) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - (index % 3) * 24 * 60 * 60 * 1000),
    };

    // Дополнительные поля для horizontal и detail карточек
    if (cardType === 'horizontal' || cardType === 'detail') {
        property.livingArea = Math.floor(area * 0.7);
        property.kitchenArea = Math.floor(area * 0.15);
        property.ceilingHeight = 2.7 + (index % 5) / 10;
    }

    // Автор
    if (includeAuthor) {
        property.author = MOCK_AUTHORS[index % MOCK_AUTHORS.length];
    }

    // Транспорт
    if (includeTransport) {
        property.nearbyTransport = MOCK_TRANSPORT[index % MOCK_TRANSPORT.length];
    }

    // Условия аренды
    if (includeRentalConditions || cardType === 'detail') {
        property.rentalConditions = {
            deposit: price,
            commission: 50,
            commissionType: 'percent',
            prepaymentMonths: 1,
            utilitiesIncluded: false,
            utilitiesAmount: 150,
            petsAllowed: index % 2 === 0,
            childrenAllowed: true,
            minRentalMonths: (index % 3) * 6 + 1
        };
    }

    // Предпочтения по арендаторам
    if (includeTenantPreferences || cardType === 'detail') {
        property.tenantPreferences = {
            minRentalMonths: (index % 3) * 6 + 1,
            prepaymentMonths: index % 2 === 0 ? 1 : 2,
            petsAllowed: index % 2 === 0,
            childrenAllowed: true,
            ageRange: [20 + (index % 10), 40 + (index % 10)],
            gender: index % 3 === 0 ? 'any' : (index % 3 === 1 ? 'male' : 'female'),
            occupation: index % 2 === 0 ? 'any' : 'student',
            couplesAllowed: index % 2 === 0,
            smokingAllowed: false
        };
    }

    // Информация о здании
    if (includeBuilding || cardType === 'detail') {
        property.building = {
            name: `Edificio ${neighborhood}`,
            type: (['brick', 'monolith', 'panel'] as const)[index % 3],
            year: 1950 + (index % 70),
            floorsTotal: (index % 4) + 5,
            elevatorPassenger: 1,
            parkingType: 'underground',
            closedTerritory: index % 2 === 0
        };
    }

    // Соседи
    if (includeRoommates || cardType === 'detail') {
        property.roommates = {
            gender: index % 3 === 0 ? 'mix' : (index % 3 === 1 ? 'female' : 'male'),
            ageRange: [20 + (index % 5), 30 + (index % 10)],
            occupation: index % 2 === 0 ? 'worker' : 'student',
            ownerLivesIn: index % 2 === 0,
            atmosphere: index % 2 === 0 ? 'quiet' : 'friendly',
            visitsAllowed: true
        };
    }

    // Поля для детальной карточки
    if (cardType === 'detail') {
        property.amenities = ['wifi', 'airConditioning', 'washingMachine', 'elevator', 'balcony', 'kitchen'];
        property.video = {
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            thumbnail: images[0]
        };
        property.tour3d = {
            url: 'https://my.matterport.com/show/?m=5cTrQWja5Ku',
            thumbnail: images[1] || images[0]
        };
        property.floorPlan = 'https://images.unsplash.com/photo-1536895058696-a69b1c7ba34d?auto=format&fit=crop&w=800&q=80';
        property.descriptionOriginal = DETAILED_DESCRIPTIONS.en;
    }

    return property;
}

/**
 * Генерация списка объектов
 */
export function generateMockProperties(
    count: number, 
    config: MockPropertyConfig = {}
): Property[] {
    return Array.from({ length: count }, (_, i) => generateMockProperty(i, config));
}

/**
 * Генерация с пагинацией
 */
export function generateMockPropertiesPage(
    page: number,
    limit: number,
    total: number,
    config: MockPropertyConfig = {}
): {
    data: Property[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
} {
    const offset = (page - 1) * limit;
    const properties = Array.from({ length: limit }, (_, i) => 
        generateMockProperty(offset + i, config)
    );

    return {
        data: properties,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

/**
 * Генерация мок-объектов по массиву IDs
 */
export function generateMockPropertiesByIds(
    ids: string[],
    config: MockPropertyConfig = {}
): Property[] {
    return ids.map((id, i) => {
        // Используем хэш id для получения стабильного offset
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const property = generateMockProperty(hash + i, config);
        return { ...property, id };
    });
}

/**
 * Генерация для конкретного кластера
 */
export function generateMockClusterProperties(
    clusterId: string,
    count: number,
    config: MockPropertyConfig = {}
): Property[] {
    // Используем хэш clusterId для получения постоянного offset
    const clusterHash = clusterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offset = clusterHash % 1000;

    return Array.from({ length: count }, (_, i) => 
        generateMockProperty(offset + i, config)
    );
}
