import type { PropertyType, PropertyFeature } from './property';

export interface PropertyFilters {
    propertyType?: PropertyType[];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number[];
    bathrooms?: number[];
    minArea?: number;
    maxArea?: number;
    location?: string;
    features?: PropertyFeature[];
}

export interface FilterOption {
    value: string;
    label: string;
}
