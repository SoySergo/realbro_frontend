import { useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import env from '@/shared/config/env';
import {
    LAYER_COLORS,
    BOUNDARIES_LAYER_IDS,
    BOUNDARIES_SOURCE_CONFIG,
    type BoundariesTheme,
} from '../../lib/boundaries-styles';

type UseBoundariesLayerProps = {
    map: mapboxgl.Map | null;
    theme: BoundariesTheme;
};

/**
 * Хук для инициализации и управления слоями boundaries на карте
 * 
 * Функциональность:
 * - Добавление source тайлов boundaries
 * - Создание слоев: fill, outline, labels
 * - Поддержка светлой и темной темы
 * - Автоматический cleanup при размонтировании
 * - Обновление стилей при смене темы
 */
export function useBoundariesLayer({ map, theme }: UseBoundariesLayerProps): void {
    // Функция инициализации слоя
    const initializeBoundariesLayer = useCallback(() => {
        if (!map || !map.isStyleLoaded()) {
            console.warn('[useBoundariesLayer] Map or style not loaded');
            return false;
        }

        // Проверяем, не добавлен ли уже источник
        if (map.getSource(BOUNDARIES_LAYER_IDS.SOURCE)) {
            console.log('[useBoundariesLayer] Boundaries source already exists');
            return false;
        }

        const colors = LAYER_COLORS[theme];

        console.log('[useBoundariesLayer] Initializing boundaries layer, tiles:', env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL);

        // Добавляем источник тайлов
        map.addSource(BOUNDARIES_LAYER_IDS.SOURCE, {
            type: 'vector',
            tiles: [`${env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL}/api/v1/boundaries/tiles/{z}/{x}/{y}.pbf`],
            minzoom: BOUNDARIES_SOURCE_CONFIG.MIN_ZOOM,
            maxzoom: BOUNDARIES_SOURCE_CONFIG.MAX_ZOOM,
            promoteId: BOUNDARIES_SOURCE_CONFIG.PROMOTE_ID,
        });

        // Находим первый символьный слой для вставки boundaries под ним
        const layers = map.getStyle().layers;
        let firstSymbolId: string | undefined;
        for (const layer of layers || []) {
            if (layer.type === 'symbol') {
                firstSymbolId = layer.id;
                break;
            }
        }

        // Добавляем слой заливки
        map.addLayer(
            {
                id: BOUNDARIES_LAYER_IDS.FILL,
                type: 'fill',
                source: BOUNDARIES_LAYER_IDS.SOURCE,
                'source-layer': BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.fillSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillHover,
                        colors.fillDefault,
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.fillOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillOpacityHover,
                        colors.fillOpacityDefault,
                    ],
                },
            },
            firstSymbolId
        );

        // Добавляем слой контура
        map.addLayer(
            {
                id: BOUNDARIES_LAYER_IDS.OUTLINE,
                type: 'line',
                source: BOUNDARIES_LAYER_IDS.SOURCE,
                'source-layer': BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineHover,
                        colors.lineDefault,
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineWidthSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineWidthHover,
                        colors.lineWidthDefault,
                    ],
                    'line-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineOpacityHover,
                        colors.lineOpacityDefault,
                    ],
                },
            },
            firstSymbolId
        );

        // Добавляем слой меток
        map.addLayer({
            id: BOUNDARIES_LAYER_IDS.LABELS,
            type: 'symbol',
            source: BOUNDARIES_LAYER_IDS.SOURCE,
            'source-layer': BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
            layout: {
                'text-field': ['get', 'name'],
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                'text-size': 12,
                'text-anchor': 'center',
                'text-max-width': 8,
                'symbol-placement': 'point',
                'symbol-sort-key': ['get', 'osm_id'],
                'text-allow-overlap': false,
                'text-ignore-placement': false,
                'symbol-z-order': 'auto',
            },
            paint: {
                'text-color': colors.textColor,
                'text-halo-color': colors.textHalo,
                'text-halo-width': 1.5,
                'text-opacity': colors.textOpacity,
            },
        });

        console.log('[useBoundariesLayer] Layers added successfully');
        return true;
    }, [map, theme]);

    // Инициализация слоя при монтировании
    useEffect(() => {
        if (!map) return;

        let isCleanedUp = false;

        // Если карта ещё не загружена, ждем события load
        if (!map.isStyleLoaded()) {
            const handleLoad = () => {
                if (!isCleanedUp) {
                    initializeBoundariesLayer();
                }
            };

            map.once('styledata', handleLoad);

            return () => {
                isCleanedUp = true;
                map.off('styledata', handleLoad);
            };
        }

        // Иначе инициализируем сразу
        const initialized = initializeBoundariesLayer();

        // Cleanup при размонтировании
        return () => {
            isCleanedUp = true;

            if (!map || !initialized) return;

            console.log('[useBoundariesLayer] Cleaning up boundaries layer');

            // Удаляем слои в безопасном режиме
            try {
                if (map.getLayer(BOUNDARIES_LAYER_IDS.LABELS)) {
                    map.removeLayer(BOUNDARIES_LAYER_IDS.LABELS);
                }
                if (map.getLayer(BOUNDARIES_LAYER_IDS.OUTLINE)) {
                    map.removeLayer(BOUNDARIES_LAYER_IDS.OUTLINE);
                }
                if (map.getLayer(BOUNDARIES_LAYER_IDS.FILL)) {
                    map.removeLayer(BOUNDARIES_LAYER_IDS.FILL);
                }

                // Удаляем источник
                if (map.getSource(BOUNDARIES_LAYER_IDS.SOURCE)) {
                    map.removeSource(BOUNDARIES_LAYER_IDS.SOURCE);
                }

                console.log('[useBoundariesLayer] Boundaries layer removed');
            } catch (error) {
                console.warn('[useBoundariesLayer] Error during cleanup:', error);
            }
        };
    }, [map, initializeBoundariesLayer]);

    // Обновление стилей при смене темы
    useEffect(() => {
        if (!map || !map.isStyleLoaded() || !map.getLayer(BOUNDARIES_LAYER_IDS.FILL)) return;

        const colors = LAYER_COLORS[theme];

        console.log('[useBoundariesLayer] Updating layer colors for theme:', theme);

        // Обновляем заливку
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.FILL, 'fill-color', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.fillSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.fillHover,
            colors.fillDefault,
        ]);
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.FILL, 'fill-opacity', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.fillOpacitySelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.fillOpacityHover,
            colors.fillOpacityDefault,
        ]);

        // Обновляем контур
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.OUTLINE, 'line-color', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineHover,
            colors.lineDefault,
        ]);
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.OUTLINE, 'line-width', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineWidthSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineWidthHover,
            colors.lineWidthDefault,
        ]);
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.OUTLINE, 'line-opacity', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineOpacitySelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineOpacityHover,
            colors.lineOpacityDefault,
        ]);

        // Обновляем метки
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.LABELS, 'text-color', colors.textColor);
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.LABELS, 'text-halo-color', colors.textHalo);
        map.setPaintProperty(BOUNDARIES_LAYER_IDS.LABELS, 'text-opacity', colors.textOpacity);
    }, [theme, map]);
}
