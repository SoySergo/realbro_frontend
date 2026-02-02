/**
 * Types for property detail mock data
 * These types match the expected backend API response structure
 */

import type { Property } from '@/entities/property/model/types';

// ============================================================================
// Transport & Nearby Places Types
// ============================================================================

export interface TransportLine {
    id: string;
    type: 'metro' | 'train' | 'bus' | 'tram';
    name: string;
    color?: string;
    destination?: string;
}

export interface TransportStation {
    id: string;
    name: string;
    type: 'metro' | 'train' | 'bus' | 'tram';
    lines: TransportLine[];
    distance: number;      // in meters
    walkTime: number;      // in minutes
    isWalk?: boolean;      // is walkable distance
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface NearbyPlace {
    id: string;
    name: string;
    type: string;
    distance: number;      // in meters
    walkTime: number;      // in minutes
    address?: string;
    rating?: number;
    openingHours?: string;
    phone?: string;
    website?: string;
    priceLevel?: 1 | 2 | 3 | 4;
    cuisine?: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface NearbyPlaces {
    transport: TransportStation[];
    schools: NearbyPlace[];
    medical: NearbyPlace[];
    groceries: NearbyPlace[];
    shopping: NearbyPlace[];
    restaurants: NearbyPlace[];
    sports: NearbyPlace[];
    parks: NearbyPlace[];
    beauty: NearbyPlace[];
    entertainment: NearbyPlace[];
    attractions: NearbyPlace[];
}

// ============================================================================
// Agent Properties Types
// ============================================================================

export interface AgentPropertyCard {
    id: string;
    title: string;
    type: Property['type'];
    price: number;
    rooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
    totalFloors?: number;
    address: string;
    city: string;
    district?: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    images: string[];
    isNew?: boolean;
    isVerified?: boolean;
}

// ============================================================================
// Similar Properties Types
// ============================================================================

export type SimilarPropertyCard = AgentPropertyCard;

// ============================================================================
// API Response Types
// ============================================================================

export interface PropertyDetailResponse {
    property: Property;
    nearbyPlaces: NearbyPlaces;
    agentProperties: AgentPropertyCard[];
    similarProperties: SimilarPropertyCard[];
}

// ============================================================================
// Category filter keys for UI
// ============================================================================

export type NearbyPlaceCategory = keyof Omit<NearbyPlaces, 'transport'>;

export const NEARBY_PLACE_CATEGORIES: NearbyPlaceCategory[] = [
    'schools',
    'medical',
    'groceries',
    'shopping',
    'restaurants',
    'sports',
    'parks',
    'beauty',
    'entertainment',
    'attractions'
];
