'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useLocalLocationState } from '@/features/location-filter/model/use-local-location-state';
import { getDisplayName } from '@/features/location-search-mode/lib/boundaries-helpers';
import { getLocationType } from '@/entities/boundary';
import type { BoundaryFeature } from '@/entities/boundary';
import type { LocationItem } from '@/entities/location';

type BoundariesSyncProps = {
    /** Инстанс карты Mapbox */
    map: mapboxgl.Map | null;
    /** Активен ли режим поиска */
    isActive: boolean;
};

/**
 * Компонент синхронизации кликов на границы карты с режимом поиска локаций
 * Добавляет обработчик кликов на слой boundaries-fill
 * При клике на полигон добавляет/удаляет локацию из списка выбранных (toggle)
 * 
 * @deprecated Функциональность перенесена в BoundariesVisualLayer + useBoundariesClickHandler
 * Этот компонент оставлен для обратной совместимости
 */
export function BoundariesSync({ map, isActive }: BoundariesSyncProps) {
    const { currentLocalState, updateSearchState } = useLocalLocationState('search');

    // Refs для актуальных значений в обработчиках событий
    const updateSearchStateRef = useRef(updateSearchState);
    const localStateRef = useRef(currentLocalState);

    // Обновляем refs при изменении значений
    useEffect(() => {
        updateSearchStateRef.current = updateSearchState;
        localStateRef.current = currentLocalState;
    }, [updateSearchState, currentLocalState]);

    // Добавление обработчика кликов на границы
    useEffect(() => {
        if (!map || !isActive) return;

        // Проверяем, что слой boundaries существует
        if (!map.getLayer('boundaries-fill')) {
            console.warn('[BoundariesSync] boundaries-fill layer not found');
            return;
        }

        // Обработчик клика на полигон
        const handleBoundaryClick = (e: mapboxgl.MapMouseEvent) => {
            if (!e.features || e.features.length === 0) return;

            const feature = e.features[0] as unknown as BoundaryFeature;
            const props = feature.properties;

            if (!props || !props.osm_id) {
                console.warn('[BoundariesSync] Feature has no osm_id');
                return;
            }

            // Проверяем наличие wikidata для синхронизации
            if (!props.wikidata || typeof props.wikidata !== 'string') {
                console.warn('[BoundariesSync] Boundary has no wikidata, cannot sync:', props.osm_id);
                return;
            }

            // Определяем язык пользователя для выбора правильного имени
            const userLang = document.documentElement.lang || 'en';
            const displayName = getDisplayName(props, userLang);

            // Создаём объект локации
            const newLocation: LocationItem = {
                id: props.osm_id,
                name: displayName,
                type: getLocationType(props.admin_level),
                adminLevel: props.admin_level,
                wikidata: props.wikidata,
                osmId: props.osm_id,
            };

            // Получаем текущий список выбранных локаций
            const localSearchState = localStateRef.current as { selectedLocations: LocationItem[] } | null;
            const currentLocations = localSearchState?.selectedLocations || [];

            // Проверяем, выбрана ли уже эта локация (по wikidata)
            const existingIndex = currentLocations.findIndex(
                (loc: LocationItem) => loc.wikidata === props.wikidata
            );

            if (existingIndex >= 0) {
                // Удаляем если уже выбрано (toggle off)
                const newLocations = currentLocations.filter((_: LocationItem, idx: number) => idx !== existingIndex);
                updateSearchStateRef.current({ selectedLocations: newLocations });
                console.log('[BoundariesSync] Location removed:', props.wikidata, displayName);
            } else {
                // Добавляем если не выбрано (toggle on)
                const newLocations = [...currentLocations, newLocation];
                updateSearchStateRef.current({ selectedLocations: newLocations });
                console.log('[BoundariesSync] Location added:', props.wikidata, displayName);
            }
        };

        // Добавляем обработчик
        console.log('[BoundariesSync] Attaching click handler to boundaries-fill');
        map.on('click', 'boundaries-fill', handleBoundaryClick);

        // Cleanup
        return () => {
            if (map && map.getLayer('boundaries-fill')) {
                map.off('click', 'boundaries-fill', handleBoundaryClick);
                console.log('[BoundariesSync] Click handler removed');
            }
        };
    }, [map, isActive]);

    return null;
}
