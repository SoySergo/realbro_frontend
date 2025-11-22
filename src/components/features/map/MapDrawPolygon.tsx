'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DrawPolygon, DrawPoint } from '@/types/draw';
import { MapDrawControls } from './MapDrawControls';
import { PolygonEditor } from './PolygonEditor';
import { PolygonActions } from './PolygonActions';
import ReactDOM from 'react-dom/client';

type MapDrawPolygonProps = {
    map: mapboxgl.Map;
};

/**
 * Компонент для рисования мультиполигонов на карте Mapbox
 * 
 * Функциональность:
 * - Рисование произвольных полигонов кликами по карте
 * - Создание нескольких полигонов
 * - Редактирование и удаление полигонов
 * - Визуализация с использованием GeoJSON
 */
export function MapDrawPolygon({ map }: MapDrawPolygonProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<DrawPoint[]>([]);
    const [polygons, setPolygons] = useState<DrawPolygon[]>([]);
    const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);

    // Refs для хранения popup и root для React компонентов
    const editorPopupRef = useRef<mapboxgl.Popup | null>(null);
    const actionsPopupRef = useRef<mapboxgl.Popup | null>(null);
    const editorRootRef = useRef<ReactDOM.Root | null>(null);
    const actionsRootRef = useRef<ReactDOM.Root | null>(null);

    // Состояние для drag-and-drop точек
    const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
    const isDraggingRef = useRef(false);
    const dragIndexRef = useRef<number | null>(null);

    // Refs для актуальных значений в обработчиках событий
    const isDrawingRef = useRef(isDrawing);
    const selectedPolygonIdRef = useRef(selectedPolygonId);
    const polygonsRef = useRef(polygons);

    // Обновляем refs при изменении состояния
    useEffect(() => {
        isDrawingRef.current = isDrawing;
        selectedPolygonIdRef.current = selectedPolygonId;
        polygonsRef.current = polygons;
    }, [isDrawing, selectedPolygonId, polygons]);

    // Временное хранилище точек во время драга (для производительности)
    const tempPointsRef = useRef<DrawPoint[]>([]);
    const animationFrameRef = useRef<number | null>(null);

    // История действий для undo (стек изменений)
    const historyRef = useRef<DrawPoint[][]>([]);

    // Храним информацию о редактируемом полигоне (для восстановления при отмене)
    const editingPolygonRef = useRef<DrawPolygon | null>(null);

    // Генерация уникального ID для полигона
    const generateId = () => `polygon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Начать рисование нового полигона
    const handleStartDrawing = () => {
        setIsDrawing(true);
        setCurrentPoints([]);
        setSelectedPolygonId(null);
        map.getCanvas().style.cursor = 'crosshair';

        // Очищаем историю и редактируемый полигон
        historyRef.current = [[]]; // Начинаем с пустой истории
        editingPolygonRef.current = null;
        console.log('Started drawing, initial history:', historyRef.current.length);

        // Закрываем popup с действиями если открыт
        if (actionsPopupRef.current) {
            actionsPopupRef.current.remove();
            actionsPopupRef.current = null;
        }
    };

    // Завершить текущий полигон
    const handleCompletePolygon = useCallback(() => {
        if (currentPoints.length < 3) return;

        const newPolygon: DrawPolygon = {
            id: generateId(),
            points: [...currentPoints],
            createdAt: new Date(),
        };

        console.log(`✅ Polygon completed: ${newPolygon.points.length} points, final history had: ${historyRef.current.length} states`);

        setPolygons((prev) => [...prev, newPolygon]);
        setCurrentPoints([]);
        setIsDrawing(false);
        map.getCanvas().style.cursor = '';

        // Очищаем историю и флаг редактирования
        historyRef.current = [];
        editingPolygonRef.current = null;

        // Закрываем popup редактора
        if (editorPopupRef.current) {
            editorPopupRef.current.remove();
            editorPopupRef.current = null;
        }
    }, [currentPoints, map]);

    // Отменить текущее рисование
    const handleCancelDrawing = useCallback(() => {
        // Если редактировали существующий полигон - восстанавливаем его
        if (editingPolygonRef.current !== null) {
            const restoredPolygon = editingPolygonRef.current;
            console.log('Canceling edit, restoring polygon:', restoredPolygon.id);
            setPolygons((prev) => [...prev, restoredPolygon]);
        } else {
            console.log('Canceling new polygon creation');
        }

        // Очищаем refs
        editingPolygonRef.current = null;
        historyRef.current = [];

        setCurrentPoints([]);
        setIsDrawing(false);
        map.getCanvas().style.cursor = '';

        // Закрываем popup редактора
        if (editorPopupRef.current) {
            editorPopupRef.current.remove();
            editorPopupRef.current = null;
        }
    }, [map]);

    // Шаг назад - отменить последнее действие
    const handleUndoLastPoint = useCallback(() => {
        console.log('Undo requested. Current history length:', historyRef.current.length);
        console.log('History states:', historyRef.current.map(h => h.length));

        // Проверяем что есть хотя бы 2 состояния (текущее + предыдущее)
        if (historyRef.current.length < 2) {
            console.log('❌ No history to undo');
            return;
        }

        // Удаляем текущее состояние
        const removed = historyRef.current.pop();
        console.log('Removed state with', removed?.length, 'points');

        // Берём предыдущее состояние (теперь последнее в массиве)
        const previousState = historyRef.current[historyRef.current.length - 1];

        if (!previousState) {
            console.error('❌ Previous state is undefined');
            return;
        }

        console.log('✅ Restoring state with', previousState.length, 'points');
        setCurrentPoints([...previousState]);
        console.log('New history length:', historyRef.current.length);
    }, []);

    // Редактировать полигон
    const handleEditPolygon = useCallback((polygonId: string) => {
        console.log('handleEditPolygon called with ID:', polygonId);

        // Используем функциональное обновление чтобы получить актуальное состояние
        setPolygons((currentPolygons) => {
            console.log('Current polygons in setState:', currentPolygons.map(p => ({ id: p.id, points: p.points.length })));

            const polygon = currentPolygons.find((p) => p.id === polygonId);

            if (!polygon) {
                console.error('Polygon not found! ID:', polygonId);
                return currentPolygons;
            }

            console.log('Found polygon, setting points:', polygon.points.length);

            // Сохраняем редактируемый полигон для возможности отмены
            editingPolygonRef.current = polygon;

            // Инициализируем историю с текущим состоянием
            historyRef.current = [[...polygon.points]];

            // Устанавливаем точки для редактирования
            setCurrentPoints(polygon.points);
            setIsDrawing(true);
            setSelectedPolygonId(null);
            map.getCanvas().style.cursor = 'crosshair';

            // Закрываем popup с действиями
            if (actionsPopupRef.current) {
                console.log('Closing actions popup');
                actionsPopupRef.current.remove();
                actionsPopupRef.current = null;
                actionsRootRef.current = null;
            }

            console.log('Editing polygon started successfully');

            // Возвращаем массив без редактируемого полигона
            return currentPolygons.filter((p) => p.id !== polygonId);
        });
    }, [map]);

    // Удалить полигон
    const handleDeletePolygon = (polygonId: string) => {
        setPolygons((prev) => prev.filter((p) => p.id !== polygonId));
        setSelectedPolygonId(null);

        // Закрываем popup с действиями
        if (actionsPopupRef.current) {
            actionsPopupRef.current.remove();
            actionsPopupRef.current = null;
        }

        console.log('Deleted polygon:', polygonId);
    };

    // Очистить все полигоны
    const handleClearAll = () => {
        setPolygons([]);
        setCurrentPoints([]);
        setIsDrawing(false);
        setSelectedPolygonId(null);
        map.getCanvas().style.cursor = '';

        if (editorPopupRef.current) {
            editorPopupRef.current.remove();
            editorPopupRef.current = null;
        }

        if (actionsPopupRef.current) {
            actionsPopupRef.current.remove();
            actionsPopupRef.current = null;
        }

        console.log('All polygons cleared');
    };

    // Обработка кликов по карте для добавления точек
    useEffect(() => {
        if (!isDrawing) return;

        const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
            // Проверяем, что клик не был на точке (для drag-and-drop)
            if (draggedPointIndex !== null) return;

            // Разрешаем ставить точки даже на завершенных полигонах
            // (они не будут открывать popup благодаря блокировке в handlePolygonClick)

            const point: DrawPoint = { lng: e.lngLat.lng, lat: e.lngLat.lat };

            // Добавляем точку и сразу сохраняем в историю
            setCurrentPoints((prev) => {
                const newPoints = [...prev, point];

                // Проверяем, не дублируется ли последняя запись в истории
                const lastHistory = historyRef.current[historyRef.current.length - 1];
                const isDuplicate = lastHistory && JSON.stringify(lastHistory) === JSON.stringify(newPoints);

                if (!isDuplicate) {
                    historyRef.current.push([...newPoints]);
                    console.log(`✅ Point added: ${prev.length} -> ${newPoints.length}, history: ${historyRef.current.length}`);
                } else {
                    console.log(`⚠️ Skipped duplicate: points=${newPoints.length}, history=${historyRef.current.length}`);
                }

                return newPoints;
            });
        };

        map.on('click', handleMapClick);

        return () => {
            map.off('click', handleMapClick);
        };
    }, [isDrawing, map, draggedPointIndex]);

    // Функция для прямого обновления GeoJSON без React ре-рендера
    const updateMapGeometry = useCallback((points: DrawPoint[]) => {
        const polygonSource = map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource;
        const pointsSource = map.getSource('drawing-polygon-points') as mapboxgl.GeoJSONSource;

        if (!polygonSource || !pointsSource) return;

        // GeoJSON для полигона
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: points.map((p) => [p.lng, p.lat]),
                    },
                },
                ...(points.length >= 3
                    ? [
                        {
                            type: 'Feature' as const,
                            properties: {},
                            geometry: {
                                type: 'Polygon' as const,
                                coordinates: [[...points.map((p) => [p.lng, p.lat]), [points[0].lng, points[0].lat]]],
                            },
                        },
                    ]
                    : []),
            ],
        };

        // GeoJSON для точек
        const pointsGeojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: points.map((point, index) => ({
                type: 'Feature',
                properties: { index, isFirst: index === 0 },
                geometry: {
                    type: 'Point',
                    coordinates: [point.lng, point.lat],
                },
            })),
        };

        // Напрямую обновляем источники Mapbox
        polygonSource.setData(geojson);
        pointsSource.setData(pointsGeojson);
    }, [map]);



    // Drag-and-drop для перемещения точек (оптимизированная версия)
    useEffect(() => {
        if (!isDrawing || currentPoints.length === 0) return;

        // Инициализируем временное хранилище
        tempPointsRef.current = [...currentPoints];

        const handleMouseDown = (e: mapboxgl.MapMouseEvent) => {
            // Проверяем, кликнули ли на точку
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['drawing-polygon-points'],
            });

            if (features.length > 0) {
                const feature = features[0];
                const index = feature.properties?.index;

                if (typeof index === 'number') {
                    isDraggingRef.current = true;
                    dragIndexRef.current = index;
                    setDraggedPointIndex(index);

                    // Копируем текущие точки во временное хранилище
                    tempPointsRef.current = [...currentPoints];

                    // Отключаем обработку кликов и drag карты
                    map.dragPan.disable();
                    map.getCanvas().style.cursor = 'grabbing';
                    e.preventDefault();

                    console.log('Started dragging point:', index);
                }
            }
        };

        const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
            if (!isDraggingRef.current || dragIndexRef.current === null) {
                // Меняем курсор при наведении на точку
                const features = map.queryRenderedFeatures(e.point, {
                    layers: ['drawing-polygon-points'],
                });

                if (features.length > 0) {
                    map.getCanvas().style.cursor = 'move';
                } else if (isDrawing && !isDraggingRef.current) {
                    map.getCanvas().style.cursor = 'crosshair';
                }
                return;
            }

            // Отменяем предыдущий кадр анимации если есть
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Обновляем позицию в временном хранилище
            const dragIndex = dragIndexRef.current;
            tempPointsRef.current[dragIndex] = { lng: e.lngLat.lng, lat: e.lngLat.lat };

            // Используем requestAnimationFrame для плавного обновления (60 FPS)
            animationFrameRef.current = requestAnimationFrame(() => {
                // Напрямую обновляем Mapbox без изменения React state
                updateMapGeometry(tempPointsRef.current);
            });
        };

        const handleMouseUp = () => {
            if (isDraggingRef.current && dragIndexRef.current !== null) {
                console.log('Finished dragging point:', dragIndexRef.current);

                // Отменяем незавершённый кадр
                if (animationFrameRef.current !== null) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }

                // Теперь обновляем React state один раз с финальной позицией
                const finalPoints = [...tempPointsRef.current];

                // Проверяем, не дублируется ли последняя запись в истории
                const lastHistory = historyRef.current[historyRef.current.length - 1];
                const isDuplicate = lastHistory && JSON.stringify(lastHistory) === JSON.stringify(finalPoints);

                if (!isDuplicate) {
                    historyRef.current.push([...finalPoints]);
                    console.log('Saved to history after drag, total states:', historyRef.current.length);
                } else {
                    console.log('Skipped duplicate history entry after drag');
                }

                setCurrentPoints(finalPoints);
            }

            isDraggingRef.current = false;
            dragIndexRef.current = null;
            setDraggedPointIndex(null);
            map.dragPan.enable();
            map.getCanvas().style.cursor = isDrawing ? 'crosshair' : '';
        };

        // Добавляем обработчики
        map.on('mousedown', handleMouseDown);
        map.on('mousemove', handleMouseMove);
        map.on('mouseup', handleMouseUp);

        return () => {
            map.off('mousedown', handleMouseDown);
            map.off('mousemove', handleMouseMove);
            map.off('mouseup', handleMouseUp);

            // Очищаем анимацию при размонтировании
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            map.dragPan.enable();
        };
    }, [isDrawing, currentPoints, map, updateMapGeometry]);

    // Отрисовка текущего полигона (в процессе рисования)
    useEffect(() => {
        if (currentPoints.length === 0) {
            // Удаляем источник и слои если нет точек
            if (map.getSource('drawing-polygon')) {
                if (map.getLayer('drawing-polygon-fill')) map.removeLayer('drawing-polygon-fill');
                if (map.getLayer('drawing-polygon-line')) map.removeLayer('drawing-polygon-line');
                if (map.getLayer('drawing-polygon-points')) map.removeLayer('drawing-polygon-points');
                map.removeSource('drawing-polygon');
            }
            return;
        }

        // GeoJSON для текущих точек и линий
        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                // Линии между точками
                {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: currentPoints.map((p) => [p.lng, p.lat]),
                    },
                },
                // Полигон (если >= 3 точек)
                ...(currentPoints.length >= 3
                    ? [
                        {
                            type: 'Feature' as const,
                            properties: {},
                            geometry: {
                                type: 'Polygon' as const,
                                coordinates: [[...currentPoints.map((p) => [p.lng, p.lat]), [currentPoints[0].lng, currentPoints[0].lat]]],
                            },
                        },
                    ]
                    : []),
            ],
        };

        const pointsGeojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: currentPoints.map((point, index) => ({
                type: 'Feature',
                properties: { index, isFirst: index === 0 },
                geometry: {
                    type: 'Point',
                    coordinates: [point.lng, point.lat],
                },
            })),
        };

        // Добавляем источник для полигона если его нет
        if (!map.getSource('drawing-polygon')) {
            map.addSource('drawing-polygon', { type: 'geojson', data: geojson });
        } else {
            (map.getSource('drawing-polygon') as mapboxgl.GeoJSONSource).setData(geojson);
        }

        // Добавляем источник для точек если его нет
        if (!map.getSource('drawing-polygon-points')) {
            map.addSource('drawing-polygon-points', { type: 'geojson', data: pointsGeojson });
        } else {
            (map.getSource('drawing-polygon-points') as mapboxgl.GeoJSONSource).setData(pointsGeojson);
        }

        // Добавляем слои только если их ещё нет
        if (!map.getLayer('drawing-polygon-fill')) {
            // Заливка полигона (полупрозрачная)
            map.addLayer({
                id: 'drawing-polygon-fill',
                type: 'fill',
                source: 'drawing-polygon',
                paint: {
                    'fill-color': '#3b82f6', // Синий цвет как в light mode BoundariesLayer
                    'fill-opacity': 0.4,
                },
                filter: ['==', ['geometry-type'], 'Polygon'],
            });
        }

        if (!map.getLayer('drawing-polygon-line')) {
            // Линии полигона
            map.addLayer({
                id: 'drawing-polygon-line',
                type: 'line',
                source: 'drawing-polygon',
                paint: {
                    'line-color': '#3b82f6',
                    'line-width': 2,
                    'line-opacity': 1,
                },
            });
        }

        if (!map.getLayer('drawing-polygon-points')) {
            // Точки (вершины)
            map.addLayer({
                id: 'drawing-polygon-points',
                type: 'circle',
                source: 'drawing-polygon-points',
                paint: {
                    'circle-radius': 6,
                    'circle-color': ['case', ['get', 'isFirst'], '#28A745', '#198BFF'],
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff',
                },
            });
        }
    }, [currentPoints, map]);

    // Показываем popup с кнопками редактора рядом с первой точкой
    useEffect(() => {
        if (!isDrawing || currentPoints.length === 0) {
            if (editorPopupRef.current) {
                editorPopupRef.current.remove();
                editorPopupRef.current = null;
                editorRootRef.current = null;
            }
            return;
        }

        const firstPoint = currentPoints[0];

        // Создаём контейнер для React компонента
        const container = document.createElement('div');

        // Создаём popup
        if (!editorPopupRef.current) {
            editorPopupRef.current = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                anchor: 'bottom',
                offset: 15,
            })
                .setLngLat([firstPoint.lng, firstPoint.lat])
                .setDOMContent(container)
                .addTo(map);

            // Рендерим React компонент в popup
            editorRootRef.current = ReactDOM.createRoot(container);
        }

        if (editorRootRef.current) {
            editorRootRef.current.render(
                <PolygonEditor
                    pointsCount={currentPoints.length}
                    onComplete={handleCompletePolygon}
                    onCancel={handleCancelDrawing}
                    onUndoLastPoint={handleUndoLastPoint}
                />
            );
        }

        return () => {
            if (editorPopupRef.current && !isDrawing) {
                editorPopupRef.current.remove();
                editorPopupRef.current = null;
                editorRootRef.current = null;
            }
        };
    }, [isDrawing, currentPoints, map, handleCompletePolygon, handleCancelDrawing, handleUndoLastPoint]);

    // Отрисовка завершённых полигонов
    useEffect(() => {
        const sourceId = 'completed-polygons';

        if (polygons.length === 0) {
            if (map.getSource(sourceId)) {
                if (map.getLayer('completed-polygons-fill')) map.removeLayer('completed-polygons-fill');
                if (map.getLayer('completed-polygons-line')) map.removeLayer('completed-polygons-line');
                map.removeSource(sourceId);
            }
            return;
        }

        const geojson: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: polygons.map((polygon) => ({
                type: 'Feature',
                properties: { id: polygon.id },
                geometry: {
                    type: 'Polygon',
                    coordinates: [[...polygon.points.map((p) => [p.lng, p.lat]), [polygon.points[0].lng, polygon.points[0].lat]]],
                },
            })),
        };

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'geojson', data: geojson, promoteId: 'id' });

            // Заливка - с едва заметным фоном для неактивных, ярким для активных
            map.addLayer({
                id: 'completed-polygons-fill',
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#3b82f6', // Синий для выбранного
                        ['boolean', ['feature-state', 'hover'], false],
                        '#60a5fa', // Светло-синий для hover
                        '#9ca3af', // Едва заметный серый для остальных (как в BoundariesLayer)
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        0.4, // Более заметный для выбранного
                        ['boolean', ['feature-state', 'hover'], false],
                        0.9, // Заметный для hover
                        0.2, // Едва заметный для неактивных (как в BoundariesLayer)
                    ],
                },
            });

            // Границы
            map.addLayer({
                id: 'completed-polygons-line',
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        '#3b82f6', // Синий для выбранного
                        ['boolean', ['feature-state', 'hover'], false],
                        '#3b82f6', // Синий для hover
                        '#60a5fa', // Светло-синий бордер для остальных
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        2,
                        ['boolean', ['feature-state', 'hover'], false],
                        1,
                        2,
                    ],
                    'line-opacity': 1,
                },
            });

            // Обработка кликов по полигонам
            const handlePolygonClick = (e: mapboxgl.MapMouseEvent) => {
                // Блокируем клики на завершённые полигоны во время рисования
                if (isDrawingRef.current) {
                    console.log('Click on completed polygon ignored - drawing mode is active');
                    e.preventDefault();
                    return;
                }

                console.log('Clicked on polygon layer, features:', e.features?.length);

                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    const polygonId = feature.properties?.id;

                    console.log('Selected polygon ID:', polygonId);
                    console.log('Current polygons:', polygonsRef.current.map(p => p.id));

                    if (polygonId) {
                        // Убираем selected с предыдущего полигона
                        const currentSelectedId = selectedPolygonIdRef.current;
                        if (currentSelectedId && currentSelectedId !== polygonId) {
                            try {
                                map.setFeatureState(
                                    { source: sourceId, id: currentSelectedId },
                                    { selected: false }
                                );
                            } catch (error) {
                                console.warn('Error removing selected state:', error);
                            }
                        }

                        setSelectedPolygonId(polygonId);
                        selectedPolygonIdRef.current = polygonId;

                        // Устанавливаем selected для нового полигона
                        try {
                            map.setFeatureState(
                                { source: sourceId, id: polygonId },
                                { selected: true }
                            );
                        } catch (error) {
                            console.warn('Error setting selected state:', error);
                        }

                        // Создаём контейнер для popup с действиями
                        const container = document.createElement('div');

                        // Удаляем старый popup если есть
                        if (actionsPopupRef.current) {
                            console.log('Removing old popup');
                            actionsPopupRef.current.remove();
                        }

                        // Создаём новый popup
                        console.log('Creating new popup at:', e.lngLat);
                        actionsPopupRef.current = new mapboxgl.Popup({
                            closeButton: true,
                            closeOnClick: false,
                            maxWidth: '300px',
                        })
                            .setLngLat(e.lngLat)
                            .setDOMContent(container)
                            .addTo(map);

                        // Рендерим React компонент
                        actionsRootRef.current = ReactDOM.createRoot(container);
                        actionsRootRef.current.render(
                            <PolygonActions
                                onEdit={() => {
                                    console.log('Edit button clicked for polygon:', polygonId);
                                    handleEditPolygon(polygonId);
                                }}
                                onDelete={() => {
                                    console.log('Delete button clicked for polygon:', polygonId);
                                    handleDeletePolygon(polygonId);
                                }}
                            />
                        );

                        // При закрытии popup сбрасываем выделение
                        actionsPopupRef.current.on('close', () => {
                            const closingPolygonId = selectedPolygonIdRef.current;
                            if (closingPolygonId) {
                                try {
                                    map.setFeatureState(
                                        { source: sourceId, id: closingPolygonId },
                                        { selected: false }
                                    );
                                } catch (error) {
                                    console.warn('Error removing selected state on popup close:', error);
                                }
                            }
                            setSelectedPolygonId(null);
                            selectedPolygonIdRef.current = null;
                            actionsRootRef.current = null;
                        });
                    }
                }
            };

            map.on('click', 'completed-polygons-fill', handlePolygonClick);

            // Обработка hover
            let hoveredPolygonId: string | null = null;

            const handlePolygonMouseMove = (e: mapboxgl.MapMouseEvent) => {
                // Блокируем hover во время рисования
                if (isDrawingRef.current) {
                    return;
                }

                if (e.features && e.features.length > 0) {
                    const feature = e.features[0];
                    const polygonId = feature.properties?.id;

                    if (polygonId && hoveredPolygonId !== polygonId) {
                        // Убираем hover с предыдущего
                        if (hoveredPolygonId) {
                            try {
                                map.setFeatureState(
                                    { source: sourceId, id: hoveredPolygonId },
                                    { hover: false }
                                );
                            } catch (error) {
                                console.warn('Error removing hover state:', error);
                            }
                        }

                        // Устанавливаем hover на новый (если он не выбран)
                        const currentSelectedId = selectedPolygonIdRef.current;
                        if (polygonId !== currentSelectedId) {
                            try {
                                map.setFeatureState(
                                    { source: sourceId, id: polygonId },
                                    { hover: true }
                                );
                            } catch (error) {
                                console.warn('Error setting hover state:', error);
                            }
                        }

                        hoveredPolygonId = polygonId;
                    }
                }
                map.getCanvas().style.cursor = 'pointer';
            };

            const handlePolygonMouseLeave = () => {
                // Убираем hover при уходе курсора
                if (hoveredPolygonId) {
                    try {
                        map.setFeatureState(
                            { source: sourceId, id: hoveredPolygonId },
                            { hover: false }
                        );
                    } catch (error) {
                        console.warn('Error clearing hover state:', error);
                    }
                    hoveredPolygonId = null;
                }
                if (!isDrawingRef.current) {
                    map.getCanvas().style.cursor = '';
                }
            };

            map.on('mousemove', 'completed-polygons-fill', handlePolygonMouseMove);
            map.on('mouseleave', 'completed-polygons-fill', handlePolygonMouseLeave);
        } else {
            (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
        }
    }, [polygons, selectedPolygonId, isDrawing, map, handleEditPolygon]);

    return (
        <MapDrawControls
            hasPolygons={polygons.length > 0}
            isDrawing={isDrawing}
            onStartDrawing={handleStartDrawing}
            onClearAll={handleClearAll}
        />
    );
}
