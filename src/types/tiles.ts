/**
 * Типы для работы с векторными тайлами административных границ
 */

// Конфигурация источника тайлов
export interface TileSourceConfig {
    /** URL шаблон для загрузки тайлов (должен содержать {z}/{x}/{y}) */
    url: string;
    /** Минимальный уровень зума */
    minZoom?: number;
    /** Максимальный уровень зума */
    maxZoom?: number;
    /** Имя слоя в PBF файлах */
    sourceLayer: string;
}

// Стили для границ
export interface BoundaryStyles {
    /** Цвет заливки */
    fillColor?: string;
    /** Прозрачность заливки (0-1) */
    fillOpacity?: number;
    /** Цвет границы */
    lineColor?: string;
    /** Ширина линии */
    lineWidth?: number;
    /** Прозрачность линии (0-1) */
    lineOpacity?: number;
}

// Опции для карты с административными границами
export interface AdminBoundariesMapOptions {
    /** Начальный центр карты [lng, lat] */
    center?: [number, number];
    /** Начальный зум */
    zoom?: number;
    /** Минимальный зум */
    minZoom?: number;
    /** Максимальный зум */
    maxZoom?: number;
    /** Стили для границ */
    styles?: BoundaryStyles;
    /** Показывать ли контролы навигации */
    showControls?: boolean;
    /** Обработчик клика на границу */
    onBoundaryClick?: (feature: BoundaryFeatureData) => void;
    /** Обработчик наведения на границу */
    onBoundaryHover?: (feature: BoundaryFeatureData | null) => void;
}

// Данные feature границы
export interface BoundaryFeatureData {
    id?: string | number;
    properties: Record<string, unknown>;
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][];
    };
}
