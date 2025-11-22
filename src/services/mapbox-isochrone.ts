import env from '@/config/env';

/**
 * Сервис для работы с Mapbox Isochrone API
 * Построение изохронов - областей доступности за определённое время
 */

const MAPBOX_ISOCHRONE_URL = 'https://api.mapbox.com/isochrone/v1/mapbox';

// Профили передвижения
export type IsochroneProfile = 'walking' | 'cycling' | 'driving' | 'driving-traffic';

// Параметры запроса изохрона
export interface IsochroneParams {
    /** Координаты центра [lng, lat] */
    coordinates: [number, number];
    /** Профиль передвижения */
    profile: IsochroneProfile;
    /** Время в минутах (до 60) */
    minutes: number;
    /** Цвет полигона (опционально) */
    polygonColor?: string;
}

// GeoJSON Feature для изохрона
export interface IsochroneFeature {
    type: 'Feature';
    properties: {
        fill: string;
        fillOpacity: number;
        fillColor: string;
        color: string;
        contour: number;
        opacity: number;
    };
    geometry: {
        type: 'Polygon';
        coordinates: number[][][];
    };
}

// Ответ от Mapbox Isochrone API
export interface IsochroneResponse {
    type: 'FeatureCollection';
    features: IsochroneFeature[];
}

/**
 * Получить изохрон через Mapbox API
 * @returns GeoJSON Polygon координаты
 */
export async function getIsochrone(params: IsochroneParams): Promise<number[][][] | null> {
    const { coordinates, profile, minutes } = params;

    try {
        // Валидация параметров
        if (!coordinates || coordinates.length !== 2) {
            console.error('Invalid coordinates for isochrone:', coordinates);
            return null;
        }

        if (minutes < 1 || minutes > 60) {
            console.error('Minutes must be between 1 and 60:', minutes);
            return null;
        }

        // Формируем URL: /profile/lng,lat
        const [lng, lat] = coordinates;
        const url = `${MAPBOX_ISOCHRONE_URL}/${profile}/${lng},${lat}`;

        // Формируем query параметры
        const searchParams = new URLSearchParams({
            access_token: env.NEXT_PUBLIC_MAPBOX_TOKEN,
            contours_minutes: minutes.toString(),
            polygons: 'true', // Получаем полигоны
            denoise: '1', // Сглаживание контуров
        });

        console.log('Fetching isochrone:', { profile, minutes, coordinates });

        // Выполняем запрос
        const response = await fetch(`${url}?${searchParams.toString()}`);

        if (!response.ok) {
            console.error('Mapbox Isochrone API error:', response.status, response.statusText);
            return null;
        }

        const data: IsochroneResponse = await response.json();

        // Проверяем наличие результатов
        if (!data.features || data.features.length === 0) {
            console.warn('No isochrone features returned');
            return null;
        }

        // Возвращаем координаты первого полигона
        const isochronePolygon = data.features[0].geometry.coordinates;
        console.log('Isochrone fetched successfully');

        return isochronePolygon;
    } catch (error) {
        console.error('Failed to fetch isochrone:', error);
        return null;
    }
}

/**
 * Преобразовать профиль в читаемое название
 */
export function getProfileDisplayName(profile: IsochroneProfile): string {
    const profileNames: Record<IsochroneProfile, string> = {
        walking: 'Walking',
        cycling: 'Cycling',
        driving: 'Driving',
        'driving-traffic': 'Driving (Traffic)',
    };
    return profileNames[profile];
}

/**
 * Получить цвет для профиля
 */
export function getProfileColor(profile: IsochroneProfile): string {
    const profileColors: Record<IsochroneProfile, string> = {
        walking: '#28A745', // Зелёный
        cycling: '#FFC107', // Жёлтый
        driving: '#198BFF', // Синий
        'driving-traffic': '#DC3545', // Красный
    };
    return profileColors[profile];
}
