export * from './types';
export * from './mapbox-geocoding';
export * from './mapbox-isochrone';
export * from './auth';
export * from './users';
export * from './properties';
export * from './search-queries';
export * from './geometries';

// Property detail mock/real API
export {
    getPropertyDetailById,
    getNearbyPlaces,
    getTransportStations,
    getAgentProperties,
    getSimilarProperties,
    getPropertyPageData,
} from './mocks/property-detail';
export type {
    NearbyPlaces,
    NearbyPlace,
    TransportStation,
    TransportLine,
    AgentPropertyCard,
    SimilarPropertyCard,
    PropertyPageData,
    NearbyPlaceCategory,
} from './mocks/property-detail';

// Server-only exports (use direct import for Server Components)
export {
    getPropertiesListServer,
    getPropertiesCountServer,
    parseFiltersFromSearchParams,
} from './properties-server';
export type {
    PropertiesListResponse as PropertiesListResponseServer,
    PropertiesListParams as PropertiesListParamsServer,
} from './properties-server';
