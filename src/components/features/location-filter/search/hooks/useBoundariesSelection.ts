import { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { BOUNDARIES_LAYER_IDS } from '../../shared/constants/boundariesStyles';
import type { LocationItem } from '@/types/filter';

type UseBoundariesSelectionProps = {
    map: mapboxgl.Map | null;
    /** Выбранные локации из локального состояния */
    localSelectedLocations: LocationItem[];
    /** Выбранные wikidata ID из глобального состояния (примененные фильтры) */
    globalSelectedWikidata: Set<string>;
};

/**
 * Хук для управления выделением boundaries через feature-state
 * 
 * Функциональность:
 * - Сбор маппинга wikidata -> osm_id при загрузке тайлов
 * - Синхронизация feature-state selected с локальным и глобальным состояниями
 * - Обновление визуального выделения границ на карте
 */
export function useBoundariesSelection({
    map,
    localSelectedLocations,
    globalSelectedWikidata,
}: UseBoundariesSelectionProps): void {
    // Маппинг wikidata -> osm_id
    const wikidataToOsmIdRef = useRef<Map<string, number>>(new Map());
    const prevSelectedWikidataRef = useRef<Set<string>>(new Set());
    const pendingSelectionsRef = useRef<Set<string>>(new Set());

    // Собираем маппинг wikidata -> osm_id при загрузке тайлов
    useEffect(() => {
        if (!map) return;

        const handleSourceData = (e: mapboxgl.MapSourceDataEvent) => {
            if (e.sourceId === BOUNDARIES_LAYER_IDS.SOURCE && e.isSourceLoaded) {
                // Собираем все features из загруженных тайлов
                const features = map.querySourceFeatures(BOUNDARIES_LAYER_IDS.SOURCE, {
                    sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                });

                let mappingsAdded = 0;
                features.forEach((feature) => {
                    const props = feature.properties;
                    const featureId = feature.id;
                    if (props?.wikidata && typeof props.wikidata === 'string' && featureId !== undefined) {
                        // Используем feature.id напрямую (это osm_id из promoteId)
                        const osmId = typeof featureId === 'number' ? featureId : parseInt(String(featureId), 10);
                        if (!wikidataToOsmIdRef.current.has(props.wikidata)) {
                            wikidataToOsmIdRef.current.set(props.wikidata, osmId);
                            mappingsAdded++;

                            // Если есть pending selection для этого wikidata, применяем
                            if (pendingSelectionsRef.current.has(props.wikidata)) {
                                try {
                                    map.setFeatureState(
                                        {
                                            source: BOUNDARIES_LAYER_IDS.SOURCE,
                                            sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                                            id: osmId,
                                        },
                                        { selected: true }
                                    );
                                    pendingSelectionsRef.current.delete(props.wikidata);
                                    console.log('[useBoundariesSelection] Applied pending selection for:', props.wikidata);
                                } catch (error) {
                                    console.warn('[useBoundariesSelection] Error applying pending selection:', error);
                                }
                            }
                        }
                    }
                });

                if (mappingsAdded > 0) {
                    console.log(
                        `[useBoundariesSelection] Added ${mappingsAdded} wikidata mappings, total: ${wikidataToOsmIdRef.current.size}`
                    );
                }
            }
        };

        map.on('sourcedata', handleSourceData);

        return () => {
            map.off('sourcedata', handleSourceData);
        };
    }, [map]);

    // Ref для текущего списка локаций (чтобы использовать в useEffect без лишних рендеров)
    const localSelectedLocationsRef = useRef(localSelectedLocations);
    localSelectedLocationsRef.current = localSelectedLocations;

    // Создаем стабильный ключ для отслеживания изменений локальных локаций
    const localSelectedWikidataKey = useMemo(() => {
        return localSelectedLocations
            .filter(loc => loc.wikidata)
            .map(loc => loc.wikidata)
            .sort()
            .join(',');
    }, [localSelectedLocations]);

    // Обновление состояния выбранных границ (локальное + глобальное)
    useEffect(() => {
        if (!map || !map.getSource(BOUNDARIES_LAYER_IDS.SOURCE)) return;

        // Собираем все wikidata из локального и глобального состояния
        const allSelectedWikidata = new Set<string>();

        // Добавляем из локального состояния (используем ref для актуальных данных)
        localSelectedLocationsRef.current.forEach((loc: LocationItem) => {
            if (loc.wikidata) {
                allSelectedWikidata.add(loc.wikidata);
            }
        });

        // Добавляем из глобального состояния
        globalSelectedWikidata.forEach((wikidata: string) => {
            allSelectedWikidata.add(wikidata);
        });

        console.log(
            '[useBoundariesSelection] Updating selected boundaries, local:',
            localSelectedLocationsRef.current.length,
            'global:',
            globalSelectedWikidata.size,
            'total selected:',
            allSelectedWikidata.size,
            'localKey:',
            localSelectedWikidataKey
        );

        const prevWikidata = prevSelectedWikidataRef.current;

        // Убираем selected с предыдущих
        prevWikidata.forEach((wikidata: string) => {
            if (!allSelectedWikidata.has(wikidata)) {
                const osmId = wikidataToOsmIdRef.current.get(wikidata);
                if (osmId !== undefined) {
                    try {
                        map.setFeatureState(
                            {
                                source: BOUNDARIES_LAYER_IDS.SOURCE,
                                sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                                id: osmId,
                            },
                            { selected: false }
                        );
                        console.log('[useBoundariesSelection] Deselected:', wikidata);
                    } catch (error) {
                        console.warn('[useBoundariesSelection] Error removing selected state:', error);
                    }
                }
                pendingSelectionsRef.current.delete(wikidata);
            }
        });

        // Добавляем selected к новым
        allSelectedWikidata.forEach((wikidata: string) => {
            const osmId = wikidataToOsmIdRef.current.get(wikidata);
            if (osmId !== undefined) {
                try {
                    map.setFeatureState(
                        {
                            source: BOUNDARIES_LAYER_IDS.SOURCE,
                            sourceLayer: BOUNDARIES_LAYER_IDS.SOURCE_LAYER,
                            id: osmId,
                        },
                        { selected: true }
                    );
                    console.log('[useBoundariesSelection] Selected:', wikidata, 'osmId:', osmId);
                } catch (error) {
                    console.warn('[useBoundariesSelection] Error setting selected state:', error);
                }
            } else {
                // osm_id не найден - тайл ещё не загружен, добавляем в pending
                pendingSelectionsRef.current.add(wikidata);
                console.log('[useBoundariesSelection] Pending selection (tile not loaded):', wikidata);
            }
        });

        prevSelectedWikidataRef.current = allSelectedWikidata;
    }, [map, globalSelectedWikidata, localSelectedWikidataKey]);
}
