import type { Property } from './property';

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export type PropertiesResponse = ApiResponse<PaginatedResponse<Property>>;
export type PropertyResponse = ApiResponse<Property>;
