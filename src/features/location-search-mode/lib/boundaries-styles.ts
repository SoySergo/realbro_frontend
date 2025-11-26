/**
 * Константы стилей для слоев boundaries
 * Поддерживает светлую и темную темы
 * 
 * Переиспользуется из location-filter для консистентности стилей
 */

export type BoundariesTheme = 'light' | 'dark';

export interface BoundariesLayerColors {
    // Заливка
    fillDefault: string;
    fillSelected: string;
    fillHover: string;
    fillOpacityDefault: number;
    fillOpacitySelected: number;
    fillOpacityHover: number;

    // Линии
    lineDefault: string;
    lineSelected: string;
    lineHover: string;
    lineWidthDefault: number;
    lineWidthSelected: number;
    lineWidthHover: number;
    lineOpacityDefault: number;
    lineOpacitySelected: number;
    lineOpacityHover: number;

    // Текст
    textColor: string;
    textHalo: string;
    textOpacity: number;
}

/**
 * Цветовые схемы для разных тем
 */
export const LAYER_COLORS: Record<BoundariesTheme, BoundariesLayerColors> = {
    light: {
        fillDefault: '#9ca3af',
        fillSelected: '#3b82f6',
        fillHover: '#60a5fa',
        fillOpacityDefault: 0.2,
        fillOpacitySelected: 0.4,
        fillOpacityHover: 0.5,
        lineDefault: '#60a5fa',
        lineSelected: '#3b82f6',
        lineHover: '#3b82f6',
        lineWidthDefault: 1,
        lineWidthSelected: 2,
        lineWidthHover: 2.5,
        lineOpacityDefault: 1,
        lineOpacitySelected: 1,
        lineOpacityHover: 1,
        textColor: '#1e293b',
        textHalo: '#ffffff',
        textOpacity: 1,
    },
    dark: {
        fillDefault: '#1A1A1A',
        fillSelected: '#198BFF',
        fillHover: '#3DA1FF',
        fillOpacityDefault: 0.9,
        fillOpacitySelected: 0.95,
        fillOpacityHover: 0.95,
        lineDefault: '#3DA1FF',
        lineSelected: '#198BFF',
        lineHover: '#198BFF',
        lineWidthDefault: 1.5,
        lineWidthSelected: 2,
        lineWidthHover: 2.5,
        lineOpacityDefault: 0.8,
        lineOpacitySelected: 1,
        lineOpacityHover: 1,
        textColor: '#F8F9FA',
        textHalo: '#0F0F0F',
        textOpacity: 0.9,
    },
} as const;

export { BOUNDARIES_LAYER_IDS, BOUNDARIES_SOURCE_CONFIG } from './boundaries-constants';
