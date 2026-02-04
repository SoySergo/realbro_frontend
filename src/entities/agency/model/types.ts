/**
 * Типы для агентств недвижимости
 */

// Типы недвижимости, с которыми работает агентство
export type AgencyPropertyType =
    | 'residential'      // Жилая недвижимость
    | 'commercial'       // Коммерческая недвижимость
    | 'luxury'           // Премиум/Люкс
    | 'newBuilding'      // Новостройки
    | 'secondary'        // Вторичный рынок
    | 'rental'           // Аренда
    | 'sale';            // Продажа

// Тип работы агентства
export type AgencyServiceType =
    | 'rental'           // Аренда
    | 'sale'             // Продажа
    | 'management'       // Управление недвижимостью
    | 'consulting'       // Консалтинг
    | 'legal'            // Юридические услуги
    | 'valuation';       // Оценка недвижимости

// Информация об агенте в агентстве
export interface AgencyAgent {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
    phone?: string;
    email?: string;
    languages: string[];
    specialization?: AgencyPropertyType[];
    objectsCount?: number;
    isVerified?: boolean;
}

// Отзыв об агентстве
export interface AgencyReview {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    rating: number;         // 1-5
    text: string;
    createdAt: Date;
    updatedAt?: Date;
    agentId?: string;       // Отзыв о конкретном агенте
    agentName?: string;
    propertyId?: string;    // Связанный объект
    likes?: number;
    dislikes?: number;
    reply?: {               // Ответ агентства
        text: string;
        createdAt: Date;
    };
}

// Рабочие часы
export interface WorkingHours {
    monday?: { open: string; close: string } | null;
    tuesday?: { open: string; close: string } | null;
    wednesday?: { open: string; close: string } | null;
    thursday?: { open: string; close: string } | null;
    friday?: { open: string; close: string } | null;
    saturday?: { open: string; close: string } | null;
    sunday?: { open: string; close: string } | null;
}

// Контактные данные агентства
export interface AgencyContact {
    phone: string;
    email?: string;
    website?: string;
    whatsapp?: string;
    telegram?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
}

// Адрес офиса
export interface AgencyOffice {
    id: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    phone?: string;
    email?: string;
    isMain?: boolean;
    workingHours?: WorkingHours;
}

// Основная сущность агентства
export interface Agency {
    id: string;
    name: string;
    slug: string;
    
    // Визуальные элементы
    logo?: string;
    coverImage?: string;         // Фоновое изображение (как в YouTube)
    images?: string[];           // Фото офиса, команды и т.д.
    
    // Описание
    description: string;
    descriptionShort?: string;
    
    // Контакты и офисы
    contact: AgencyContact;
    offices: AgencyOffice[];
    
    // Характеристики
    languages: string[];         // Языки обслуживания
    propertyTypes: AgencyPropertyType[];
    serviceTypes: AgencyServiceType[];
    
    // Статистика
    objectsCount: number;
    rentalsCount?: number;
    salesCount?: number;
    agentsCount?: number;
    reviewsCount: number;
    rating: number;              // 1-5
    
    // Верификация и статусы
    isVerified?: boolean;
    isPremium?: boolean;
    
    // Опыт и история
    foundedYear?: number;
    yearsOnPlatform?: number;
    
    // Мета
    createdAt: Date;
    updatedAt: Date;
    
    // Связанные данные
    agents?: AgencyAgent[];
    reviews?: AgencyReview[];
}

// Карточка агентства для списка
export interface AgencyCardData {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    rating: number;
    reviewsCount: number;
    objectsCount: number;
    languages: string[];
    propertyTypes: AgencyPropertyType[];
    city: string;
    isVerified?: boolean;
    isPremium?: boolean;
}

// Фильтры для поиска агентств
export interface AgencyFilters {
    // Локация
    cityIds?: number[];
    provinceIds?: number[];
    regionIds?: number[];
    
    // Характеристики
    languages?: string[];
    propertyTypes?: AgencyPropertyType[];
    serviceTypes?: AgencyServiceType[];
    
    // Поиск
    query?: string;              // Поиск по названию
    phone?: string;              // Поиск по телефону
    
    // Рейтинг
    minRating?: number;
    
    // Статусы
    isVerified?: boolean;
    isPremium?: boolean;
    
    // Сортировка
    sort?: AgencySortType;
    sortOrder?: 'asc' | 'desc';
}

// Типы сортировки
export type AgencySortType =
    | 'rating'           // По рейтингу
    | 'reviewsCount'     // По количеству отзывов
    | 'objectsCount'     // По количеству объектов
    | 'name'             // По названию
    | 'foundedYear';     // По году основания
