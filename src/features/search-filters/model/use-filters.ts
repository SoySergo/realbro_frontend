'use client';

import { useCallback, useMemo } from 'react';
import { useQueryStates } from 'nuqs';
import type { SearchFilters, GeometrySource, MarkerType, SortField, SortOrder } from '@/entities/filter/model/types';
import { searchParamsConfig } from '../lib/parsers';

const NUQS_OPTIONS = { history: 'replace' as const, shallow: true };

/**
 * useFilters — THE single hook for reading and writing search filters.
 *
 * URL is the single source of truth. No Zustand, no localStorage.
 * Uses nuqs for type-safe, shallow URL updates (no React Server Component re-fetches).
 *
 * Usage:
 *   const { filters, setFilters, clearFilters } = useFilters();
 *   setFilters({ minPrice: 500, maxPrice: 2000 }); // merges into URL
 *   setFilters({ minPrice: undefined });             // removes minPrice from URL
 *   clearFilters();                                   // removes all filter params
 */
export function useFilters() {
    const [params, setParams] = useQueryStates(searchParamsConfig, NUQS_OPTIONS);

    // Convert nuqs state (with nulls) → clean SearchFilters (with undefineds)
    const filters: SearchFilters = useMemo(() => {
        const f: SearchFilters = {};

        if (params.price?.min !== undefined) f.minPrice = params.price.min;
        if (params.price?.max !== undefined) f.maxPrice = params.price.max;
        if (params.area?.min !== undefined) f.minArea = params.area.min;
        if (params.area?.max !== undefined) f.maxArea = params.area.max;
        if (params.rooms?.length) f.rooms = params.rooms;
        if (params.categories?.length) f.categoryIds = params.categories;
        if (params.sub_categories?.length) f.subCategories = params.sub_categories;
        if (params.admin2?.length) f.adminLevel2 = params.admin2;
        if (params.admin4?.length) f.adminLevel4 = params.admin4;
        if (params.admin6?.length) f.adminLevel6 = params.admin6;
        if (params.admin7?.length) f.adminLevel7 = params.admin7;
        if (params.admin8?.length) f.adminLevel8 = params.admin8;
        if (params.admin9?.length) f.adminLevel9 = params.admin9;
        if (params.admin10?.length) f.adminLevel10 = params.admin10;
        if (params.polygon?.length) f.polygonIds = params.polygon;
        if (params.isochrone?.length) f.isochroneIds = params.isochrone;
        if (params.radius?.length) f.radiusIds = params.radius;
        if (params.geo_src) f.geoSrc = params.geo_src as GeometrySource;
        if (params.marker) f.markerType = params.marker as MarkerType;
        if (params.sort) f.sort = params.sort as SortField;
        if (params.order) f.order = params.order as SortOrder;
        if (params.bbox) f.bbox = params.bbox;
        if (params.bathrooms?.length) f.bathrooms = params.bathrooms;

        return f;
    }, [params]);

    // Merge partial updates into URL params. Setting undefined removes the param.
    const setFilters = useCallback(
        (updates: Partial<SearchFilters>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const urlUpdates: Record<string, any> = {};

            // Price range
            if ('minPrice' in updates || 'maxPrice' in updates) {
                const newMin = 'minPrice' in updates ? updates.minPrice : filters.minPrice;
                const newMax = 'maxPrice' in updates ? updates.maxPrice : filters.maxPrice;
                urlUpdates.price =
                    newMin !== undefined || newMax !== undefined
                        ? { min: newMin, max: newMax }
                        : null;
            }

            // Area range
            if ('minArea' in updates || 'maxArea' in updates) {
                const newMin = 'minArea' in updates ? updates.minArea : filters.minArea;
                const newMax = 'maxArea' in updates ? updates.maxArea : filters.maxArea;
                urlUpdates.area =
                    newMin !== undefined || newMax !== undefined
                        ? { min: newMin, max: newMax }
                        : null;
            }

            // Simple arrays (undefined → null removes from URL)
            if ('rooms' in updates) urlUpdates.rooms = updates.rooms?.length ? updates.rooms : null;
            if ('categoryIds' in updates) urlUpdates.categories = updates.categoryIds?.length ? updates.categoryIds : null;
            if ('subCategories' in updates) urlUpdates.sub_categories = updates.subCategories?.length ? updates.subCategories : null;
            if ('bathrooms' in updates) urlUpdates.bathrooms = updates.bathrooms?.length ? updates.bathrooms : null;

            // Admin levels
            if ('adminLevel2' in updates) urlUpdates.admin2 = updates.adminLevel2?.length ? updates.adminLevel2 : null;
            if ('adminLevel4' in updates) urlUpdates.admin4 = updates.adminLevel4?.length ? updates.adminLevel4 : null;
            if ('adminLevel6' in updates) urlUpdates.admin6 = updates.adminLevel6?.length ? updates.adminLevel6 : null;
            if ('adminLevel7' in updates) urlUpdates.admin7 = updates.adminLevel7?.length ? updates.adminLevel7 : null;
            if ('adminLevel8' in updates) urlUpdates.admin8 = updates.adminLevel8?.length ? updates.adminLevel8 : null;
            if ('adminLevel9' in updates) urlUpdates.admin9 = updates.adminLevel9?.length ? updates.adminLevel9 : null;
            if ('adminLevel10' in updates) urlUpdates.admin10 = updates.adminLevel10?.length ? updates.adminLevel10 : null;

            // Geometry UUIDs
            if ('polygonIds' in updates) urlUpdates.polygon = updates.polygonIds?.length ? updates.polygonIds : null;
            if ('isochroneIds' in updates) urlUpdates.isochrone = updates.isochroneIds?.length ? updates.isochroneIds : null;
            if ('radiusIds' in updates) urlUpdates.radius = updates.radiusIds?.length ? updates.radiusIds : null;

            // Simple scalars
            if ('geoSrc' in updates) urlUpdates.geo_src = updates.geoSrc ?? null;
            if ('markerType' in updates) {
                urlUpdates.marker = updates.markerType && updates.markerType !== 'all' ? updates.markerType : null;
            }
            if ('sort' in updates) urlUpdates.sort = updates.sort ?? null;
            if ('order' in updates) urlUpdates.order = updates.order ?? null;
            if ('bbox' in updates) urlUpdates.bbox = updates.bbox ?? null;

            setParams(urlUpdates);
        },
        [filters, setParams],
    );

    // Replace all filters at once (non-merge)
    const replaceFilters = useCallback(
        (newFilters: SearchFilters) => {
            setParams({
                price:
                    newFilters.minPrice !== undefined || newFilters.maxPrice !== undefined
                        ? { min: newFilters.minPrice, max: newFilters.maxPrice }
                        : null,
                area:
                    newFilters.minArea !== undefined || newFilters.maxArea !== undefined
                        ? { min: newFilters.minArea, max: newFilters.maxArea }
                        : null,
                rooms: newFilters.rooms?.length ? newFilters.rooms : null,
                categories: newFilters.categoryIds?.length ? newFilters.categoryIds : null,
                sub_categories: newFilters.subCategories?.length ? newFilters.subCategories : null,
                bathrooms: newFilters.bathrooms?.length ? newFilters.bathrooms : null,
                admin2: newFilters.adminLevel2?.length ? newFilters.adminLevel2 : null,
                admin4: newFilters.adminLevel4?.length ? newFilters.adminLevel4 : null,
                admin6: newFilters.adminLevel6?.length ? newFilters.adminLevel6 : null,
                admin7: newFilters.adminLevel7?.length ? newFilters.adminLevel7 : null,
                admin8: newFilters.adminLevel8?.length ? newFilters.adminLevel8 : null,
                admin9: newFilters.adminLevel9?.length ? newFilters.adminLevel9 : null,
                admin10: newFilters.adminLevel10?.length ? newFilters.adminLevel10 : null,
                polygon: newFilters.polygonIds?.length ? newFilters.polygonIds : null,
                isochrone: newFilters.isochroneIds?.length ? newFilters.isochroneIds : null,
                radius: newFilters.radiusIds?.length ? newFilters.radiusIds : null,
                geo_src: newFilters.geoSrc ?? null,
                marker: newFilters.markerType && newFilters.markerType !== 'all' ? newFilters.markerType : null,
                sort: newFilters.sort ?? null,
                order: newFilters.order ?? null,
                bbox: newFilters.bbox ?? null,
            });
        },
        [setParams],
    );

    // Remove all filter params from URL
    const clearFilters = useCallback(() => {
        setParams({
            price: null,
            area: null,
            rooms: null,
            categories: null,
            sub_categories: null,
            bathrooms: null,
            admin2: null,
            admin4: null,
            admin6: null,
            admin7: null,
            admin8: null,
            admin9: null,
            admin10: null,
            polygon: null,
            isochrone: null,
            radius: null,
            geo_src: null,
            marker: null,
            sort: null,
            order: null,
            bbox: null,
        });
    }, [setParams]);

    // Count active filters (for badge display)
    const filtersCount = useMemo(() => {
        let count = 0;
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
        if (filters.minArea !== undefined || filters.maxArea !== undefined) count++;
        if (filters.rooms?.length) count++;
        if (filters.categoryIds?.length) count++;
        if (filters.subCategories?.length) count++;
        const hasAdmin =
            filters.adminLevel2?.length || filters.adminLevel4?.length ||
            filters.adminLevel6?.length || filters.adminLevel7?.length ||
            filters.adminLevel8?.length || filters.adminLevel9?.length ||
            filters.adminLevel10?.length;
        if (hasAdmin) count++;
        if (filters.polygonIds?.length || filters.isochroneIds?.length || filters.radiusIds?.length) count++;
        if (filters.markerType && filters.markerType !== 'all') count++;
        return count;
    }, [filters]);

    const hasFilters = filtersCount > 0;

    return {
        filters,
        setFilters,
        replaceFilters,
        clearFilters,
        hasFilters,
        filtersCount,
    };
}
