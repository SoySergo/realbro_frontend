import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { BOUNDARIES_LAYER_IDS } from '../../lib/boundaries-constants';
import type { BoundaryFeature } from '@/entities/boundary';

type UseBoundariesHoverProps = {
    map: mapboxgl.Map | null;
    isEnabled: boolean;
};

/**
 * Хук для обработки hover эффектов на слое boundaries
 * 
 * Функциональность:
 * - Изменение курсора на pointer при наведении
 * - Установка feature-state hover для изменения стилей
 * - Автоматическая очистка предыдущего hover состояния
 */
export function useBoundariesHover({ map, isEnabled }: UseBoundariesHoverProps): void {
    const hoveredFeatureIdRef = useRef<string | number | null>(null);
    const handlersAttachedRef = useRef(false);

    useEffect(() => {
        if (!map || !isEnabled) return;

        let isCleanedUp = false;

        // Обработчик наведения
        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (!map || isCleanedUp) return;

            map.getCanvas().style.cursor = 'pointer';

            if (e.features && e.features.length > 0) {
                const feature = e.features[0] as unknown as BoundaryFeature;

                if (feature.id === undefined) {
                    console.warn('[useBoundariesHover] Feature has no ID:', feature.properties);
                    return;
                }

                // Убираем hover с предыдущего feature
                if (hoveredFeatureIdRef.current !== null && hoveredFeatureIdRef.current !== feature.id) {
                    try {
                        map.setFeatureState(
                            {
                                source: BOUNDARIES_LAYER_IDS.SOURCE,
                                sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                                id: hoveredFeatureIdRef.current,
                            },
                            { hover: false }
                        );
                    } catch (error) {
                        console.warn('[useBoundariesHover] Error removing hover state:', error);
                    }
                }

                // Устанавливаем hover на текущий feature
                try {
                    hoveredFeatureIdRef.current = feature.id as string | number;
                    map.setFeatureState(
                        {
                            source: BOUNDARIES_LAYER_IDS.SOURCE,
                            sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                            id: hoveredFeatureIdRef.current,
                        },
                        { hover: true }
                    );
                } catch (error) {
                    console.warn('[useBoundariesHover] Error setting hover state:', error);
                }
            }
        };

        // Обработчик ухода курсора
        const handleMouseLeave = () => {
            if (!map || isCleanedUp) return;

            map.getCanvas().style.cursor = '';

            // Убираем hover состояние
            if (hoveredFeatureIdRef.current !== null) {
                try {
                    map.setFeatureState(
                        {
                            source: BOUNDARIES_LAYER_IDS.SOURCE,
                            sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                            id: hoveredFeatureIdRef.current,
                        },
                        { hover: false }
                    );
                } catch (error) {
                    console.warn('[useBoundariesHover] Error clearing hover state:', error);
                }
                hoveredFeatureIdRef.current = null;
            }
        };

        // Функция для подключения обработчиков
        const attachHandlers = () => {
            if (isCleanedUp || handlersAttachedRef.current) return;

            if (!map.getLayer(BOUNDARIES_LAYER_IDS.FILL)) {
                return false;
            }

            try {
                console.log('[useBoundariesHover] Attaching hover handlers');
                map.on('mousemove', BOUNDARIES_LAYER_IDS.FILL, handleMouseMove);
                map.on('mouseleave', BOUNDARIES_LAYER_IDS.FILL, handleMouseLeave);
                handlersAttachedRef.current = true;
                return true;
            } catch (error) {
                console.warn('[useBoundariesHover] Error attaching handlers:', error);
                return false;
            }
        };

        // Пытаемся подключить обработчики сразу
        if (!attachHandlers()) {
            // Если не получилось, ждем загрузки слоя
            const handleSourceData = () => {
                if (isCleanedUp) return;
                attachHandlers();
            };

            map.on('sourcedata', handleSourceData);

            // Cleanup для sourcedata
            return () => {
                isCleanedUp = true;
                handlersAttachedRef.current = false;
                map.off('sourcedata', handleSourceData);
            };
        }

        // Cleanup
        return () => {
            isCleanedUp = true;
            handlersAttachedRef.current = false;

            if (map && map.getLayer(BOUNDARIES_LAYER_IDS.FILL)) {
                try {
                    map.off('mousemove', BOUNDARIES_LAYER_IDS.FILL, handleMouseMove);
                    map.off('mouseleave', BOUNDARIES_LAYER_IDS.FILL, handleMouseLeave);
                    console.log('[useBoundariesHover] Hover handlers removed');
                } catch (error) {
                    console.warn('[useBoundariesHover] Error removing handlers:', error);
                }
            }

            // Очищаем курсор
            if (map) {
                map.getCanvas().style.cursor = '';
            }

            // Очищаем hover состояние
            if (map && hoveredFeatureIdRef.current !== null) {
                try {
                    map.setFeatureState(
                        {
                            source: BOUNDARIES_LAYER_IDS.SOURCE,
                            sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                            id: hoveredFeatureIdRef.current,
                        },
                        { hover: false }
                    );
                } catch {
                    // Игнорируем ошибки при cleanup
                }
            }
        };
    }, [map, isEnabled]);
}
