# Синхронизация по Wikidata

## Изменения

### Проблема
Ранее синхронизация между результатами поиска Mapbox и полигонами OSM на карте выполнялась по числовым ID, которые не совпадали между системами.

### Решение
Используем **Wikidata ID** как общий идентификатор для синхронизации:
- Mapbox Geocoding API возвращает `wikidata` (например: `"Q1492"` для Барселоны)
- OSM полигоны содержат `wikidata` в свойствах (например: `properties.wikidata: "Q1492"`)

## Обновлённые типы

### LocationItem (`src/types/filter.ts`)
```typescript
export interface LocationItem {
    id: number; // Deprecated: для обратной совместимости
    name: string;
    type: 'city' | 'province' | 'district' | 'country' | 'neighborhood';
    adminLevel?: number;
    centerLat?: number;
    centerLon?: number;
    areaSqKm?: number;
    // Основной идентификатор для синхронизации
    wikidata?: string; // Например: "Q1492" для Барселоны
    osmId?: number; // OSM ID (если доступен)
}
```

## Обновлённый Store

### FilterStore (`src/store/filterStore.ts`)
```typescript
// Было:
selectedBoundaryIds: Set<number>

// Стало:
selectedBoundaryWikidata: Set<string>

// Методы:
addSelectedBoundary(wikidata: string): void
removeSelectedBoundary(wikidata: string): void
toggleSelectedBoundary(wikidata: string): void
```

## Использование на карте

### Пример интеграции в компонент карты

```typescript
const { selectedBoundaryWikidata } = useFilterStore();

// Проверка, выбран ли полигон
const isSelected = (boundary: Boundary) => {
    return boundary.properties?.wikidata && 
           selectedBoundaryWikidata.has(boundary.properties.wikidata);
};

// Применение стилей
if (isSelected(boundary)) {
    // Стиль выбранного полигона
    fillColor = 'rgba(0, 120, 255, 0.3)';
    strokeColor = '#0078ff';
    strokeWidth = 2;
}

// Обработка клика на полигон
const handleBoundaryClick = (boundary: Boundary) => {
    if (boundary.properties?.wikidata) {
        toggleSelectedBoundary(boundary.properties.wikidata);
        
        // Также добавляем в selectedLocations
        const locationItem: LocationItem = {
            id: boundary.osm_id,
            name: boundary.properties.name,
            type: mapAdminLevelToType(boundary.admin_level),
            adminLevel: boundary.admin_level,
            wikidata: boundary.properties.wikidata,
            osmId: boundary.osm_id,
        };
        
        // Обновляем фильтр локации
        const currentLocations = locationFilter?.selectedLocations || [];
        const exists = currentLocations.find(loc => loc.wikidata === locationItem.wikidata);
        
        if (!exists) {
            setLocationFilter({
                mode: 'search',
                selectedLocations: [...currentLocations, locationItem],
            });
        } else {
            setLocationFilter({
                mode: 'search',
                selectedLocations: currentLocations.filter(loc => loc.wikidata !== locationItem.wikidata),
            });
        }
    }
};
```

## Пример данных

### Mapbox результат
```json
{
  "id": "place.123456",
  "text": "Barcelona",
  "place_name": "Barcelona, Catalonia, Spain",
  "place_type": ["place"],
  "center": [2.1734, 41.3851],
  "properties": {
    "wikidata": "Q1492"
  }
}
```

### OSM полигон
```json
{
  "osm_id": -347950,
  "admin_level": 8,
  "name": "Барселона",
  "properties": {
    "admin_level": 8,
    "boundary_type": "administrative",
    "name": "Barcelona",
    "name_ru": "Барселона",
    "wikidata": "Q1492",
    "osm_id": -347950
  }
}
```

### Синхронизация
Оба объекта имеют `wikidata: "Q1492"` → используется для связи!

## Логирование

Для отладки добавлено логирование:
```typescript
console.log('Added boundary with wikidata:', wikidata, name);
```

Проверяйте консоль браузера для отладки синхронизации.

## Hover эффект

Hover эффект на полигонах карты работает **только локально** в `BoundariesLayer.tsx`:
- При наведении на полигон он подсвечивается через `setFeatureState({ hover: true })`
- При уходе мыши состояние сбрасывается через `setFeatureState({ hover: false })`
- **Не используется глобальный state** - hover не синхронизируется между компонентами
- Наведение на элементы выпадающего списка поиска **не влияет** на полигоны карты
