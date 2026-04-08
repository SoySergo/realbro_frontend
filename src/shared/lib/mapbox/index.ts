import env from '@/shared/config/env';

/**
 * Варианты стилей карты:
 * - search: обычный поиск объектов, страницы .../[locale]/[slug]/map
 * - propertyDetail: детали объекта (карточка недвижимости)
 */
export type MapStyleVariant = 'search' | 'propertyDetail';

// Стили карты для каждого варианта и темы
export const mapStyles: Record<MapStyleVariant, { light: string; dark: string }> = {
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
