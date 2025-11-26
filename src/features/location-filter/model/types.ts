/**
 * Типы для фичи location-filter
 */

import type { DrawPolygon } from '@/entities/map-draw/model/types';
import type { LocationItem } from '@/entities/location';

// Режимы фильтра локации
export type LocationFilterMode = 'search' | 'draw' | 'isochrone' | 'radius';

// Настройки изохрона (время до точки)
export interface IsochroneSettings {
    center: [number, number]; // [lng, lat]
    profile: 'walking' | 'cycling' | 'driving';
    minutes: number; // 5, 10, 15, 30, 45, 60
}

// Настройки радиуса
export interface RadiusSettings {
    center: [number, number]; // [lng, lat]
    radiusKm: number;
}

// Локация для фильтра
export interface LocationFilter {
    mode: LocationFilterMode;
    selectedLocations?: LocationItem[]; // для режима search
    polygon?: DrawPolygon;
    isochrone?: IsochroneSettings;
    radius?: RadiusSettings;
}

// Локальное состояние для режима search (до применения)
export interface LocalSearchModeState {
    selectedLocations: LocationItem[];
}

// Локальное состояние для режима draw (до применения)
export interface LocalDrawModeState {
    polygon: DrawPolygon | null;
}

// Локальное состояние для режима isochrone (до применения)
export interface LocalIsochroneModeState {
    isochrone: IsochroneSettings | null;
}

// Локальное состояние для режима radius (до применения)
export interface LocalRadiusModeState {
    radius: RadiusSettings | null;
}

// Общий тип для локального состояния всех режимов
export interface LocalLocationStates {
    search: LocalSearchModeState;
    draw: LocalDrawModeState;
    isochrone: LocalIsochroneModeState;
    radius: LocalRadiusModeState;
}
