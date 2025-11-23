'use client';

import { useTheme } from 'next-themes';
import mapboxgl from 'mapbox-gl';
import { useFilterStore } from '@/store/filterStore';
import { useBoundariesLayer } from './hooks/useBoundariesLayer';
import { useBoundariesHover } from './hooks/useBoundariesHover';
import { useBoundariesSelection } from './hooks/useBoundariesSelection';
import { useBoundariesClickHandler } from './hooks/useBoundariesClickHandler';
import type { BoundariesTheme } from '../shared/constants/boundariesStyles';
import type { LocationItem } from '@/types/filter';

interface BoundariesVisualLayerProps {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map | null;
    /** Активен ли режим поиска (для обработки кликов) */
    isActive: boolean;
    /** Выбранные локации */
    selectedLocations: LocationItem[];
    /** Callback для toggle локации при клике на полигон */
    onToggleLocation: (location: LocationItem) => void;
}

/**
 * Компонент для визуализации слоя boundaries на карте
 * 
 * Объединяет все хуки для полноценной работы с границами:
 * - useBoundariesLayer: инициализация и управление слоями
 * - useBoundariesHover: hover эффекты
 * - useBoundariesSelection: визуальное выделение выбранных границ
 * - useBoundariesClickHandler: обработка кликов и toggle логика
 * 
 * Интегрируется с:
 * - Локальным состоянием (search mode) через useLocalLocationState
 * - Глобальным состоянием (применённые фильтры) через useFilterStore
 * - Темой приложения через useTheme
 */
export function BoundariesVisualLayer({ map, isActive, selectedLocations, onToggleLocation }: BoundariesVisualLayerProps) {
    // Тема для стилизации слоёв
    const { theme, resolvedTheme } = useTheme();
    const currentTheme = (resolvedTheme || theme || 'light') as BoundariesTheme;

    // Глобальное состояние (применённые фильтры)
    const { selectedBoundaryWikidata } = useFilterStore();

    console.log('[BoundariesVisualLayer] Rendering, active:', isActive, 'selected:', selectedLocations.length);

    // 1. Инициализация и управление слоями boundaries
    useBoundariesLayer({
        map,
        theme: currentTheme,
    });

    // 2. Hover эффекты (всегда включены, если слой есть)
    useBoundariesHover({
        map,
        isEnabled: true,
    });

    // 3. Визуальное выделение выбранных границ
    useBoundariesSelection({
        map,
        localSelectedLocations: selectedLocations,
        globalSelectedWikidata: selectedBoundaryWikidata,
    });

    // 4. Обработка кликов (только если режим активен)
    useBoundariesClickHandler({
        map,
        isEnabled: isActive,
        onToggleLocation,
    });

    return null;
}
