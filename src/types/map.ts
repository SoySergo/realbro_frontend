import type { Property } from './property';

// Viewport карты (область отображения)
export type MapViewport = {
    latitude: number;
    longitude: number;
    zoom: number;
};

// Упрощенная версия Property для маркеров на карте
export type MapProperty = Pick<Property, 'id' | 'coordinates' | 'price' | 'type'> & {
    title?: string;
};

// Конфигурация маркера
export type MarkerConfig = {
    color?: string;
    size?: number;
};
