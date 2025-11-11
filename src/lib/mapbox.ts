import env from '@/config/env';

export const mapboxConfig = {
    accessToken: env.NEXT_PUBLIC_MAPBOX_TOKEN,
    style: 'mapbox://styles/mapbox/streets-v12',

    // Настройки карты
    options: {
        attributionControl: false,
        logoPosition: 'bottom-right' as const,
    },
};
