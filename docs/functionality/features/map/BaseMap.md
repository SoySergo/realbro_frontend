# BaseMap, SearchMap и MapLocationController

**Что делает**: Система компонентов карты для гибкого управления режимами фильтра локации и отображения недвижимости.

## Компоненты

### BaseMap
Базовый компонент инициализации карты Mapbox.

**Пропсы**:
- `initialCenter?: [number, number]` - начальные координаты центра
- `initialZoom?: number` - начальный зум
- `onMapLoad?: (map: mapboxgl.Map) => void` - колбэк при загрузке карты
- `children?: React.ReactNode` - дочерние элементы (панели поверх карты)

**Файл**: `src/components/features/map/BaseMap.tsx`

---

### SearchMap
Оркестратор для страницы поиска. Управляет режимами фильтра локации и маркерами недвижимости.

**Логика**:
- Если активен режим локации (`activeLocationMode`) → показывает `MapLocationController`
- Если режим НЕ активен → показывает маркеры недвижимости (TODO)

**Пропсы**:
- `initialCenter?: [number, number]`
- `initialZoom?: number`

**Стейт**: 
- `useFilterStore().activeLocationMode` - активный режим фильтра локации

**Файл**: `src/components/features/map/SearchMap.tsx`

---

### MapLocationController
Контроллер для отображения панелей управления режимами фильтра локации.

**Режимы**:
- `search` - Поиск и выбор локаций (с OSM полигонами)
- `draw` - Рисование произвольной области
- `isochrone` - Изохрон (время в пути)
- `radius` - Радиус от точки

**Пропсы**:
- `map: mapboxgl.Map` - инстанс карты

**Стейт**: 
- `useFilterStore().activeLocationMode` - определяет какую панель показывать

**Файл**: `src/components/features/map/MapLocationController.tsx`

---

## Использование на странице search

```tsx
<SearchMap />
```

Внутри:
1. `BaseMap` инициализирует карту
2. `MapLocationController` рендерит панель для активного режима локации
3. При отсутствии активного режима - отображаются маркеры недвижимости

---

## Добавление нового режима

1. Создать компонент панели (например, `MapRadius.tsx`)
2. Добавить импорт в `MapLocationController.tsx`
3. Добавить условный рендеринг:
```tsx
{activeLocationMode === 'radius' && (
    <MapRadius map={map} onClose={handleClosePanel} />
)}
```

---

## TODO
- Компонент отображения маркеров недвижимости
- Остальные режимы: `MapRadius`, `MapDraw`, `MapSearch`
