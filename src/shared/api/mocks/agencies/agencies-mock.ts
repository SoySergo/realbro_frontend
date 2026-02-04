/**
 * Мок-данные для агентств недвижимости
 */

import type {
    Agency,
    AgencyCardData,
    AgencyAgent,
    AgencyReview,
    AgencyPropertyType,
    AgencyServiceType,
    AgencyOffice,
    WorkingHours,
} from '@/entities/agency';

// Конфигурация для генерации моков
export interface MockAgencyConfig {
    locale?: 'en' | 'ru' | 'es' | 'ca' | 'fr' | 'it' | 'pt' | 'de' | 'uk';
    includeAgents?: boolean;
    includeReviews?: boolean;
}

// Названия агентств
const AGENCY_NAMES = [
    'Barcelona Real Estate',
    'Casa Perfecta',
    'BCN Properties Group',
    'La Llave Inmobiliaria',
    'Mediterranean Homes',
    'Costa Brava Realty',
    'Eixample Properties',
    'Gothic Quarter Estates',
    'Gracia Living',
    'Sant Gervasi Luxury',
    'Barceloneta Beach Homes',
    'Poblenou Urban Realty',
    'Montjuïc View Properties',
    'Diagonal Premium',
    'Passeig de Gràcia Estates',
];

// Логотипы
const AGENCY_LOGOS = [
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=200&h=200&fit=crop&q=80',
];

// Фоновые изображения (cover)
const COVER_IMAGES = [
    'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1920&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=400&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&h=400&fit=crop&q=80',
];

// Города
const CITIES = [
    'Barcelona',
    'Badalona',
    'Hospitalet de Llobregat',
    'Sabadell',
    'Terrassa',
    'Santa Coloma de Gramenet',
    'Mataró',
    'Cornellà de Llobregat',
];

// Языки
const LANGUAGES_OPTIONS = [
    ['es', 'ca', 'en'],
    ['es', 'ca', 'en', 'ru'],
    ['es', 'en', 'fr'],
    ['es', 'ca', 'en', 'de'],
    ['es', 'ca', 'en', 'it', 'pt'],
    ['es', 'en', 'ru', 'uk'],
    ['es', 'ca', 'en', 'fr', 'de'],
];

// Типы недвижимости
const PROPERTY_TYPES_OPTIONS: AgencyPropertyType[][] = [
    ['residential', 'rental'],
    ['residential', 'rental', 'sale'],
    ['residential', 'commercial', 'rental', 'sale'],
    ['luxury', 'residential', 'sale'],
    ['newBuilding', 'residential', 'sale'],
    ['residential', 'commercial', 'luxury', 'rental', 'sale'],
];

// Типы услуг
const SERVICE_TYPES_OPTIONS: AgencyServiceType[][] = [
    ['rental'],
    ['rental', 'sale'],
    ['rental', 'sale', 'management'],
    ['rental', 'sale', 'consulting'],
    ['rental', 'sale', 'management', 'legal'],
    ['rental', 'sale', 'management', 'legal', 'valuation'],
];

// Описания на разных языках
const DESCRIPTIONS = {
    ru: [
        'Мы являемся ведущим агентством недвижимости в Барселоне с более чем 15-летним опытом работы на рынке. Наша команда профессионалов поможет вам найти идеальное жилье.',
        'Специализируемся на премиальной недвижимости в центральных районах Барселоны. Индивидуальный подход к каждому клиенту.',
        'Полный спектр услуг в сфере недвижимости: от поиска до юридического сопровождения сделки. Работаем на русском, английском и испанском языках.',
        'Молодая и динамичная команда экспертов по недвижимости. Помогаем найти жилье мечты в Барселоне и окрестностях.',
        'Эксперты рынка недвижимости Барселоны. Консультации, оценка, продажа и аренда. Говорим на вашем языке.',
    ],
    en: [
        'We are a leading real estate agency in Barcelona with over 15 years of experience. Our team of professionals will help you find the perfect home.',
        'Specializing in premium real estate in central Barcelona districts. Individual approach to each client.',
        'Full range of real estate services: from search to legal support. We work in English, Spanish, and Russian.',
        'Young and dynamic team of real estate experts. We help find your dream home in Barcelona and surroundings.',
        'Barcelona real estate market experts. Consulting, valuation, sales, and rentals. We speak your language.',
    ],
    es: [
        'Somos una agencia inmobiliaria líder en Barcelona con más de 15 años de experiencia. Nuestro equipo de profesionales le ayudará a encontrar la vivienda perfecta.',
        'Especializados en inmuebles premium en los distritos centrales de Barcelona. Enfoque individual para cada cliente.',
        'Gama completa de servicios inmobiliarios: desde la búsqueda hasta el apoyo legal. Trabajamos en español, inglés y ruso.',
        'Equipo joven y dinámico de expertos inmobiliarios. Ayudamos a encontrar la casa de sus sueños en Barcelona y alrededores.',
        'Expertos del mercado inmobiliario de Barcelona. Consultoría, valoración, venta y alquiler. Hablamos su idioma.',
    ],
    fr: [
        'Nous sommes une agence immobilière leader à Barcelone avec plus de 15 ans d\'expérience. Notre équipe de professionnels vous aidera à trouver la maison parfaite.',
        'Spécialisés dans l\'immobilier premium dans les quartiers centraux de Barcelone. Approche individuelle pour chaque client.',
        'Gamme complète de services immobiliers: de la recherche à l\'accompagnement juridique. Nous travaillons en français, espagnol et anglais.',
        'Équipe jeune et dynamique d\'experts immobiliers. Nous vous aidons à trouver la maison de vos rêves à Barcelone.',
        'Experts du marché immobilier de Barcelone. Conseil, évaluation, vente et location. Nous parlons votre langue.',
    ],
};

// Рабочие часы по умолчанию
const DEFAULT_WORKING_HOURS: WorkingHours = {
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '10:00', close: '14:00' },
    sunday: null,
};

// Аватары агентов
const AGENT_AVATARS = [
    'https://i.pravatar.cc/150?u=agent1',
    'https://i.pravatar.cc/150?u=agent2',
    'https://i.pravatar.cc/150?u=agent3',
    'https://i.pravatar.cc/150?u=agent4',
    'https://i.pravatar.cc/150?u=agent5',
    'https://i.pravatar.cc/150?u=agent6',
];

// Имена агентов
const AGENT_NAMES = [
    'Maria García',
    'José Martínez',
    'Ana López',
    'Carlos Rodríguez',
    'Isabel Fernández',
    'Miguel Sánchez',
    'Laura Ruiz',
    'Pablo Díaz',
    'Elena Moreno',
    'David Jiménez',
];

// Должности агентов
const AGENT_POSITIONS = {
    ru: ['Директор', 'Старший агент', 'Агент', 'Менеджер по продажам', 'Консультант'],
    en: ['Director', 'Senior Agent', 'Agent', 'Sales Manager', 'Consultant'],
    es: ['Director', 'Agente Senior', 'Agente', 'Gerente de Ventas', 'Consultor'],
};

/**
 * Генерация агента
 */
function generateMockAgent(index: number, agencyId: string, locale: string = 'ru'): AgencyAgent {
    const positions = AGENT_POSITIONS[locale as keyof typeof AGENT_POSITIONS] || AGENT_POSITIONS.en;
    
    return {
        id: `agent_${agencyId}_${index}`,
        name: AGENT_NAMES[index % AGENT_NAMES.length],
        avatar: AGENT_AVATARS[index % AGENT_AVATARS.length],
        position: positions[index % positions.length],
        phone: `+34 6${String(index).padStart(2, '0')} ${100 + index} ${200 + index}`,
        email: `agent${index}@agency.com`,
        languages: LANGUAGES_OPTIONS[index % LANGUAGES_OPTIONS.length],
        specialization: PROPERTY_TYPES_OPTIONS[index % PROPERTY_TYPES_OPTIONS.length],
        objectsCount: 10 + (index % 30),
        isVerified: index % 2 === 0,
    };
}

// Тексты отзывов
const REVIEW_TEXTS = {
    ru: [
        'Отличное агентство! Помогли найти квартиру за неделю. Очень профессиональный подход.',
        'Рекомендую! Агент был очень терпелив и показал множество вариантов.',
        'Хороший сервис, но ответы иногда приходили с задержкой.',
        'Профессионалы своего дела. Сделка прошла гладко.',
        'Спасибо за помощь в поиске аренды. Все документы оформили быстро.',
    ],
    en: [
        'Excellent agency! Helped find an apartment in a week. Very professional approach.',
        'Highly recommend! The agent was very patient and showed many options.',
        'Good service, but responses sometimes came with delays.',
        'True professionals. The deal went smoothly.',
        'Thank you for helping find a rental. All documents were processed quickly.',
    ],
    es: [
        '¡Excelente agencia! Ayudaron a encontrar un piso en una semana. Enfoque muy profesional.',
        '¡Lo recomiendo! El agente fue muy paciente y mostró muchas opciones.',
        'Buen servicio, pero las respuestas a veces llegaban con retraso.',
        'Verdaderos profesionales. El trato fue muy bien.',
        'Gracias por ayudar a encontrar un alquiler. Todos los documentos se tramitaron rápidamente.',
    ],
};

// Имена авторов отзывов
const REVIEW_AUTHORS = [
    'Александр К.',
    'Екатерина М.',
    'Дмитрий В.',
    'Анна С.',
    'Михаил Л.',
    'Ольга П.',
    'John D.',
    'Sarah M.',
    'Pierre L.',
    'Hans W.',
];

/**
 * Генерация отзыва
 */
function generateMockReview(index: number, agencyId: string, locale: string = 'ru'): AgencyReview {
    const texts = REVIEW_TEXTS[locale as keyof typeof REVIEW_TEXTS] || REVIEW_TEXTS.en;
    const daysAgo = index * 7 + (index % 10);
    
    return {
        id: `review_${agencyId}_${index}`,
        authorId: `user_${index}`,
        authorName: REVIEW_AUTHORS[index % REVIEW_AUTHORS.length],
        authorAvatar: `https://i.pravatar.cc/100?u=reviewer${index}`,
        rating: 3 + (index % 3), // 3-5 звёзд
        text: texts[index % texts.length],
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        likes: index * 2,
        dislikes: index % 3,
        reply: index % 3 === 0 ? {
            text: 'Спасибо за отзыв! Рады, что смогли помочь.',
            createdAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000),
        } : undefined,
    };
}

/**
 * Генерация офиса
 */
function generateMockOffice(index: number, agencyId: string, isMain: boolean = false): AgencyOffice {
    const city = CITIES[index % CITIES.length];
    
    return {
        id: `office_${agencyId}_${index}`,
        address: `Carrer de ${['Aragó', 'Mallorca', 'València', 'Provença'][index % 4]}, ${100 + index * 10}`,
        city,
        country: 'Spain',
        coordinates: {
            lat: 41.3851 + ((index % 10) - 5) * 0.01,
            lng: 2.1734 + ((index % 10) - 5) * 0.01,
        },
        phone: `+34 93 ${String(index + 100).padStart(3, '0')} ${String(index * 11).padStart(2, '0')} ${String(index * 22).padStart(2, '0')}`,
        email: `office${index}@agency.com`,
        isMain,
        workingHours: DEFAULT_WORKING_HOURS,
    };
}

/**
 * Генерация полного объекта агентства
 */
export function generateMockAgency(index: number, config: MockAgencyConfig = {}): Agency {
    const {
        locale = 'ru',
        includeAgents = true,
        includeReviews = true,
    } = config;

    const id = `agency_${index}`;
    const name = AGENCY_NAMES[index % AGENCY_NAMES.length];
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const descriptions = DESCRIPTIONS[locale as keyof typeof DESCRIPTIONS] || DESCRIPTIONS.en;
    const objectsCount = 20 + (index % 80);
    const agentsCount = 3 + (index % 7);
    const reviewsCount = 5 + (index % 20);
    
    const agency: Agency = {
        id,
        name,
        slug,
        logo: AGENCY_LOGOS[index % AGENCY_LOGOS.length],
        coverImage: COVER_IMAGES[index % COVER_IMAGES.length],
        description: descriptions[index % descriptions.length],
        descriptionShort: descriptions[index % descriptions.length].substring(0, 100) + '...',
        contact: {
            phone: `+34 93 ${String(index + 100).padStart(3, '0')} ${String(index * 11).padStart(2, '0')} ${String(index * 22).padStart(2, '0')}`,
            email: `info@${slug}.com`,
            website: `https://${slug}.com`,
            whatsapp: `+34 6${String(index).padStart(2, '0')} ${100 + index} ${200 + index}`,
        },
        offices: [
            generateMockOffice(0, id, true),
            ...(index % 3 === 0 ? [generateMockOffice(1, id)] : []),
        ],
        languages: LANGUAGES_OPTIONS[index % LANGUAGES_OPTIONS.length],
        propertyTypes: PROPERTY_TYPES_OPTIONS[index % PROPERTY_TYPES_OPTIONS.length],
        serviceTypes: SERVICE_TYPES_OPTIONS[index % SERVICE_TYPES_OPTIONS.length],
        objectsCount,
        rentalsCount: Math.floor(objectsCount * 0.6),
        salesCount: Math.floor(objectsCount * 0.4),
        agentsCount,
        reviewsCount,
        rating: 3.5 + (index % 15) / 10, // 3.5 - 5.0
        isVerified: index % 2 === 0,
        isPremium: index % 4 === 0,
        foundedYear: 2000 + (index % 20),
        yearsOnPlatform: 1 + (index % 5),
        createdAt: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000),
    };

    if (includeAgents) {
        agency.agents = Array.from({ length: agentsCount }, (_, i) =>
            generateMockAgent(i, id, locale)
        );
    }

    if (includeReviews) {
        agency.reviews = Array.from({ length: Math.min(reviewsCount, 10) }, (_, i) =>
            generateMockReview(i, id, locale)
        );
    }

    return agency;
}

/**
 * Генерация карточки агентства для списка
 */
export function generateMockAgencyCard(index: number, config: MockAgencyConfig = {}): AgencyCardData {
    const agency = generateMockAgency(index, { ...config, includeAgents: false, includeReviews: false });
    
    return {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        logo: agency.logo,
        description: agency.descriptionShort,
        rating: agency.rating,
        reviewsCount: agency.reviewsCount,
        objectsCount: agency.objectsCount,
        languages: agency.languages,
        propertyTypes: agency.propertyTypes,
        city: agency.offices[0]?.city || 'Barcelona',
        isVerified: agency.isVerified,
        isPremium: agency.isPremium,
    };
}

/**
 * Генерация списка карточек агентств
 */
export function generateMockAgencyCards(count: number, config: MockAgencyConfig = {}): AgencyCardData[] {
    return Array.from({ length: count }, (_, i) => generateMockAgencyCard(i, config));
}

/**
 * Генерация списка агентств с пагинацией
 */
export function generateMockAgenciesPage(
    page: number,
    limit: number,
    total: number,
    config: MockAgencyConfig = {}
): {
    data: AgencyCardData[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
} {
    const offset = (page - 1) * limit;
    const agencies = Array.from({ length: Math.min(limit, total - offset) }, (_, i) =>
        generateMockAgencyCard(offset + i, config)
    );

    return {
        data: agencies,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
