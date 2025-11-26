import { useState, useRef, useCallback, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import type { DrawPolygon, DrawPoint } from '@/entities/map-draw/model/types';
import { generatePolygonId } from '../../lib/polygon-helpers';

type UseDrawingStateReturn = {
    // Состояние UI
    isDrawing: boolean;
    selectedPolygonId: string | null;
    setSelectedPolygonId: (id: string | null) => void;

    // Состояние данных
    currentPoints: DrawPoint[];
    setCurrentPoints: (points: DrawPoint[] | ((prev: DrawPoint[]) => DrawPoint[])) => void;
    polygons: DrawPolygon[];
    setPolygons: (polygons: DrawPolygon[] | ((prev: DrawPolygon[]) => DrawPolygon[])) => void;

    // Refs
    editorPopupRef: React.RefObject<mapboxgl.Popup | null>;
    actionsPopupRef: React.RefObject<mapboxgl.Popup | null>;
    historyRef: React.RefObject<DrawPoint[][]>;
    editingPolygonRef: React.RefObject<DrawPolygon | null>;
    isDrawingRef: React.RefObject<boolean>;
    selectedPolygonIdRef: React.RefObject<string | null>;
    polygonsRef: React.RefObject<DrawPolygon[]>;

    // Обработчики
    handleStartDrawing: () => void;
    handleCompletePolygon: () => void;
    handleCancelDrawing: () => void;
    handleUndoLastPoint: () => void;
    handleEditPolygon: (polygonId: string) => void;
    handleDeletePolygon: (polygonId: string) => void;
    handleClear: () => void;
};

/**
 * Хук для управления состоянием рисования полигонов
 * 
 * Содержит:
 * - Состояние UI и данных
 * - Refs для popup-ов и истории
 * - Все обработчики действий с полигонами
 */
export function useDrawingState(map: mapboxgl.Map): UseDrawingStateReturn {
    // Состояние UI
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedPolygonId, setSelectedPolygonId] = useState<string | null>(null);

    // Состояние данных
    const [currentPoints, setCurrentPoints] = useState<DrawPoint[]>([]);
    const [polygons, setPolygons] = useState<DrawPolygon[]>([]);

    // Refs для popup-ов
    const editorPopupRef = useRef<mapboxgl.Popup | null>(null);
    const actionsPopupRef = useRef<mapboxgl.Popup | null>(null);

    // История действий для undo (стек изменений)
    const historyRef = useRef<DrawPoint[][]>([]);

    // Храним информацию о редактируемом полигоне (для восстановления при отмене)
    const editingPolygonRef = useRef<DrawPolygon | null>(null);

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

    // Начать рисование нового полигона
    const handleStartDrawing = useCallback(() => {
        // Проверка лимита (максимум 4 полигона)
        const MAX_POLYGONS = 4;
        if (polygons.length >= MAX_POLYGONS) {
            console.warn(`Maximum polygon limit reached: ${MAX_POLYGONS}`);
            return;
        }

        setIsDrawing(true);
        setCurrentPoints([]);
        setSelectedPolygonId(null);
        map.getCanvas().style.cursor = 'crosshair';

        // Очищаем историю и редактируемый полигон
        historyRef.current = [[]]; // Начинаем с пустой истории
        editingPolygonRef.current = null;
        console.log('Started drawing new polygon');

        // Закрываем popup с действиями если открыт
        if (actionsPopupRef.current) {
            actionsPopupRef.current.remove();
            actionsPopupRef.current = null;
        }
    }, [map, polygons.length]);

    // Завершить текущий полигон
    const handleCompletePolygon = useCallback(() => {
        if (currentPoints.length < 3) return;

        const newPolygon: DrawPolygon = {
            id: generatePolygonId(),
            points: [...currentPoints],
            createdAt: new Date(),
        };

        console.log(`Polygon completed: ${newPolygon.points.length} points`);

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

        // Проверяем что есть хотя бы 2 состояния (текущее + предыдущее)
        if (historyRef.current.length < 2) {
            console.log('No history to undo');
            return;
        }

        // Удаляем текущее состояние
        historyRef.current.pop();

        // Берём предыдущее состояние (теперь последнее в массиве)
        const previousState = historyRef.current[historyRef.current.length - 1];

        if (!previousState) {
            console.error('Previous state is undefined');
            return;
        }

        console.log('Restoring state with', previousState.length, 'points');
        setCurrentPoints([...previousState]);
    }, []);

    // Редактировать полигон
    const handleEditPolygon = useCallback(
        (polygonId: string) => {
            console.log('Edit polygon:', polygonId);

            setPolygons((currentPolygons) => {
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
                    actionsPopupRef.current.remove();
                    actionsPopupRef.current = null;
                }

                console.log('Editing polygon started');

                // Возвращаем массив без редактируемого полигона
                return currentPolygons.filter((p) => p.id !== polygonId);
            });
        },
        [map]
    );

    // Удалить полигон
    const handleDeletePolygon = useCallback((polygonId: string) => {
        setPolygons((prev) => prev.filter((p) => p.id !== polygonId));
        setSelectedPolygonId(null);

        // Закрываем popup с действиями
        if (actionsPopupRef.current) {
            actionsPopupRef.current.remove();
            actionsPopupRef.current = null;
        }

        console.log('Deleted polygon:', polygonId);
    }, []);

    // Очистить все полигоны
    const handleClear = useCallback(() => {
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
    }, [map]);

    return {
        // Состояние UI
        isDrawing,
        selectedPolygonId,
        setSelectedPolygonId,

        // Состояние данных
        currentPoints,
        setCurrentPoints,
        polygons,
        setPolygons,

        // Refs
        editorPopupRef,
        actionsPopupRef,
        historyRef,
        editingPolygonRef,
        isDrawingRef,
        selectedPolygonIdRef,
        polygonsRef,

        // Обработчики
        handleStartDrawing,
        handleCompletePolygon,
        handleCancelDrawing,
        handleUndoLastPoint,
        handleEditPolygon,
        handleDeletePolygon,
        handleClear,
    };
}
