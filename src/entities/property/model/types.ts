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

export interface Property {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    bedrooms: number;
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
    features: PropertyFeature[];
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    // Дополнительные поля
    pricePerMeter?: number;
    nearbyTransport?: NearbyTransport;
    author?: PropertyAuthor;
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
