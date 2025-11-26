import mapboxgl from 'mapbox-gl';

/**
 * Удаление слоя карты если он существует
 */
export const removeLayerIfExists = (map: mapboxgl.Map, layerId: string): void => {
    if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
    }
};

/**
 * Удаление источника карты если он существует
 */
export const removeSourceIfExists = (map: mapboxgl.Map, sourceId: string): void => {
    if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
    }
};

/**
 * Очистка всех слоёв и источников рисования
 */
export const cleanupDrawingLayers = (map: mapboxgl.Map): void => {
    try {
        // Удаляем слои текущего рисования
        removeLayerIfExists(map, 'drawing-polygon-fill');
        removeLayerIfExists(map, 'drawing-polygon-line');
        removeLayerIfExists(map, 'drawing-polygon-points');
        removeSourceIfExists(map, 'drawing-polygon');
        removeSourceIfExists(map, 'drawing-polygon-points');

        // Удаляем слои завершённых полигонов
        removeLayerIfExists(map, 'completed-polygons-fill');
        removeLayerIfExists(map, 'completed-polygons-line');
        removeSourceIfExists(map, 'completed-polygons');

        console.log('Drawing layers cleaned up');
    } catch (error) {
        console.error('Error cleaning up map layers:', error);
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
