import { useEffect, useRef } from 'react';
import { BOUNDARIES_LAYER_IDS } from '../../lib/boundaries-constants';
import { boundaryToLocationItem, hasValidWikidata } from '../../lib/boundaries-helpers';
import type { BoundaryFeature } from '@/entities/boundary';
import type { LocationItem } from '@/entities/location';

type UseBoundariesClickHandlerProps = {
    map: mapboxgl.Map | null;
    isEnabled: boolean;
    /** Callback для toggle локации */
    onToggleLocation: (location: LocationItem) => void;
};

/**
 * Хук для обработки кликов на слой boundaries
 * 
 * Функциональность:
 * - Обработка кликов на полигоны границ
 * - Toggle логика (добавление/удаление локации)
 * - Проверка наличия wikidata для синхронизации
 * - Интеграция с локальным состоянием через updateSearchState
 * - Мультиязычность: выбор правильного имени локации
 */
export function useBoundariesClickHandler({
    map,
    isEnabled,
    onToggleLocation,
}: UseBoundariesClickHandlerProps): void {
    // Refs для актуальных значений в обработчиках событий
    const onToggleLocationRef = useRef(onToggleLocation);
    const handlersAttachedRef = useRef(false);

    // Обновляем ref при изменении
    useEffect(() => {
        onToggleLocationRef.current = onToggleLocation;
    }, [onToggleLocation]);

    useEffect(() => {
        if (!map || !isEnabled) return;

        let isCleanedUp = false;

        // Обработчик клика на полигон
        const handleBoundaryClick = (e: mapboxgl.MapMouseEvent) => {
            if (isCleanedUp) return;
            if (!e.features || e.features.length === 0) return;

            const feature = e.features[0] as unknown as BoundaryFeature;
            const props = feature.properties;

            if (!props || !props.osm_id) {
                console.warn('[useBoundariesClickHandler] Feature has no osm_id');
                return;
            }

            // Проверяем наличие wikidata для синхронизации
            if (!hasValidWikidata(props)) {
                console.warn('[useBoundariesClickHandler] Boundary has no wikidata, cannot sync:', props.osm_id);
                return;
            }

            // Определяем язык пользователя
            const userLang = document.documentElement.lang || 'en';

            // Преобразуем в LocationItem
            const newLocation = boundaryToLocationItem(props, userLang);

            console.log('[useBoundariesClickHandler] Boundary clicked:', {
                osm_id: props.osm_id,
                wikidata: props.wikidata,
                name: newLocation.name,
                type: newLocation.type,
            });

            // Toggle локацию через callback
            onToggleLocationRef.current(newLocation);
        };

        // Функция для подключения обработчика
        const attachHandler = () => {
            if (isCleanedUp || handlersAttachedRef.current) return;

            if (!map.getLayer(BOUNDARIES_LAYER_IDS.FILL)) {
                return false;
            }

            try {
                console.log('[useBoundariesClickHandler] Attaching click handler to boundaries-fill');
                map.on('click', BOUNDARIES_LAYER_IDS.FILL, handleBoundaryClick);
                handlersAttachedRef.current = true;
                return true;
            } catch (error) {
                console.warn('[useBoundariesClickHandler] Error attaching handler:', error);
                return false;
            }
        };

        // Пытаемся подключить обработчик сразу
        if (!attachHandler()) {
            // Если не получилось, ждем загрузки слоя
            const handleSourceData = () => {
                if (isCleanedUp) return;
                attachHandler();
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
                    map.off('click', BOUNDARIES_LAYER_IDS.FILL, handleBoundaryClick);
                    console.log('[useBoundariesClickHandler] Click handler removed');
                } catch (error) {
                    console.warn('[useBoundariesClickHandler] Error removing handler:', error);
                }
            }
        };
    }, [map, isEnabled]);
}
