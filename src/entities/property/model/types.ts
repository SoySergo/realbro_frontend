// Типы для недвижимости
export type PropertyType = 'apartment' | 'studio' | 'house' | 'penthouse' | 'duplex';

// Тип транспорта до станции
export type TransportType = 'metro' | 'train' | 'bus';

// Информация о ближайшей станции транспорта
export interface NearbyTransport {
    type: TransportType;
    name: string;
    line?: string;
    color?: string; // цвет линии метро
    walkMinutes: number;
}

// Информация об авторе объявления
export interface PropertyAuthor {
    id: string;
    name: string;
    avatar?: string;
    type: 'agent' | 'owner' | 'agency';
    agencyName?: string;
    agencyLogo?: string;
    isVerified?: boolean;
    isSuperAgent?: boolean;
    phone?: string;
    yearsOnPlatform?: number;
    objectsCount?: number;
    showOnline?: boolean;
}

// Тип ремонта
export type RenovationType = 'cosmetic' | 'euro' | 'designer' | 'requires-repair' | 'none';

// Тип санузла
export type BathroomType = 'combined' | 'separate' | 'multiple';

// Вид из окон
export type WindowViewType = 'street' | 'yard' | 'both';

// Тип парковки
export type ParkingType = 'underground' | 'ground' | 'street' | 'none';

// Информация о здании
export interface BuildingInfo {
    name?: string;              // Название ЖК
    year?: number;              // Год постройки
    type?: 'brick' | 'monolith' | 'panel' | 'block' | 'wood';
    floorsTotal?: number;       // Всего этажей
    elevatorPassenger?: number; // Пассажирских лифтов
    elevatorFreight?: number;   // Грузовых лифтов
    parkingType?: ParkingType;
    closedTerritory?: boolean;  // Закрытая территория
    concierge?: boolean;        // Консьерж
    garbageChute?: boolean;     // Мусоропровод
}

// Условия аренды
export interface RentalConditions {
    deposit?: number;               // Залог
    commission?: number;            // Комиссия агенту (% или сумма)
    commissionType?: 'percent' | 'fixed';
    prepaymentMonths?: number;      // Предоплата (месяцев)
    minRentalMonths?: number;       // Мин. срок аренды
    utilitiesIncluded?: boolean;    // КУ включены
    utilitiesAmount?: number;       // Сумма КУ если не включены
    petsAllowed?: boolean;          // Можно с животными
    childrenAllowed?: boolean;      // Можно с детьми
    smokingAllowed?: boolean;       // Можно курить
}

// Медиа-контент недвижимости
export interface PropertyVideo {
    url: string;
    thumbnail: string;
}

export interface PropertyTour3D {
    url: string;
    thumbnail: string;
}

// Предпочтения по арендаторам
export interface TenantPreferences {
    minRentalMonths?: number;
    prepaymentMonths?: number;
    petsAllowed?: boolean;
    childrenAllowed?: boolean;
    ageRange?: [number, number];
    gender?: 'male' | 'female' | 'any';
    occupation?: 'student' | 'worker' | 'any';
    couplesAllowed?: boolean;
    smokingAllowed?: boolean;
}

// Информация о соседях (для комнат)
export interface Roommates {
    gender?: 'male' | 'female' | 'mix';
    ageRange?: [number, number];
    occupation?: 'student' | 'worker' | 'any';
    ownerLivesIn?: boolean;
    atmosphere?: string; // e.g., 'quiet', 'friendly'
    visitsAllowed?: boolean;
}

// Детали комнаты (для типа 'room')
export interface RoomDetails {
    furnished?: boolean;
    bedType?: 'single' | 'double' | 'sofa' | 'bunk';
    amenities?: string[];
    windowView?: WindowViewType;
}

export interface Property {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    rooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
    totalFloors?: number;
    address: string;
    city: string;
    province: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    description: string;
    descriptionOriginal?: string;
    features: PropertyFeature[];
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    
    // Расширенные характеристики площади
    livingArea?: number;        // Жилая площадь
    kitchenArea?: number;       // Площадь кухни
    pricePerMeter?: number;
    
    // Детали квартиры
    elevator?: boolean;
    ceilingHeight?: number;     // Высота потолков (м)
    renovation?: RenovationType;
    bathroomType?: BathroomType;
    balconyCount?: number;
    loggia?: boolean;
    windowView?: WindowViewType;
    
    // Транспорт
    nearbyTransport?: NearbyTransport;      // Ближайшая станция (legacy)
    nearbyTransportList?: NearbyTransport[]; // Список ближайших станций
    
    // Условия аренды
    rentalConditions?: RentalConditions;
    
    // Предпочтения по арендаторам
    tenantPreferences?: TenantPreferences;
    
    // Соседи (если это комната или покомнатная аренда)
    roommates?: Roommates;
    
    // Детали комнаты (если type === 'room' или подобное)
    roomDetails?: RoomDetails;
    
    // О здании
    building?: BuildingInfo;
    
    // Автор объявления
    author?: PropertyAuthor;
    
    // Статусы
    isNew?: boolean;
    isVerified?: boolean;
    
    // Медиа-контент
    video?: PropertyVideo;
    floorPlan?: string;
    tour3d?: PropertyTour3D;
    
    // Удобства
    amenities?: string[];
    
    // Особые метки
    noCommission?: boolean;
    exclusive?: boolean;
    
    // Публикация
    publishedAt?: Date;
    viewsCount?: number;
    viewsToday?: number; // New field
    favoritesCount?: number;
}

export type PropertyFeature =
    | 'parking'
    | 'elevator'
    | 'terrace'
    | 'balcony'
    | 'airConditioning'
    | 'heating'
    | 'furnished'
    | 'petFriendly'
    | 'pool'
    | 'garden';
