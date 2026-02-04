# Map Sidebar Widget

## Обзор

Виджет `map-sidebar` предоставляет два компонента для отображения списка объектов недвижимости в режиме карты:
- `MapSidebar` - для desktop
- `MobileMapSidebar` - для мобильных устройств

## MapSidebar (Desktop)

### Основные возможности

- ✅ Использует `PropertyCardGrid` из `@/entities/property`
- ✅ Виртуализированный список через `react-window` v2
- ✅ Sticky header с элементами управления
- ✅ Сортировка (цена, площадь, дата публикации)
- ✅ Переключение порядка сортировки (asc/desc)
- ✅ Кнопка скрыть/показать сайдбар
- ✅ Infinite scroll для подгрузки страниц
- ✅ Поддержка кластеров
- ✅ Состояния: loading, empty

### Props

```typescript
interface MapSidebarProps {
    onPropertyClick?: (property: Property) => void;
    onPropertyHover?: (property: Property | null) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    isVisible?: boolean;
    onVisibilityChange?: (visible: boolean) => void;
    className?: string;
}
```

### Использование

```tsx
import { MapSidebar } from '@/widgets/map-sidebar';

<MapSidebar
    onPropertyClick={handlePropertyClick}
    onPropertyHover={handlePropertyHover}
    selectedPropertyId={selectedId}
    clusterId={selectedClusterId}
    onClusterReset={() => setSelectedClusterId(null)}
    isVisible={sidebarVisible}
    onVisibilityChange={setSidebarVisible}
/>
```

## MobileMapSidebar

### Основные возможности

- ✅ Bottom Sheet реализация через `Sheet` из `@radix-ui`
- ✅ Drag handle
- ✅ Использует `PropertyCardGrid`
- ✅ Infinite scroll
- ✅ Сортировка
- ✅ Поддержка кластеров
- ✅ Кнопка переключения режима "Списком"

### Props

```typescript
interface MobileMapSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onPropertyClick?: (property: Property) => void;
    selectedPropertyId?: string | null;
    clusterId?: string | null;
    onClusterReset?: () => void;
    onViewModeChange?: (mode: 'map' | 'list') => void;
}
```

### Использование

```tsx
import { MobileMapSidebar } from '@/widgets/map-sidebar';

<MobileMapSidebar
    isOpen={mobileListOpen}
    onClose={() => setMobileListOpen(false)}
    onPropertyClick={handlePropertyClick}
    selectedPropertyId={selectedId}
    clusterId={selectedClusterId}
    onClusterReset={() => setSelectedClusterId(null)}
    onViewModeChange={(mode) => {
        if (mode === 'list') {
            // Переход на режим списка
            setViewMode('list');
        }
    }}
/>
```

## Локализация

Поддерживаемые языки: en, ru, fr

Ключи в `mapSidebar` секции:
- hidePanel, showPanel
- showOnMap, showAsList
- resetCluster, clusterObjects
- sortBy, sortPrice, sortArea, sortDate
- noResults, loading
- objectsCount

## API Integration

Использует `getPropertiesList` из `@/shared/api` и `useCurrentFilters()` из `@/widgets/search-filters-bar`.

## Известные ограничения

1. Mobile версия использует базовый Sheet без продвинутых snap points
2. Мобильная версия без виртуализации списка
3. Keyboard navigation удалена

## Связанные компоненты

- `PropertyCardGrid` - `/src/entities/property/ui/property-card-grid`
- `SearchFiltersBar` - `/src/widgets/search-filters-bar`
- Shared API - `/src/shared/api/properties.ts`
