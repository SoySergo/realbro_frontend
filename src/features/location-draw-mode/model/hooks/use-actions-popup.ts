import { useEffect, useRef, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import type { DrawPolygon } from '@/entities/map-draw/model/types';
import { DrawPolygonActions } from '../../ui/draw-polygon-actions';

type UseActionsPopupProps = {
    /** Инстанс карты */
    map: mapboxgl.Map;
    /** ID выбранного полигона */
    selectedPolygonId: string | null;
    /** Массив всех полигонов */
    polygons: DrawPolygon[];
    /** Ref для хранения popup */
    actionsPopupRef: React.RefObject<mapboxgl.Popup | null>;
    /** Режим рисования активен */
    isDrawing: boolean;
    /** Колбэк редактирования полигона */
    onEdit: (polygonId: string) => void;
    /** Колбэк удаления полигона */
    onDelete: (polygonId: string) => void;
    /** Колбэк для сброса выделения полигона */
    onSelectPolygon: (polygonId: string | null) => void;
    /** Переводы для компонента */
    translations: {
        edit: string;
        delete: string;
    };
};

/**
 * Хук для управления popup-ом с действиями над полигоном
 * 
 * Создаёт popup при клике на полигон
 * Показывает кнопки редактирования и удаления
 */
export function useActionsPopup({
    map,
    selectedPolygonId,
    polygons,
    actionsPopupRef,
    isDrawing,
    onEdit,
    onDelete,
    onSelectPolygon,
    translations,
}: UseActionsPopupProps) {
    // Ref для хранения React root (чтобы не создавать множество корней)
    const rootRef = useRef<Root | null>(null);

    useEffect(() => {
        // Не показываем popup в режиме рисования или если нет выбранного полигона
        if (isDrawing || !selectedPolygonId) {
            // Удаляем существующий popup
            if (actionsPopupRef.current) {
                actionsPopupRef.current.remove();
                actionsPopupRef.current = null;
            }
            // Размонтируем React root асинхронно
            if (rootRef.current) {
                const root = rootRef.current;
                rootRef.current = null;
                queueMicrotask(() => {
                    root.unmount();
                });
            }
            return;
        }

        // Находим выбранный полигон
        const selectedPolygon = polygons.find((p) => p.id === selectedPolygonId);
        if (!selectedPolygon || selectedPolygon.points.length === 0) {
            return;
        }

        // Вычисляем центр полигона для позиционирования popup
        const centerLng =
            selectedPolygon.points.reduce((sum, p) => sum + p.lng, 0) /
            selectedPolygon.points.length;
        const centerLat =
            selectedPolygon.points.reduce((sum, p) => sum + p.lat, 0) /
            selectedPolygon.points.length;

        // Создаём popup если его ещё нет
        if (!actionsPopupRef.current) {
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
                anchor: 'bottom',
                offset: 10,
                className: 'draw-actions-popup',
            });

            // Обработчик закрытия popup
            popup.on('close', () => {
                // Размонтируем React root асинхронно
                if (rootRef.current) {
                    const root = rootRef.current;
                    rootRef.current = null;
                    queueMicrotask(() => {
                        root.unmount();
                    });
                }
                actionsPopupRef.current = null;
                // Сбрасываем выделение полигона
                onSelectPolygon(null);
                console.log('Actions popup closed');
            });

            // Создаём контейнер для React компонента
            const container = document.createElement('div');

            // Создаём React root один раз
            rootRef.current = createRoot(container);
            rootRef.current.render(
                createElement(DrawPolygonActions, {
                    onEdit: () => {
                        onEdit(selectedPolygonId);
                        popup.remove();
                    },
                    onDelete: () => {
                        onDelete(selectedPolygonId);
                        popup.remove();
                    },
                    translations,
                })
            );

            // Устанавливаем контейнер в popup
            popup.setDOMContent(container);
            popup.setLngLat([centerLng, centerLat]);
            popup.addTo(map);

            actionsPopupRef.current = popup;

            console.log(`Actions popup created for polygon ${selectedPolygonId}`);
        } else {
            // Обновляем позицию popup при изменении полигона
            actionsPopupRef.current.setLngLat([centerLng, centerLat]);

            // Обновляем контент popup через существующий root
            if (rootRef.current) {
                rootRef.current.render(
                    createElement(DrawPolygonActions, {
                        onEdit: () => {
                            onEdit(selectedPolygonId);
                            actionsPopupRef.current?.remove();
                        },
                        onDelete: () => {
                            onDelete(selectedPolygonId);
                            actionsPopupRef.current?.remove();
                        },
                        translations,
                    })
                );
            }

            console.log(`Actions popup updated for polygon ${selectedPolygonId}`);
        }
    }, [
        isDrawing,
        selectedPolygonId,
        polygons,
        actionsPopupRef,
        map,
        onEdit,
        onDelete,
        onSelectPolygon,
        translations,
    ]);

    // Cleanup при размонтировании компонента
    useEffect(() => {
        return () => {
            // Размонтируем React root асинхронно
            if (rootRef.current) {
                const root = rootRef.current;
                rootRef.current = null;
                queueMicrotask(() => {
                    root.unmount();
                });
            }
        };
    }, []);
}
