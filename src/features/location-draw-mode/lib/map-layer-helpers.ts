import mapboxgl from 'mapbox-gl';

/**
 * Удаление слоя карты если он существует
 */
export const removeLayerIfExists = (map: mapboxgl.Map, layerId: string): void => {
    try {
        if (map.getStyle() && map.getLayer(layerId)) {
            map.removeLayer(layerId);
        }
    } catch {
        // Карта уже уничтожена — игнорируем
    }
};

/**
 * Удаление источника карты если он существует
 */
export const removeSourceIfExists = (map: mapboxgl.Map, sourceId: string): void => {
    try {
        if (map.getStyle() && map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    } catch {
        // Карта уже уничтожена — игнорируем
    }
};

/**
 * Очистка слоёв текущего рисования (не трогает завершённые полигоны)
 */
export const cleanupDrawingLayers = (map: mapboxgl.Map): void => {
    try {
        // Удаляем слои текущего рисования
        removeLayerIfExists(map, 'drawing-polygon-fill');
        removeLayerIfExists(map, 'drawing-polygon-line');
        removeLayerIfExists(map, 'drawing-polygon-points');
        removeSourceIfExists(map, 'drawing-polygon');
        removeSourceIfExists(map, 'drawing-polygon-points');

        // Завершённые полигоны оставляем — они должны быть видны после выхода из режима рисования
        console.log('Drawing layers cleaned up (completed polygons preserved)');
    } catch (error) {
        console.error('Error cleaning up map layers:', error);
    }
};

/**
 * Полная очистка всех слоёв рисования (включая завершённые полигоны)
 */
export const cleanupAllDrawingLayers = (map: mapboxgl.Map): void => {
    try {
        cleanupDrawingLayers(map);

        // Удаляем слои завершённых полигонов
        removeLayerIfExists(map, 'completed-polygons-fill');
        removeLayerIfExists(map, 'completed-polygons-line');
        removeSourceIfExists(map, 'completed-polygons');

        console.log('All drawing layers cleaned up');
    } catch (error) {
        console.error('Error cleaning up all map layers:', error);
    }
};

/**
 * Установка feature state для полигона
 */
export const setPolygonFeatureState = (
    map: mapboxgl.Map,
    sourceId: string,
    polygonId: string,
    state: { selected?: boolean; hover?: boolean }
): void => {
    try {
        map.setFeatureState({ source: sourceId, id: polygonId }, state);
    } catch (error) {
        console.warn('Error setting feature state:', error);
    }
};
