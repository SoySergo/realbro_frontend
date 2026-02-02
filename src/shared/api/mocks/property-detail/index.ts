/**
 * Property Detail API - Mock/Real API Switching
 *
 * This module provides API functions that can switch between mock data
 * and real backend API based on environment variable.
 *
 * Usage:
 *   - Set NEXT_PUBLIC_USE_MOCKS=true in .env.local for mock data
 *   - Set NEXT_PUBLIC_USE_MOCKS=false for real API
 *
 * When switching to real backend, just change the API endpoints in the
 * else branches - no need to modify component code!
 */

import type { Property } from '@/entities/property/model/types';
import type {
    NearbyPlaces,
    AgentPropertyCard,
    SimilarPropertyCard,
    TransportStation
} from './types';

// Re-export types for convenience
export * from './types';

// ============================================================================
// Configuration
// ============================================================================

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

// Real API base URL (change this when backend is ready)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

// ============================================================================
// Mock Data Loaders
// ============================================================================

async function loadMockProperty(): Promise<Property> {
    const data = await import('./property.json');
    const raw = data.default;
    // Convert date strings to Date objects
    return {
        ...raw,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
        publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : undefined
    } as Property;
}

async function loadMockNearbyPlaces(): Promise<NearbyPlaces> {
    const data = await import('./nearby-places.json');
    return data.default as NearbyPlaces;
}

async function loadMockAgentProperties(): Promise<AgentPropertyCard[]> {
    const data = await import('./agent-properties.json');
    return data.default as AgentPropertyCard[];
}

async function loadMockSimilarProperties(): Promise<SimilarPropertyCard[]> {
    const data = await import('./similar-properties.json');
    return data.default as SimilarPropertyCard[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get property details by ID
 *
 * @param id - Property ID
 * @returns Property object or null if not found
 */
export async function getPropertyDetailById(id: string): Promise<Property | null> {
    if (USE_MOCKS) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        const property = await loadMockProperty();
        // Override ID to match requested ID
        return { ...property, id };
    }

    // Real API call
    try {
        const response = await fetch(`${API_BASE}/properties/${id}`, {
            next: { revalidate: 21600 } // ISR: 6 hours
        });

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get property ${id}:`, error);
        return null;
    }
}

/**
 * Get nearby places for a property
 *
 * @param propertyId - Property ID
 * @returns NearbyPlaces object with all categories
 */
export async function getNearbyPlaces(propertyId: string): Promise<NearbyPlaces> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        return loadMockNearbyPlaces();
    }

    // Real API call
    try {
        const response = await fetch(`${API_BASE}/properties/${propertyId}/nearby`, {
            next: { revalidate: 86400 } // ISR: 24 hours (POI data changes less frequently)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get nearby places for ${propertyId}:`, error);
        // Return empty data on error
        return {
            transport: [],
            schools: [],
            medical: [],
            groceries: [],
            shopping: [],
            restaurants: [],
            sports: [],
            parks: [],
            beauty: [],
            entertainment: [],
            attractions: []
        };
    }
}

/**
 * Get transport stations near a property
 * Convenience function that extracts transport from nearby places
 *
 * @param propertyId - Property ID
 * @returns Array of transport stations
 */
export async function getTransportStations(propertyId: string): Promise<TransportStation[]> {
    const nearbyPlaces = await getNearbyPlaces(propertyId);
    return nearbyPlaces.transport;
}

/**
 * Get other properties from the same agent
 *
 * @param agentId - Agent ID
 * @param excludePropertyId - Property ID to exclude from results
 * @param limit - Maximum number of properties to return
 * @returns Array of agent's other properties
 */
export async function getAgentProperties(
    agentId: string,
    excludePropertyId?: string,
    limit: number = 6
): Promise<AgentPropertyCard[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const properties = await loadMockAgentProperties();
        return properties
            .filter(p => p.id !== excludePropertyId)
            .slice(0, limit);
    }

    // Real API call
    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            ...(excludePropertyId && { exclude: excludePropertyId })
        });

        const response = await fetch(
            `${API_BASE}/agents/${agentId}/properties?${params}`,
            { next: { revalidate: 3600 } } // ISR: 1 hour
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get agent properties for ${agentId}:`, error);
        return [];
    }
}

/**
 * Get similar/recommended properties
 *
 * @param propertyId - Property ID to find similar properties for
 * @param limit - Maximum number of properties to return
 * @returns Array of similar properties
 */
export async function getSimilarProperties(
    propertyId: string,
    limit: number = 4
): Promise<SimilarPropertyCard[]> {
    if (USE_MOCKS) {
        await new Promise(resolve => setTimeout(resolve, 50));
        const properties = await loadMockSimilarProperties();
        return properties.slice(0, limit);
    }

    // Real API call
    try {
        const response = await fetch(
            `${API_BASE}/properties/${propertyId}/similar?limit=${limit}`,
            { next: { revalidate: 3600 } } // ISR: 1 hour
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`[API] Failed to get similar properties for ${propertyId}:`, error);
        return [];
    }
}

// ============================================================================
// Batch Data Fetching (for page-level data fetching)
// ============================================================================

export interface PropertyPageData {
    property: Property | null;
    nearbyPlaces: NearbyPlaces;
    agentProperties: AgentPropertyCard[];
    similarProperties: SimilarPropertyCard[];
}

/**
 * Fetch all data needed for property detail page
 * Runs all requests in parallel for optimal performance
 *
 * @param propertyId - Property ID
 * @returns All data needed for property detail page
 */
export async function getPropertyPageData(propertyId: string): Promise<PropertyPageData> {
    const property = await getPropertyDetailById(propertyId);

    if (!property) {
        return {
            property: null,
            nearbyPlaces: {
                transport: [],
                schools: [],
                medical: [],
                groceries: [],
                shopping: [],
                restaurants: [],
                sports: [],
                parks: [],
                beauty: [],
                entertainment: [],
                attractions: []
            },
            agentProperties: [],
            similarProperties: []
        };
    }

    // Fetch remaining data in parallel
    const [nearbyPlaces, agentProperties, similarProperties] = await Promise.all([
        getNearbyPlaces(propertyId),
        property.author?.id
            ? getAgentProperties(property.author.id, propertyId)
            : Promise.resolve([]),
        getSimilarProperties(propertyId)
    ]);

    return {
        property,
        nearbyPlaces,
        agentProperties,
        similarProperties
    };
}
