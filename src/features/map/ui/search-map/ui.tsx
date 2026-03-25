'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import { BaseMap } from '../base-map';
import { MapLocationController } from '@/features/location-filter';
import { MobileLocationMode } from '@/widgets/mobile-location-mode';
import { useFilters } from '@/features/search-filters/model/use-filters';
import { useActiveLocationMode } from '@/features/search-filters/model/use-location-mode';
import { useHoveredPropertyStore } from '../../model/use-hovered-property';
import { filtersToQueryString } from '@/entities/filter';
import { PropertyPopupContent } from './PropertyPopupContent';

// URL MVT тайлов — прямые запросы к бекенду (CORS на стороне бекенда)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const TILES_URL = `${API_BASE_URL}/api/v1/properties/tiles/{z}/{x}/{y}.pbf`;

// Имя source и layer для тайлов
const PROPERTIES_SOURCE = 'properties';
const PROPERTIES_LAYER_CLUSTERS = 'properties-clusters';
const PROPERTIES_LAYER_CLUSTER_COUNT = 'properties-cluster-count';
const PROPERTIES_LAYER_POINTS = 'properties-points';

type SearchMapProps = {
    /** Начальный центр карты [lng, lat] */
    initialCenter?: [number, number];
    /** Начальный зум */
    initialZoom?: number;
    /** Колбэк при клике на кластер — передаёт property_ids */
    onClusterClick?: (propertyIds: string[]) => void;
    /** Колбэк при клике на индивидуальный маркер */
    onMarkerClick?: (propertyId: string) => void;
    /** Колбэк при изменении видимой области карты — передаёт bbox */
    onBoundsChange?: (bbox: [number, number, number, number]) => void;
    /** ID свойства для подсветки на карте */
    highlightedPropertyId?: string | null;
};

/**
 * Формирует URL тайла с фильтрами
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildTileUrl(filters: any): string {
    const queryString = filtersToQueryString(filters as Parameters<typeof filtersToQueryString>[0]);
    return queryString ? `${TILES_URL}?${queryString}` : TILES_URL;
}

/**
 * Компонент карты для страницы поиска недвижимости
 * Управляет отображением режимов фильтра локации и маркерами недвижимости
 * 
 * Логика:
 * - Если активен режим фильтра локации (search/draw/isochrone/radius) - показывает панель управления
 * - Если режим НЕ активен - показывает маркеры недвижимости на карте (MVT тайлы)
 */
export function SearchMap({ initialCenter, initialZoom, onClusterClick, onMarkerClick, onBoundsChange, highlightedPropertyId }: SearchMapProps) {
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const activeLocationMode = useActiveLocationMode();
    const { filters: currentFilters, setFilters } = useFilters();
    const layersInitializedRef = useRef(false);
    const currentFiltersRef = useRef(currentFilters);
    currentFiltersRef.current = currentFilters;

    const [isTilesLoading, setIsTilesLoading] = useState(false);

    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [popupData, setPopupData] = useState<{ id: string, node: HTMLDivElement, onClose?: () => void } | null>(null);

    // ─── Стабильные ссылки на колбэки через refs ───
    // Позволяет НЕ пересоздавать map event listeners при каждом смене пропсов
    const onClusterClickRef = useRef(onClusterClick);
    onClusterClickRef.current = onClusterClick;
    const onMarkerClickRef = useRef(onMarkerClick);
    onMarkerClickRef.current = onMarkerClick;
    const onBoundsChangeRef = useRef(onBoundsChange);
    onBoundsChangeRef.current = onBoundsChange;

    // ─── Мемоизация tileUrl ───
    // Пересчитывается только при реальном изменении фильтров
    const tileUrl = useMemo(() => buildTileUrl(currentFilters), [currentFilters]);

    /**
     * Инициализация MVT source и layers на карте
     */
    const initializePropertyLayers = useCallback((map: mapboxgl.Map) => {
        if (layersInitializedRef.current) return;

        // Определяем текущую тему
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bubbleFill = isDark ? '#ffffff' : '#111827';
        const bubbleTextColor = isDark ? '#000000' : '#ffffff';

        // Создаём кастомную иконку (SMS bubble) — без бордера, адаптивная к теме
        if (!map.hasImage('price-bubble')) {
            const svg = `
<svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M 12 4 L 48 4 A 12 12 0 0 1 60 16 L 60 20 A 12 12 0 0 1 48 32 L 36 32 L 30 38 L 24 32 L 12 32 A 12 12 0 0 1 0 20 L 0 16 A 12 12 0 0 1 12 4 z" fill="${bubbleFill}"/>
</svg>`;
            const img = new Image(60, 40);
            img.onload = () => {
                if (!map.hasImage('price-bubble')) {
                    map.addImage('price-bubble', img, {
                        stretchX: [[16, 24], [36, 44]],
                        stretchY: [[16, 20]],
                        content: [12, 4, 48, 32],
                        pixelRatio: 1
                    });
                }
            };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        }

        // Создаём SVG иконки для кластеров (3 размера, без бордера)
        const clusterConfigs = [
            { name: 'cluster-small', size: 40, color: '#198bff' },
            { name: 'cluster-medium', size: 52, color: '#0d7ae8' },
            { name: 'cluster-large', size: 64, color: '#115293' },
        ];

        for (const { name, size, color } of clusterConfigs) {
            if (!map.hasImage(name)) {
                const r = size / 2;
                const clusterSvg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${r}" cy="${r}" r="${r}" fill="${color}"/>
</svg>`;
                const clusterImg = new Image(size, size);
                clusterImg.onload = () => {
                    if (!map.hasImage(name)) {
                        map.addImage(name, clusterImg, { pixelRatio: 1 });
                    }
                };
                clusterImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(clusterSvg);
            }
        }

        const initialTileUrl = buildTileUrl(currentFiltersRef.current);

        // Добавляем vector tile source
        map.addSource(PROPERTIES_SOURCE, {
            type: 'vector',
            tiles: [initialTileUrl],
            minzoom: 0,
            maxzoom: 22,
        });

        // Слой кластеров (z ≤ 15) — SVG иконки
        map.addLayer({
            id: PROPERTIES_LAYER_CLUSTERS,
            type: 'symbol',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['has', 'point_count'],
            layout: {
                'icon-image': [
                    'step',
                    ['get', 'point_count'],
                    'cluster-small',    // < 10
                    10, 'cluster-medium', // 10-50
                    50, 'cluster-large',  // > 50
                ],
                'icon-allow-overlap': true,
            },
        });

        // Слой чисел на кластерах
        map.addLayer({
            id: PROPERTIES_LAYER_CLUSTER_COUNT,
            type: 'symbol',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': ['get', 'point_count_abbreviated'],
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 14,
            },
            paint: {
                'text-color': '#ffffff',
            }
        });

        // Слой индивидуальных точек — отображаем цену
        map.addLayer({
            id: PROPERTIES_LAYER_POINTS,
            type: 'symbol',
            source: PROPERTIES_SOURCE,
            'source-layer': PROPERTIES_SOURCE,
            filter: ['!', ['has', 'point_count']],
            layout: {
                'text-field': ['concat', ['get', 'price_formatted'], '€'],
                'text-size': 13,
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-anchor': 'bottom', // Центр текста над маркером
                'text-offset': [0, -0.5],
                'icon-image': 'price-bubble',
                'icon-text-fit': 'both',
                'icon-text-fit-padding': [8, 12, 10, 12],
                'text-allow-overlap': false,
                'text-ignore-placement': false,
                'icon-anchor': 'bottom',
            },
            paint: {
                'text-color': bubbleTextColor,
            },
        });

        layersInitializedRef.current = true;
        console.log('[SearchMap] MVT tile layers initialized, theme:', isDark ? 'dark' : 'light');
    }, []);

    // Колбэк при загрузке карты
    const handleMapLoad = useCallback((map: mapboxgl.Map) => {
        setMapInstance(map);
        console.log('[SearchMap] Map instance ready');

        // Сброс флага — для реинициализации при смене темы
        layersInitializedRef.current = false;

        // Инициализируем слои MVT тайлов
        initializePropertyLayers(map);
    }, [initializePropertyLayers]);

    // Скрываем/показываем слои объектов при входе/выходе из режима локации
    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        const visibility = activeLocationMode ? 'none' : 'visible';
        const layers = [PROPERTIES_LAYER_CLUSTERS, PROPERTIES_LAYER_CLUSTER_COUNT, PROPERTIES_LAYER_POINTS];

        layers.forEach((layerId) => {
            if (mapInstance.getLayer(layerId)) {
                mapInstance.setLayoutProperty(layerId, 'visibility', visibility);
            }
        });

        console.log('[SearchMap] Property layers visibility:', visibility);
    }, [mapInstance, activeLocationMode]);

    // Обновляем URL тайлов при изменении фильтров (используем мемоизированный tileUrl)
    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        const source = mapInstance.getSource(PROPERTIES_SOURCE);
        if (source && 'setTiles' in source) {
            setIsTilesLoading(true);
            (source as mapboxgl.VectorTileSource).setTiles([tileUrl]);
            console.log('[SearchMap] Tile source updated with new filters');
        }
    }, [mapInstance, tileUrl]);

    // Отслеживаем загрузку тайлов через события карты
    useEffect(() => {
        if (!mapInstance) return;

        const handleSourceData = (e: mapboxgl.MapSourceDataEvent) => {
            if (e.sourceId === PROPERTIES_SOURCE && e.isSourceLoaded) {
                setIsTilesLoading(false);
            }
        };

        const handleIdle = () => {
            setIsTilesLoading(false);
        };

        mapInstance.on('sourcedata', handleSourceData);
        mapInstance.on('idle', handleIdle);
        return () => {
            mapInstance.off('sourcedata', handleSourceData);
            mapInstance.off('idle', handleIdle);
        };
    }, [mapInstance]);

    // ─── Обработчики кликов по кластерам и маркерам ───
    // Используем refs для колбэков → effect не пересоздаёт listeners при смене пропсов
    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        // Клик по кластеру
        const handleClusterClickEvent = (e: mapboxgl.MapMouseEvent) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: [PROPERTIES_LAYER_CLUSTERS],
            });

            if (features.length === 0) return;

            const feature = features[0];
            const properties = feature.properties;

            if (properties?.property_ids) {
                // Малые кластеры — property_ids в feature properties
                try {
                    const propertyIds = typeof properties.property_ids === 'string'
                        ? JSON.parse(properties.property_ids)
                        : properties.property_ids;
                    if (Array.isArray(propertyIds)) {
                        onClusterClickRef.current?.(propertyIds as string[]);
                    }
                } catch {
                    console.error('[SearchMap] Failed to parse property_ids from cluster feature');
                }
            } else if (properties?.cluster_id) {
                // Большие кластеры — зуммируем к кластеру
                const geometry = feature.geometry;
                if (geometry.type === 'Point') {
                    mapInstance.easeTo({
                        center: geometry.coordinates as [number, number],
                        zoom: (mapInstance.getZoom() || 0) + 2,
                    });
                }
            }
        };

        // Клик по индивидуальному маркеру
        const handlePointClickEvent = (e: mapboxgl.MapMouseEvent) => {
            const features = mapInstance.queryRenderedFeatures(e.point, {
                layers: [PROPERTIES_LAYER_POINTS],
            });

            if (features.length === 0) return;

            const feature = features[0];
            const propertyId = feature.properties?.id;

            if (propertyId) {
                onMarkerClickRef.current?.(String(propertyId));

                // Создаём и показываем popup
                if (popupRef.current) {
                    popupRef.current.remove();
                }

                const popupNode = document.createElement('div');
                popupNode.className = 'custom-property-popup';

                const isDesktop = window.innerWidth >= 768;

                const popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: true,
                    maxWidth: 'none',
                    offset: 15,
                    anchor: 'bottom', // Всегда над маркером — без рывка при навигации
                    className: 'property-grid-popup',
                    autoPan: false
                } as any)
                    .setLngLat(e.lngLat)
                    .setDOMContent(popupNode)
                    .addTo(mapInstance);

                popupRef.current = popup;

                // Ручное центрирование с учетом фиксированных сайдбаров
                mapInstance.easeTo({
                    center: e.lngLat,
                    padding: {
                        top: 250,
                        bottom: isDesktop ? 100 : 350,
                        left: isDesktop ? 150 : 20,
                        right: isDesktop ? 150 : 20
                    },
                    duration: 1000
                });

                const closePopup = () => {
                    if (popupRef.current) {
                        popupRef.current.remove();
                    }
                };

                setPopupData({ id: String(propertyId), node: popupNode, onClose: closePopup });

                popup.on('remove', () => {
                    setPopupData(null);
                });
            }
        };

        // Курсор pointer при наведении
        const handleMouseEnter = () => {
            mapInstance.getCanvas().style.cursor = 'pointer';
        };
        const handleMouseLeave = () => {
            mapInstance.getCanvas().style.cursor = '';
        };

        mapInstance.on('click', PROPERTIES_LAYER_CLUSTERS, handleClusterClickEvent);
        mapInstance.on('click', PROPERTIES_LAYER_POINTS, handlePointClickEvent);
        mapInstance.on('mouseenter', PROPERTIES_LAYER_CLUSTERS, handleMouseEnter);
        mapInstance.on('mouseleave', PROPERTIES_LAYER_CLUSTERS, handleMouseLeave);
        mapInstance.on('mouseenter', PROPERTIES_LAYER_POINTS, handleMouseEnter);
        mapInstance.on('mouseleave', PROPERTIES_LAYER_POINTS, handleMouseLeave);

        return () => {
            mapInstance.off('click', PROPERTIES_LAYER_CLUSTERS, handleClusterClickEvent);
            mapInstance.off('click', PROPERTIES_LAYER_POINTS, handlePointClickEvent);
            mapInstance.off('mouseenter', PROPERTIES_LAYER_CLUSTERS, handleMouseEnter);
            mapInstance.off('mouseleave', PROPERTIES_LAYER_CLUSTERS, handleMouseLeave);
            mapInstance.off('mouseenter', PROPERTIES_LAYER_POINTS, handleMouseEnter);
            mapInstance.off('mouseleave', PROPERTIES_LAYER_POINTS, handleMouseLeave);
        };
    }, [mapInstance]); // ← только mapInstance, больше не зависит от колбэков

    // Обработчик moveend — пишем bbox в URL (debounce 50ms)
    const setFiltersRef = useRef(setFilters);
    setFiltersRef.current = setFilters;
    const activeLocationModeRef = useRef(activeLocationMode);
    activeLocationModeRef.current = activeLocationMode;
    useEffect(() => {
        if (!mapInstance) return;

        let debounceTimer: ReturnType<typeof setTimeout>;

        const handleMoveEnd = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Не обновляем bbox при активном режиме локации
                if (activeLocationModeRef.current) return;

                const bounds = mapInstance.getBounds();
                if (bounds) {
                    const bbox: [number, number, number, number] = [
                        bounds.getWest(),
                        bounds.getSouth(),
                        bounds.getEast(),
                        bounds.getNorth()
                    ];
                    setFiltersRef.current({ bbox });
                    onBoundsChangeRef.current?.(bbox);
                }
            }, 50);
        };

        mapInstance.on('moveend', handleMoveEnd);
        return () => {
            clearTimeout(debounceTimer);
            mapInstance.off('moveend', handleMoveEnd);
        };
    }, [mapInstance]);

    // Подсветка свойства на карте при ховере на карточку в сайдбаре
    // HTML-маркер с иконкой дома + скрытие оригинального price-bubble
    const highlightMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const hoveredProperty = useHoveredPropertyStore((s) => s.hovered);

    useEffect(() => {
        if (!mapInstance || !layersInitializedRef.current) return;

        // Удаляем предыдущий маркер
        if (highlightMarkerRef.current) {
            highlightMarkerRef.current.remove();
            highlightMarkerRef.current = null;
        }

        const hoveredId = hoveredProperty?.id;
        const coords = hoveredProperty?.coordinates;

        // Обновляем фильтр слоя точек: скрываем hovered объект среди price-bubbles
        if (mapInstance.getLayer(PROPERTIES_LAYER_POINTS)) {
            if (hoveredId) {
                mapInstance.setFilter(PROPERTIES_LAYER_POINTS, [
                    'all',
                    ['!', ['has', 'point_count']],
                    ['!=', ['get', 'id'], hoveredId],
                ]);
            } else {
                // Восстанавливаем исходный фильтр
                mapInstance.setFilter(PROPERTIES_LAYER_POINTS, [
                    '!', ['has', 'point_count'],
                ]);
            }
        }

        if (!coords) return;

        // Создаём DOM-элемент маркера — белая подложка + иконка дома
        const el = document.createElement('div');
        el.className = 'property-highlight-marker';
        el.innerHTML = `
            <div style="
                width: 40px; height: 40px;
                background: var(--brand-primary, #198bff);
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 3px 12px rgba(25,139,255,0.5);
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                     fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                     style="transform: rotate(45deg);">
                    <path d="M12 3 2 12h3v8a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-8h3Z"/>
                </svg>
            </div>`;
        el.style.cssText = `
            animation: highlight-marker-in 200ms ease-out;
            pointer-events: none;
        `;

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
            .setLngLat(coords)
            .addTo(mapInstance);

        highlightMarkerRef.current = marker;

        return () => {
            marker.remove();
            highlightMarkerRef.current = null;
        };
    }, [mapInstance, hoveredProperty]);

    return (
        <>
            {/* Мобильный режим локации - заменяет верхний сайдбар */}
            {mapInstance && activeLocationMode && (
                <MobileLocationMode map={mapInstance} />
            )}

            <BaseMap
                initialCenter={initialCenter}
                initialZoom={initialZoom}
                onMapLoad={handleMapLoad}
                styleVariant={activeLocationMode ? 'location' : 'search'}
            >
                {/* Полоска загрузки тайлов при обновлении фильтров */}
                {isTilesLoading && (
                    <div className="absolute top-0 left-0 right-0 z-50 h-1 overflow-hidden">
                        <div className="h-full w-1/3 bg-brand-primary rounded-full animate-[slideRight_1s_ease-in-out_infinite]" />
                    </div>
                )}

                {/* Контроллер режимов фильтра локации (только desktop) */}
                {mapInstance && activeLocationMode && (
                    <div className="hidden md:block">
                        <MapLocationController map={mapInstance} />
                    </div>
                )}
                
                {/* Рендеринг React-попапа через Portal */}
                {popupData && createPortal(<PropertyPopupContent propertyId={popupData.id} onClose={popupData.onClose} />, popupData.node)}
            </BaseMap>
        </>
    );
}
