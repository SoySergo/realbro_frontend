'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useFilterStore } from '@/store/filterStore';
import type { DrawPolygon } from '@/types/filter';

interface DrawLayerProps {
    map: mapboxgl.Map | null;
    onPolygonDrawn: (polygon: DrawPolygon) => void;
    isDrawing: boolean;
}

/**
 * DrawLayer - компонент для рисования полигонов на карте
 * 
 * Особенности:
 * - Использует @mapbox/mapbox-gl-draw для интерактивного рисования
 * - Синхронизируется с filterStore для отображения сохраненных полигонов
 * - Поддерживает создание, удаление и обновление полигонов
 * - Обрабатывает все события жизненного цикла рисования
 * 
 * @param map - инстанс Mapbox GL карты
 * @param onPolygonDrawn - колбэк при завершении рисования полигона
 * @param isDrawing - флаг активного режима рисования
 */
export function DrawLayer({ map, onPolygonDrawn, isDrawing }: DrawLayerProps) {
    const drawRef = useRef<MapboxDraw | null>(null);
    const isInitializedRef = useRef(false);
    const currentPolygonIdRef = useRef<string | null>(null);

    // State для отслеживания готовности Draw (триггер для режима рисования)
    const [isDrawReady, setIsDrawReady] = useState(false);

    // Храним колбэк в ref для избежания переинициализации
    const onPolygonDrawnRef = useRef(onPolygonDrawn);
    const { locationFilter } = useFilterStore();

    console.log('[DRAW] Component render:', {
        hasMap: !!map,
        isDrawing,
        isDrawReady,
        isInitialized: isInitializedRef.current,
        hasDrawRef: !!drawRef.current
    });

    // Обновляем ref при изменении колбэка
    useEffect(() => {
        onPolygonDrawnRef.current = onPolygonDrawn;
    }, [onPolygonDrawn]);

    // Сброс состояния при размонтировании компонента
    useEffect(() => {
        return () => {
            console.log('[DRAW] Component unmounting, resetting state');
        };
    }, []);

    /**
     * Обработчик создания полигона
     * Вызывается после завершения рисования полигона
     */
    const handleCreate = useCallback((e: { features: GeoJSON.Feature[] }) => {
        if (!e.features || e.features.length === 0) {
            console.warn('[DRAW] No features in create event');
            return;
        }

        const feature = e.features[0];

        // Валидация типа геометрии
        if (feature.geometry.type !== 'Polygon') {
            console.warn('[DRAW] Invalid geometry type:', feature.geometry.type);
            return;
        }

        // Валидация координат
        const coordinates = feature.geometry.coordinates as [number, number][][];
        if (!coordinates || coordinates.length === 0 || coordinates[0].length < 4) {
            console.warn('[DRAW] Invalid polygon coordinates');
            return;
        }

        const polygon: DrawPolygon = {
            id: feature.id as string,
            coordinates,
            color: '#198BFF',
            name: '',
            createdAt: new Date(),
        };

        currentPolygonIdRef.current = polygon.id;

        // Используем актуальный колбэк из ref
        onPolygonDrawnRef.current(polygon);
        console.log('[DRAW] Polygon created successfully:', polygon.id);
    }, []);

    /**
     * Обработчик обновления полигона
     * Вызывается при изменении вершин существующего полигона
     */
    const handleUpdate = useCallback((e: { features: GeoJSON.Feature[] }) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        console.log('[DRAW] Polygon updated:', feature.id);

        // Здесь можно добавить логику сохранения обновлений
        // Например, отправить обновленные координаты в store
    }, []);

    /**
     * Обработчик удаления полигона
     * Вызывается при удалении полигона через кнопку trash
     */
    const handleDelete = useCallback((e: { features: GeoJSON.Feature[] }) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        console.log('[DRAW] Polygon deleted:', feature.id);
        currentPolygonIdRef.current = null;

        // Опционально: можно добавить колбэк onPolygonDeleted
    }, []);

    /**
     * Инициализация Mapbox Draw
     * Создает экземпляр Draw и добавляет его на карту
     */
    useEffect(() => {
        if (!map) {
            console.log('[DRAW] Map not available');
            return;
        }

        // Если уже инициализирован, просто обновляем state и выходим
        if (isInitializedRef.current && drawRef.current) {
            console.log('[DRAW] Already initialized, ensuring state is correct');
            if (!isDrawReady) {
                console.log('[DRAW] Restoring isDrawReady to true');
                setIsDrawReady(true);
            }
            return;
        }

        const initializeDraw = () => {
            if (isInitializedRef.current) {
                console.log('[DRAW] Protection: already initialized');
                return; // Защита от повторной инициализации
            }

            console.log('[DRAW] Initializing MapboxDraw...');

            // Создаём экземпляр Draw с кастомными стилями
            const draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true,
                },
                // Кастомные стили для лучшей видимости
                styles: [
                    // Заливка полигона (inactive)
                    {
                        id: 'gl-draw-polygon-fill-inactive',
                        type: 'fill',
                        filter: [
                            'all',
                            ['==', 'active', 'false'],
                            ['==', '$type', 'Polygon'],
                            ['!=', 'mode', 'static'],
                        ],
                        paint: {
                            'fill-color': '#198BFF',
                            'fill-opacity': 0.15,
                        },
                    },
                    // Заливка полигона (active)
                    {
                        id: 'gl-draw-polygon-fill-active',
                        type: 'fill',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        paint: {
                            'fill-color': '#198BFF',
                            'fill-opacity': 0.25,
                        },
                    },
                    // Обводка полигона (inactive)
                    {
                        id: 'gl-draw-polygon-stroke-inactive',
                        type: 'line',
                        filter: [
                            'all',
                            ['==', 'active', 'false'],
                            ['==', '$type', 'Polygon'],
                            ['!=', 'mode', 'static'],
                        ],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round',
                        },
                        paint: {
                            'line-color': '#198BFF',
                            'line-width': 2,
                        },
                    },
                    // Обводка полигона (active)
                    {
                        id: 'gl-draw-polygon-stroke-active',
                        type: 'line',
                        filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
                        layout: {
                            'line-cap': 'round',
                            'line-join': 'round',
                        },
                        paint: {
                            'line-color': '#198BFF',
                            'line-width': 3,
                        },
                    },
                    // Вершины полигона (active)
                    {
                        id: 'gl-draw-polygon-and-line-vertex-active',
                        type: 'circle',
                        filter: [
                            'all',
                            ['==', 'meta', 'vertex'],
                            ['==', '$type', 'Point'],
                            ['!=', 'mode', 'static'],
                        ],
                        paint: {
                            'circle-radius': 6,
                            'circle-color': '#FFFFFF',
                            'circle-stroke-color': '#198BFF',
                            'circle-stroke-width': 2,
                        },
                    },
                    // Средние точки между вершинами (для добавления новых вершин)
                    {
                        id: 'gl-draw-polygon-midpoint',
                        type: 'circle',
                        filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
                        paint: {
                            'circle-radius': 4,
                            'circle-color': '#FFFFFF',
                            'circle-stroke-color': '#198BFF',
                            'circle-stroke-width': 1.5,
                            'circle-opacity': 0.8,
                        },
                    },
                ],
            });

            // Добавляем контрол на карту
            map.addControl(draw, 'top-left');
            drawRef.current = draw;
            isInitializedRef.current = true;

            // Подписываемся на события
            map.on('draw.create', handleCreate);
            map.on('draw.update', handleUpdate);
            map.on('draw.delete', handleDelete);

            console.log('[DRAW] MapboxDraw initialized successfully');

            // Устанавливаем флаг готовности для триггера режима рисования
            console.log('[DRAW] Setting isDrawReady to true');
            setIsDrawReady(true);
        };

        // Проверяем, загружена ли карта
        if (!map.loaded()) {
            console.log('[DRAW] Waiting for map to load...');
            map.once('load', initializeDraw);
            return () => {
                map.off('load', initializeDraw);
            };
        }

        // Если карта уже загружена, инициализируем сразу
        try {
            initializeDraw();
        } catch (error) {
            console.error('[DRAW] Failed to initialize MapboxDraw:', error);
            isInitializedRef.current = false;
        }

        // Cleanup функция - только при размонтировании или изменении карты
        return () => {
            console.log('[DRAW] Cleanup called', {
                hasMap: !!map,
                hasDrawRef: !!drawRef.current,
                isInitialized: isInitializedRef.current
            });

            if (!map || !drawRef.current) {
                console.log('[DRAW] Cleanup skipped - no map or drawRef');
                return;
            }

            try {
                // Отписываемся от событий
                map.off('draw.create', handleCreate);
                map.off('draw.update', handleUpdate);
                map.off('draw.delete', handleDelete);

                // Удаляем контрол с карты
                map.removeControl(drawRef.current);
                drawRef.current = null;
                isInitializedRef.current = false;
                currentPolygonIdRef.current = null;

                // НЕ сбрасываем isDrawReady здесь - это вызовет проблемы со strict mode
                // isDrawReady будет обновлен при следующей инициализации если нужно
                console.log('[DRAW] Cleanup completed, NOT resetting isDrawReady');

                console.log('[DRAW] MapboxDraw cleaned up');
            } catch (error) {
                console.error('[DRAW] Error during cleanup:', error);
            }
        };
        // Зависимости: только map и стабильные колбэки (не меняются)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]);

    /**
     * Управление режимом рисования
     * Переключает между режимами draw_polygon и simple_select
     */
    useEffect(() => {
        // Ждем полной инициализации Draw
        if (!isDrawReady || !drawRef.current) {
            console.log('[DRAW] Waiting for Draw initialization, isDrawReady:', isDrawReady, 'isDrawing:', isDrawing);
            return;
        }

        try {
            if (isDrawing) {
                // Активируем режим рисования полигона
                drawRef.current.changeMode('draw_polygon');
                console.log('[DRAW] Drawing mode activated');
            } else {
                // Возвращаемся в режим выбора
                drawRef.current.changeMode('simple_select');
                console.log('[DRAW] Simple select mode activated');
            }
        } catch (error) {
            console.error('[DRAW] Error changing mode:', error);
        }
    }, [isDrawing, isDrawReady]);

    /**
     * Синхронизация с locationFilter
     * Отображает сохраненный полигон из filterStore
     */
    useEffect(() => {
        if (!drawRef.current || !map || !isInitializedRef.current) return;

        try {
            // Получаем все текущие полигоны в Draw
            const allFeatures = drawRef.current.getAll();

            // Если в фильтре есть полигон в режиме draw
            if (locationFilter?.mode === 'draw' && locationFilter.polygon) {
                const polygonId = locationFilter.polygon.id;

                // Проверяем, есть ли уже такой полигон
                const existingFeature = allFeatures.features.find(
                    (f) => f.id === polygonId
                );

                if (!existingFeature) {
                    // Создаем GeoJSON Feature для добавления в Draw
                    const feature: GeoJSON.Feature = {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'Polygon',
                            coordinates: locationFilter.polygon.coordinates,
                        },
                        id: polygonId,
                    };

                    // Добавляем полигон в Draw
                    drawRef.current.add(feature);
                    currentPolygonIdRef.current = polygonId;
                    console.log('[DRAW] Loaded polygon from filter:', polygonId);
                }
            } else if (
                locationFilter?.mode !== 'draw' &&
                currentPolygonIdRef.current
            ) {
                // Если режим изменился на другой, удаляем полигон
                drawRef.current.deleteAll();
                currentPolygonIdRef.current = null;
                console.log('[DRAW] Cleared polygons (mode changed)');
            }
        } catch (error) {
            console.error('[DRAW] Error syncing with locationFilter:', error);
        }
    }, [locationFilter, map]);

    // Компонент не рендерит DOM элементы
    return null;
}
