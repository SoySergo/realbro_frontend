/**
 * Feature: Location Isochrone Mode
 * 
 * Режим фильтра по изохрону (время до точки)
 * - Выбор точки на карте или через поиск
 * - Выбор профиля передвижения (walking/cycling/driving/driving-traffic)
 * - Выбор времени в пути (5/10/15/30/45/60 минут)
 * - Отрисовка изохрона на карте через Mapbox Isochrone API
 * - Маркер с возможностью перетаскивания
 * 
 * TODO: Интеграция с бекендом (сохранение изохрона, получение ID)
 * TODO: Интеграция с URL sync (isochroneId параметр)
 */

export * from './ui';
export * from './model';
