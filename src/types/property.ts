// Типы для недвижимости
export type PropertyType = 'apartment' | 'studio' | 'house' | 'penthouse' | 'duplex';

export interface Property {
    id: string;
    title: string;
    type: PropertyType;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
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
