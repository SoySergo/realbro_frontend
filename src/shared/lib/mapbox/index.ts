import env from '@/shared/config/env';

/**
 * Варианты стилей карты:
 * - location: режим фильтрации локаций (поиск по границам, тайлы с бекенда)
 * - search: обычный поиск объектов, страницы .../[locale]/[slug]/map
 * - propertyDetail: детали объекта (карточка недвижимости)
 */
export type MapStyleVariant = 'location' | 'search' | 'propertyDetail';

// Стили карты для каждого варианта и темы
export const mapStyles: Record<MapStyleVariant, { light: string; dark: string }> = {
    location: {
        light: 'mapbox://styles/serhii11/cmi1xomdn00o801quespmffuq',
        dark: 'mapbox://styles/serhii11/cmn4dr55u000901sa6ej1crw3',
    },
    search: {
        light: 'mapbox://styles/serhii11/cmn4gpadr000i01sa4svqec7w',
        dark: 'mapbox://styles/serhii11/cmn4eb9eg00m501s96egx35re',
    },
    propertyDetail: {
        light: 'mapbox://styles/serhii11/cmn4gt1xo000001qsds8rc7s2',
        dark: 'mapbox://styles/serhii11/cmn4ekzqb000a01qscao67u2e',
    },
};

/**
 * Получить URL стиля карты по варианту и теме
 */
export function getMapStyleUrl(variant: MapStyleVariant, theme: 'light' | 'dark'): string {
    return mapStyles[variant][theme];
}

export const mapboxConfig = {
    accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN,

    // Настройки карты
    options: {
        attributionControl: false,
        logoPosition: 'bottom-right' as const,
    },
};
