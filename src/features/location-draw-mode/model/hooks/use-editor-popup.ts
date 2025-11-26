import { useEffect, useRef, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import type { DrawPoint } from '@/entities/map-draw/model/types';
import { DrawPolygonEditor } from '../../ui/draw-polygon-editor';

type UseEditorPopupProps = {
    /** Инстанс карты */
    map: mapboxgl.Map;
    /** Режим рисования активен */
    isDrawing: boolean;
    /** Текущие точки полигона */
    currentPoints: DrawPoint[];
    /** Ref для хранения popup */
    editorPopupRef: React.RefObject<mapboxgl.Popup | null>;
    /** Колбэк завершения полигона */
    onComplete: () => void;
    /** Колбэк отмены рисования */
    onCancel: () => void;
    /** Колбэк отмены последней точки */
    onUndo: () => void;
    /** Переводы для компонента */
    translations: {
        points: string;
        save: string;
        minThreePoints: string;
        undo: string;
        cancel: string;
    };
};

/**
 * Хук для управления popup-ом редактора полигона
 * 
 * Создаёт и позиционирует popup рядом с первой точкой
 * Обновляет контент при изменении количества точек
 */
export function useEditorPopup({
    map,
    isDrawing,
    currentPoints,
    editorPopupRef,
    onComplete,
    onCancel,
    onUndo,
    translations,
}: UseEditorPopupProps) {
    // Ref для хранения React root (чтобы не создавать множество корней)
    const rootRef = useRef<Root | null>(null);

    useEffect(() => {
        // Показываем popup только в режиме рисования с точками
        if (!isDrawing || currentPoints.length === 0) {
            // Удаляем существующий popup
            if (editorPopupRef.current) {
                editorPopupRef.current.remove();
                editorPopupRef.current = null;
            }
            // Размонтируем React root асинхронно
            if (rootRef.current) {
                const root = rootRef.current;
                rootRef.current = null;
                // Откладываем размонтирование, чтобы не делать это во время рендера
                queueMicrotask(() => {
                    root.unmount();
                });
            }
            return;
        }

        // Координаты первой точки
        const firstPoint = currentPoints[0];

        // Создаём popup если его ещё нет
        if (!editorPopupRef.current) {
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                anchor: 'bottom',
                offset: 15,
                className: 'draw-editor-popup',
            });

            // Создаём контейнер для React компонента
            const container = document.createElement('div');

            // Создаём React root один раз
            rootRef.current = createRoot(container);
            rootRef.current.render(
                createElement(DrawPolygonEditor, {
                    pointsCount: currentPoints.length,
                    onComplete,
                    onCancel,
                    onUndo,
                    translations,
                })
            );

            // Устанавливаем контейнер в popup
            popup.setDOMContent(container);
            popup.setLngLat([firstPoint.lng, firstPoint.lat]);
            popup.addTo(map);

            editorPopupRef.current = popup;

            console.log('Editor popup created at first point');
        } else {
            // Обновляем позицию popup при изменении первой точки
            editorPopupRef.current.setLngLat([firstPoint.lng, firstPoint.lat]);

            // Обновляем контент popup при изменении количества точек через существующий root
            if (rootRef.current) {
                rootRef.current.render(
                    createElement(DrawPolygonEditor, {
                        pointsCount: currentPoints.length,
                        onComplete,
                        onCancel,
                        onUndo,
                        translations,
                    })
                );
            }

            console.log(`Editor popup updated: ${currentPoints.length} points`);
        }
    }, [isDrawing, currentPoints, editorPopupRef, map, onComplete, onCancel, onUndo, translations]);

    // Cleanup при размонтировании компонента
    useEffect(() => {
        return () => {
            // Размонтируем React root асинхронно
            if (rootRef.current) {
                const root = rootRef.current;
                rootRef.current = null;
                // Откладываем размонтирование, чтобы не делать это во время рендера
                queueMicrotask(() => {
                    root.unmount();
                });
            }
        };
    }, []);
}
