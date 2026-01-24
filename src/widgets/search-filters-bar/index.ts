/**
 * Widget: Search Filters Bar
 * 
 * Горизонтальная панель фильтров поиска недвижимости.
 * Композирует все фильтры (area, price, rooms, category, marker-type, location)
 * и QueryTitleEditor в единый UI блок.
 * 
 * MobileFiltersSheet - мобильная версия фильтров в виде drawer/sheet
 */

export { SearchFiltersBar } from './ui';
export { MobileFiltersSheet } from './ui/mobile-filters-sheet';
export { useFilterStore } from './model/store';
export type { SearchViewMode } from './model/store';
