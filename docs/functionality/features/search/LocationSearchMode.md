# LocationSearchMode - Поиск локаций через Mapbox

**Что делает**: Режим поиска локаций через Mapbox Geocoding API с автокомплитом, выбором тегов и синхронизацией с картой.

**Ключевые особенности**:

### Функциональность
- **Поиск**: Использует Mapbox Geocoding API для поиска городов, регионов, районов, стран
- **Автокомплит**: Результаты появляются в dropdown при вводе (debounce 300ms)
- **Теги**: Выбранные локации отображаются как теги с возможностью удаления
- **Popover**: При большом количестве тегов (>3) остальные скрываются в popover
- **Локализация**: Все тексты через `next-intl`, язык поиска = язык пользователя
### Интеграция с картой
- **Выбор локации**: При клике добавляется в `selectedBoundaryWikidata` в store
- **Удаление**: При удалении тега удаляется из `selectedBoundaryWikidata`
- **Двусторонняя синхронизация**:
  1. Выбор из инпута → добавление в `selectedLocations` → подсветка полигона на карте
  2. Клик на полигон → добавление в `selectedLocations` → отображение в тегах

### Компоненты
- **SearchInput**: UI компонент инпута с лоадером и очисткой (`src/components/ui/search-input.tsx`)
- **Mapbox Geocoding**: Сервис для поиска мест через API (`src/services/mapbox-geocoding.ts`)

### Пропсы
Не принимает пропсы, использует глобальный store (`useFilterStore`)

### Store state
- `locationFilter.selectedLocations: LocationItem[]` - выбранные локации (с wikidata)
- `selectedBoundaryWikidata: Set<string>` - Wikidata ID для подсветки на карте

### Синхронизация по Wikidata
**Важно**: Синхронизация между результатами поиска Mapbox и OSM полигонами на карте выполняется по **Wikidata ID** (например: `"Q1492"` для Барселоны), а не по числовым ID, так как:
- Mapbox Geocoding API возвращает `wikidata` в properties
- OSM полигоны содержат `wikidata` в properties
- Это единственный общий идентификатор между двумя системами

Подробнее: [WIKIDATA_SYNC.md](/docs/WIKIDATA_SYNC.md)

### API
```typescript
// Mapbox Geocoding API
GET https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json
  ?access_token={token}
  &language={locale}
  &types=country,region,place,district,neighborhood
  &limit=10
```

### Преобразование типов
Mapbox типы → LocationItem типы:
- `country` → `'country'` (admin_level 2)
- `region` → `'province'` (admin_level 4)
- `place` → `'city'` (admin_level 8)
- `district` → `'district'` (admin_level 9)
- `neighborhood` → `'neighborhood'` (admin_level 10)

**Файлы**:
- Компонент: `src/components/features/search/location-details/LocationSearchMode.tsx`
- UI компонент: `src/components/ui/search-input.tsx`
- Сервис: `src/services/mapbox-geocoding.ts`
- Store: `src/store/filterStore.ts`
- Типы: `src/types/map.ts`, `src/types/filter.ts`
