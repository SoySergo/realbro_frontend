'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useTheme } from 'next-themes';
import { useFilterStore } from '@/store/filterStore';
import { useLocalLocationState } from '@/hooks/useLocalLocationState';
import env from '@/config/env';
import type { BoundaryFeature } from '@/types/boundary';
import type { LocationItem } from '@/types/filter';

// Цвета слоёв для разных тем
const LAYER_COLORS = {
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

interface BoundariesLayerProps {
    map: mapboxgl.Map | null;
}

export function BoundariesLayer({ map }: BoundariesLayerProps) {
    const { theme, resolvedTheme } = useTheme();
    const {
        selectedBoundaryWikidata,
        activeLocationMode,
    } = useFilterStore();
    const hoveredFeatureIdRef = useRef<string | number | null>(null);

    // Локальное состояние для поиска локаций
    const {
        currentLocalState,
        updateSearchState,
    } = useLocalLocationState(activeLocationMode);

    // Refs для актуальных значений в обработчиках событий
    const updateSearchStateRef = useRef(updateSearchState);
    const localStateRef = useRef(currentLocalState);

    // Обновляем refs при изменении значений
    useEffect(() => {
        updateSearchStateRef.current = updateSearchState;
        localStateRef.current = currentLocalState;
    }, [updateSearchState, currentLocalState]);

    // Инициализация слоя границ
    useEffect(() => {
        if (!map) return;

        // Проверяем, не добавлен ли уже источник
        if (map.getSource('boundaries')) {
            console.log('Boundaries source already exists');
            return;
        }

        const currentTheme = resolvedTheme || theme || 'light';
        const colors = currentTheme === 'dark' ? LAYER_COLORS.dark : LAYER_COLORS.light;

        // Обработчик клика на полигон
        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            console.log('Click event fired, features:', e.features);

            if (e.features && e.features.length > 0) {
                const feature = e.features[0] as unknown as BoundaryFeature;

                if (feature.properties && feature.properties.osm_id) {
                    const userLang = document.documentElement.lang || 'en';
                    const props = feature.properties;

                    // Выбираем имя с приоритетом языка пользователя, fallback на базовое имя
                    let displayName = props.name;

                    if (userLang === 'ru' && props.name_ru) {
                        displayName = String(props.name_ru);
                    } else if (userLang === 'fr' && props.name_fr) {
                        displayName = String(props.name_fr);
                    } else if (userLang === 'en' && props.name_en) {
                        displayName = String(props.name_en);
                    } else if (userLang === 'es' && props.name_es) {
                        displayName = String(props.name_es);
                    } else if (userLang === 'ca' && props.name_ca) {
                        displayName = String(props.name_ca);
                    }

                    console.log('Selected boundary:', {
                        osm_id: props.osm_id,
                        admin_level: props.admin_level,
                        name: displayName,
                        wikidata: props.wikidata,
                        properties: props
                    });

                    // Добавляем по wikidata если есть, иначе пропускаем
                    if (!props.wikidata || typeof props.wikidata !== 'string') {
                        console.warn('Boundary has no wikidata, cannot sync with search:', props.osm_id);
                        return;
                    }

                    // Преобразуем admin_level в тип локации для бекенда
                    const getLocationType = (adminLevel: number): 'country' | 'province' | 'city' | 'district' | 'neighborhood' => {
                        switch (adminLevel) {
                            case 2: return 'country';
                            case 4: return 'province';
                            case 6: return 'province'; // регион
                            case 7: return 'city';
                            case 8: return 'city';
                            case 9: return 'district';
                            case 10: return 'neighborhood';
                            default: return 'neighborhood';
                        }
                    };

                    const newLocation: LocationItem = {
                        id: props.osm_id,
                        name: displayName,
                        type: getLocationType(props.admin_level),
                        adminLevel: props.admin_level,
                        wikidata: typeof props.wikidata === 'string' ? props.wikidata : undefined,
                        osmId: props.osm_id,
                    };

                    // Добавляем/удаляем из локального состояния (toggle)
                    const localSearchState = localStateRef.current as { selectedLocations: LocationItem[] } | null;
                    const currentLocations = localSearchState?.selectedLocations || [];

                    // Проверяем по wikidata
                    const existingIndex = props.wikidata
                        ? currentLocations.findIndex((loc: LocationItem) => loc.wikidata === props.wikidata)
                        : currentLocations.findIndex((loc: LocationItem) => loc.id === newLocation.id);

                    if (existingIndex >= 0) {
                        // Удаляем если уже выбрано (toggle off)
                        const newLocations = currentLocations.filter((_: LocationItem, idx: number) => idx !== existingIndex);
                        updateSearchStateRef.current({ selectedLocations: newLocations });
                        console.log('Location removed from local state:', props.wikidata, displayName);
                    } else {
                        // Добавляем если не выбрано (toggle on)
                        const newLocations = [...currentLocations, newLocation];
                        updateSearchStateRef.current({ selectedLocations: newLocations });
                        console.log('Location added to local state:', props.wikidata, displayName);
                    }
                }
            }
        };

        // Обработчик hover
        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (!map) return;

            map.getCanvas().style.cursor = 'pointer';

            if (e.features && e.features.length > 0) {
                const feature = e.features[0] as unknown as BoundaryFeature;

                if (feature.id === undefined) {
                    console.warn('Feature has no ID:', feature.properties);
                    return;
                }

                if (hoveredFeatureIdRef.current !== null && hoveredFeatureIdRef.current !== feature.id) {
                    try {
                        map.setFeatureState(
                            { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureIdRef.current },
                            { hover: false }
                        );
                    } catch (error) {
                        console.warn('Error removing hover state:', error);
                    }
                }

                try {
                    hoveredFeatureIdRef.current = feature.id as string | number;
                    map.setFeatureState(
                        { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureIdRef.current },
                        { hover: true }
                    );
                } catch (error) {
                    console.warn('Error setting hover state:', error);
                }
            }
        };

        const handleMouseLeave = () => {
            if (!map) return;

            map.getCanvas().style.cursor = '';

            if (hoveredFeatureIdRef.current !== null) {
                try {
                    map.setFeatureState(
                        { source: 'boundaries', sourceLayer: 'boundaries', id: hoveredFeatureIdRef.current },
                        { hover: false }
                    );
                } catch (error) {
                    console.warn('Error clearing hover state:', error);
                }
                hoveredFeatureIdRef.current = null;
            }
        };

        // Функция инициализации слоя
        const initializeBoundariesLayer = () => {
            console.log('Initializing boundaries layer, tiles:', env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL);

            if (map.getSource('boundaries')) {
                console.log('Source already added');
                return;
            }

            map.addSource('boundaries', {
                type: 'vector',
                tiles: [`${env.NEXT_PUBLIC_BOUNDARIES_SERVICE_URL}/api/v1/boundaries/tiles/{z}/{x}/{y}.pbf`],
                minzoom: 0,
                maxzoom: 18,
                promoteId: 'osm_id',
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

            map.addLayer({
                id: 'boundaries-fill',
                type: 'fill',
                source: 'boundaries',
                'source-layer': 'boundaries',
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.fillSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillHover,
                        colors.fillDefault
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.fillOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.fillOpacityHover,
                        colors.fillOpacityDefault
                    ],
                },
            }, firstSymbolId);

            map.addLayer({
                id: 'boundaries-outline',
                type: 'line',
                source: 'boundaries',
                'source-layer': 'boundaries',
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineHover,
                        colors.lineDefault
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineWidthSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineWidthHover,
                        colors.lineWidthDefault
                    ],
                    'line-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        colors.lineOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        colors.lineOpacityHover,
                        colors.lineOpacityDefault
                    ],
                },
            }, firstSymbolId);

            map.addLayer({
                id: 'boundaries-labels',
                type: 'symbol',
                source: 'boundaries',
                'source-layer': 'boundaries',
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

            console.log('Layers added, attaching event handlers');

            // Добавляем обработчики событий после загрузки данных источника
            const attachEventHandlers = () => {
                if (!map.getLayer('boundaries-fill')) {
                    console.warn('boundaries-fill layer not found, retrying...');
                    return;
                }

                console.log('Attaching event handlers to boundaries-fill');
                map.on('click', 'boundaries-fill', handleClick);
                map.on('mousemove', 'boundaries-fill', handleMouseMove);
                map.on('mouseleave', 'boundaries-fill', handleMouseLeave);
                console.log('Event handlers attached successfully');
            };

            // Ждем загрузки данных источника
            if (map.isSourceLoaded('boundaries')) {
                attachEventHandlers();
            } else {
                map.on('sourcedata', (e) => {
                    if (e.sourceId === 'boundaries' && e.isSourceLoaded) {
                        attachEventHandlers();
                    }
                });
            }
        };

        // Инициализируем слой сразу, так как карта уже загружена (передается из родителя)
        console.log('Map style loaded:', map.isStyleLoaded());
        initializeBoundariesLayer();

        return () => {
            if (!map) return;

            console.log('Cleaning up boundaries layer');

            // Отключаем обработчики событий
            if (map.getLayer('boundaries-fill')) {
                map.off('click', 'boundaries-fill', handleClick);
                map.off('mousemove', 'boundaries-fill', handleMouseMove);
                map.off('mouseleave', 'boundaries-fill', handleMouseLeave);
            }

            // Удаляем слои
            if (map.getLayer('boundaries-labels')) {
                map.removeLayer('boundaries-labels');
            }
            if (map.getLayer('boundaries-outline')) {
                map.removeLayer('boundaries-outline');
            }
            if (map.getLayer('boundaries-fill')) {
                map.removeLayer('boundaries-fill');
            }

            // Удаляем источник
            if (map.getSource('boundaries')) {
                map.removeSource('boundaries');
            }

            console.log('Boundaries layer removed');
        };
    }, [map, theme, resolvedTheme]);

    // Обновление выбранных границ по wikidata
    // Так как мы не можем использовать wikidata напрямую для setFeatureState (нужен osm_id),
    // нам нужно хранить маппинг wikidata -> osm_id
    const wikidataToOsmIdRef = useRef<Map<string, number>>(new Map());
    const prevSelectedWikidataRef = useRef<Set<string>>(new Set());

    // Собираем маппинг wikidata -> osm_id при загрузке тайлов
    useEffect(() => {
        if (!map || !map.getSource('boundaries')) return;

        const handleSourceData = (e: mapboxgl.MapSourceDataEvent) => {
            if (e.sourceId === 'boundaries' && e.isSourceLoaded && e.tile) {
                const features = map.querySourceFeatures('boundaries', {
                    sourceLayer: 'boundaries',
                });

                features.forEach((feature) => {
                    const props = feature.properties;
                    if (props?.wikidata && typeof props.wikidata === 'string' && props?.osm_id) {
                        wikidataToOsmIdRef.current.set(props.wikidata, props.osm_id);
                    }
                });
            }
        };

        map.on('sourcedata', handleSourceData);

        return () => {
            map.off('sourcedata', handleSourceData);
        };
    }, [map]);

    // Обновление состояния выбранных границ (из локального состояния + глобального)
    useEffect(() => {
        if (!map || !map.getSource('boundaries')) return;

        // Собираем все wikidata из локального и глобального состояния
        const localSearchState = currentLocalState as { selectedLocations: LocationItem[] } | null;
        const localLocations = localSearchState?.selectedLocations || [];

        const allSelectedWikidata = new Set<string>();

        // Добавляем из локального состояния
        localLocations.forEach((loc: LocationItem) => {
            if (loc.wikidata) {
                allSelectedWikidata.add(loc.wikidata);
            }
        });

        // Добавляем из глобального состояния (применённые фильтры)
        selectedBoundaryWikidata.forEach((wikidata: string) => {
            allSelectedWikidata.add(wikidata);
        });

        console.log('Updating selected boundaries, local:', localLocations.length, 'global:', selectedBoundaryWikidata.size);

        const prevWikidata = prevSelectedWikidataRef.current;

        // Убираем selected с предыдущих
        prevWikidata.forEach((wikidata: string) => {
            if (!allSelectedWikidata.has(wikidata)) {
                const osmId = wikidataToOsmIdRef.current.get(wikidata);
                if (osmId) {
                    try {
                        map.setFeatureState(
                            { source: 'boundaries', sourceLayer: 'boundaries', id: osmId },
                            { selected: false }
                        );
                    } catch (error) {
                        console.warn('Error removing selected state:', error);
                    }
                }
            }
        });

        // Добавляем selected к новым
        allSelectedWikidata.forEach((wikidata: string) => {
            const osmId = wikidataToOsmIdRef.current.get(wikidata);
            if (osmId) {
                try {
                    map.setFeatureState(
                        { source: 'boundaries', sourceLayer: 'boundaries', id: osmId },
                        { selected: true }
                    );
                } catch (error) {
                    console.warn('Error setting selected state:', error);
                }
            } else {
                // Возможно тайл ещё не загружен
                // console.warn('OSM ID not found for wikidata:', wikidata);
            }
        });

        prevSelectedWikidataRef.current = allSelectedWikidata;
    }, [map, selectedBoundaryWikidata, currentLocalState]);

    // Обработка смены темы
    useEffect(() => {
        if (!map || !map.isStyleLoaded() || !map.getLayer('boundaries-fill')) return;

        const currentTheme = resolvedTheme || theme || 'light';
        const colors = currentTheme === 'dark' ? LAYER_COLORS.dark : LAYER_COLORS.light;

        console.log('Updating layer colors for theme:', currentTheme);

        map.setPaintProperty('boundaries-fill', 'fill-color', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.fillSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.fillHover,
            colors.fillDefault
        ]);
        map.setPaintProperty('boundaries-fill', 'fill-opacity', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.fillOpacitySelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.fillOpacityHover,
            colors.fillOpacityDefault
        ]);

        map.setPaintProperty('boundaries-outline', 'line-color', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineHover,
            colors.lineDefault
        ]);
        map.setPaintProperty('boundaries-outline', 'line-width', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineWidthSelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineWidthHover,
            colors.lineWidthDefault
        ]);
        map.setPaintProperty('boundaries-outline', 'line-opacity', [
            'case',
            ['boolean', ['feature-state', 'selected'], false],
            colors.lineOpacitySelected,
            ['boolean', ['feature-state', 'hover'], false],
            colors.lineOpacityHover,
            colors.lineOpacityDefault
        ]);

        map.setPaintProperty('boundaries-labels', 'text-color', colors.textColor);
        map.setPaintProperty('boundaries-labels', 'text-halo-color', colors.textHalo);
        map.setPaintProperty('boundaries-labels', 'text-opacity', colors.textOpacity);
    }, [theme, resolvedTheme, map]);

    return null;
}
