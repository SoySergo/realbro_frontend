import {
    createParser,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from 'nuqs';

/**
 * Custom nuqs parser for range values: "500-2000" ↔ { min?: number; max?: number }
 */
export const parseAsRange = createParser({
    parse(value: string) {
        const parts = value.split('-');
        const min = parts[0] ? Number(parts[0]) : undefined;
        const max = parts[1] ? Number(parts[1]) : undefined;
        if ((min !== undefined && isNaN(min)) || (max !== undefined && isNaN(max))) return null;
        if (min === undefined && max === undefined) return null;
        return { min, max };
    },
    serialize(value: { min?: number; max?: number }) {
        return `${value.min ?? ''}-${value.max ?? ''}`;
    },
});

/**
 * Comma-separated number array: "2,3,4" ↔ [2, 3, 4]
 */
export const parseAsNumberArray = parseAsArrayOf(parseAsInteger, ',');

/**
 * Comma-separated string array: "uuid1,uuid2" ↔ ["uuid1", "uuid2"]
 */
export const parseAsStringArray = parseAsArrayOf(parseAsString, ',');

/**
 * Bounding box: "west,south,east,north" ↔ [number, number, number, number]
 */
export const parseAsBbox = createParser({
    parse(value: string) {
        const parts = value.split(',').map(Number);
        if (parts.length !== 4 || parts.some(isNaN)) return null;
        return parts as unknown as [number, number, number, number];
    },
    serialize(value: [number, number, number, number]) {
        return value.join(',');
    },
});

export const MARKER_TYPES = [
    'view', 'no_view', 'like', 'dislike',
    'saved', 'hidden', 'to_review', 'to_think', 'all',
];

export const SORT_FIELDS = ['price', 'area', 'createdAt'];
export const SORT_ORDERS = ['asc', 'desc'];
export const GEO_SOURCES = ['guest', 'filter'];

export const parseAsMarkerType = parseAsStringEnum(MARKER_TYPES);
export const parseAsSortField = parseAsStringEnum(SORT_FIELDS);
export const parseAsSortOrder = parseAsStringEnum(SORT_ORDERS);
export const parseAsGeoSource = parseAsStringEnum(GEO_SOURCES);

/**
 * Master config object: keys = URL param names, values = nuqs parsers.
 * This is the SINGLE source of truth for all filter URL parameters.
 */
export const searchParamsConfig = {
    price: parseAsRange,
    area: parseAsRange,
    rooms: parseAsNumberArray,
    categories: parseAsNumberArray,
    sub_categories: parseAsNumberArray,
    admin2: parseAsNumberArray,
    admin4: parseAsNumberArray,
    admin6: parseAsNumberArray,
    admin7: parseAsNumberArray,
    admin8: parseAsNumberArray,
    admin9: parseAsNumberArray,
    admin10: parseAsNumberArray,
    polygon: parseAsStringArray,
    isochrone: parseAsStringArray,
    radius: parseAsStringArray,
    geo_src: parseAsGeoSource,
    marker: parseAsMarkerType,
    sort: parseAsSortField,
    order: parseAsSortOrder,
    bbox: parseAsBbox,
    bathrooms: parseAsNumberArray,
};
