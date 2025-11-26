/**
 * Константы для слоя boundaries на карте
 * Используются во всех хуках для работы с границами
 */

/**
 * Имена слоев на карте
 */
export const BOUNDARIES_LAYER_IDS = {
    SOURCE: 'boundaries',
    SOURCE_LAYER: 'boundaries',
    FILL: 'boundaries-fill',
    OUTLINE: 'boundaries-outline',
    LABELS: 'boundaries-labels',
} as const;

/**
 * Настройки для источника тайлов
 */
export const BOUNDARIES_SOURCE_CONFIG = {
    MIN_ZOOM: 0,
    MAX_ZOOM: 18,
    PROMOTE_ID: 'osm_id',
} as const;
