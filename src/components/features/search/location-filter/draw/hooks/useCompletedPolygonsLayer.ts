import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import mapboxgl from 'mapbox-gl';
import type { DrawPolygon } from '@/types/draw';
import { setPolygonFeatureState } from '../utils/mapLayerHelpers';
import { getPolygonStyles } from '../utils/polygonStyles';

type UseCompletedPolygonsLayerProps = {
    map: mapboxgl.Map;
    polygons: DrawPolygon[];
    selectedPolygonId: string | null;
    isDrawingRef: React.RefObject<boolean>;
    selectedPolygonIdRef: React.RefObject<string | null>;
    setSelectedPolygonId: (id: string | null) => void;
};

/**
 * Хук для отрисовки завершённых полигонов
 * 
 * Функциональность:
 * - Создание GeoJSON FeatureCollection для всех полигонов
 * - Добавление слоёв с feature-state для selected/hover
 * - Обработка кликов (выделение полигона)
 * - Обработка hover эффекта
 * - Смена курсора на pointer при наведении
 */
export function useCompletedPolygonsLayer({
    map,
    polygons,
    selectedPolygonId,
    isDrawingRef,
    selectedPolygonIdRef,
    setSelectedPolygonId,
}: UseCompletedPolygonsLayerProps): void {
    const { theme } = useTheme();
    const styles = getPolygonStyles(theme === 'light' ? 'light' : 'dark');

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
                    coordinates: [
                        [
                            ...polygon.points.map((p) => [p.lng, p.lat]),
                            [polygon.points[0].lng, polygon.points[0].lat],
                        ],
                    ],
                },
            })),
        };

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'geojson', data: geojson, promoteId: 'id' });

            // Заливка - применяем стили из конфигурации темы
            map.addLayer({
                id: 'completed-polygons-fill',
                type: 'fill',
                source: sourceId,
                paint: {
                    'fill-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        styles.fillSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        styles.fillHover,
                        styles.fillDefault,
                    ],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        styles.fillOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        styles.fillOpacityHover,
                        styles.fillOpacityDefault,
                    ],
                },
            });

            // Границы - применяем стили из конфигурации темы
            map.addLayer({
                id: 'completed-polygons-line',
                type: 'line',
                source: sourceId,
                paint: {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        styles.lineSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        styles.lineHover,
                        styles.lineDefault,
                    ],
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        styles.lineWidthSelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        styles.lineWidthHover,
                        styles.lineWidthDefault,
                    ],
                    'line-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'selected'], false],
                        styles.lineOpacitySelected,
                        ['boolean', ['feature-state', 'hover'], false],
                        styles.lineOpacityHover,
                        styles.lineOpacityDefault,
                    ],
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

                    if (polygonId) {
                        // Убираем selected с предыдущего полигона
                        const currentSelectedId = selectedPolygonIdRef.current;
                        if (currentSelectedId && currentSelectedId !== polygonId) {
                            setPolygonFeatureState(map, sourceId, currentSelectedId, { selected: false });
                        }

                        setSelectedPolygonId(polygonId);
                        selectedPolygonIdRef.current = polygonId;

                        // Устанавливаем selected для нового полигона
                        setPolygonFeatureState(map, sourceId, polygonId, { selected: true });

                        console.log('Polygon selected:', polygonId);
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
                            setPolygonFeatureState(map, sourceId, hoveredPolygonId, { hover: false });
                        }

                        // Устанавливаем hover на новый (если он не выбран)
                        const currentSelectedId = selectedPolygonIdRef.current;
                        if (polygonId !== currentSelectedId) {
                            setPolygonFeatureState(map, sourceId, polygonId, { hover: true });
                        }

                        hoveredPolygonId = polygonId;
                    }
                }
                map.getCanvas().style.cursor = 'pointer';
            };

            const handlePolygonMouseLeave = () => {
                // Убираем hover при уходе курсора
                if (hoveredPolygonId) {
                    setPolygonFeatureState(map, sourceId, hoveredPolygonId, { hover: false });
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [polygons, selectedPolygonId, map, isDrawingRef, selectedPolygonIdRef, setSelectedPolygonId, theme]);

    // Синхронизация feature-state с selectedPolygonId
    useEffect(() => {
        const sourceId = 'completed-polygons';

        // Проверяем что источник существует
        if (!map.getSource(sourceId)) {
            return;
        }

        // Убираем selected со всех полигонов
        polygons.forEach((polygon) => {
            setPolygonFeatureState(map, sourceId, polygon.id, { selected: false });
        });

        // Устанавливаем selected для выбранного полигона
        if (selectedPolygonId) {
            setPolygonFeatureState(map, sourceId, selectedPolygonId, { selected: true });
            console.log(`Feature state updated: polygon ${selectedPolygonId} selected`);
        } else {
            console.log('Feature state updated: no polygon selected');
        }
    }, [selectedPolygonId, polygons, map]);
}
