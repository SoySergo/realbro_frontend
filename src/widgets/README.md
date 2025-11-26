# Widgets Layer (Виджеты)

## Назначение

Слой Widgets содержит сложные независимые блоки UI, которые объединяют features и entities.
В отличие от Features, которые реализуют конкретную бизнес-логику, Widgets:
- Композируют несколько features вместе
- Управляют layout и размещением
- Могут иметь сложную внутреннюю структуру
- Не должны импортировать другие widgets (только features/entities/shared)

## Правила архитектуры

### ✅ Разрешено:
1. **Композиция features** - виджеты собирают features и entities
2. **Независимость** - могут работать автономно
3. **Бизнес-контекст** - привязаны к конкретному месту в UI
4. **Могут иметь свой state** - через Zustand или React state
5. **Импорты из** `@/features/*`, `@/entities/*`, `@/shared/*`

### ❌ Запрещено:
- Импорты из `@/widgets/*` (циклическая зависимость)
- Импорты из `@/pages/*` или `@/app/*` (нарушение иерархии)
- Бизнес-логика features (должна быть в feature)

## Структура виджета

```
widgets/
├── search-filters-bar/           # ✅ Мигрирован
│   ├── ui/
│   │   ├── ui.tsx               # SearchFiltersBar компонент
│   │   └── index.ts
│   └── index.ts
├── sidebar/                      # TODO
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── index.ts
│   ├── ui/
│   │   ├── sidebar/
│   │   └── index.ts
│   └── index.ts
└── property-list/                # TODO (будущее)
    ├── ui/
    │   ├── ui.tsx
    │   └── index.ts
    └── index.ts
```

## Виджеты в проекте

### 1. search-filters-bar ✅ (завершён)
**Назначение:** Горизонтальная панель фильтров поиска недвижимости

**Композиция features:**
- `query-title-editor` - редактирование названия запроса
- `marker-type-filter` - тип маркеров
- `location-filter` - фильтр по локации (кнопка выбора режима)
- `category-filter` - категория недвижимости
- `price-filter` - цена
- `rooms-filter` - количество комнат
- `area-filter` - площадь
- `search-filters` (model) - общая логика фильтров (useSearchFilters)

**Использование:**
```tsx
import { SearchFiltersBar } from '@/widgets/search-filters-bar';

// В SearchPage
<SearchFiltersBar />
```

### 2. sidebar (TODO)
**Назначение:** Боковая панель со списком сохранённых запросов

### 3. property-list (TODO - будущее)
**Назначение:** Список недвижимости с пагинацией

## Пример композиции features

```tsx
// widgets/search-filters-bar/ui/ui.tsx
import { MarkerTypeFilter } from '@/features/marker-type-filter';
import { LocationFilterButton } from '@/features/location-filter';
import { CategoryFilter } from '@/features/category-filter';
import { PriceFilter } from '@/features/price-filter';
import { RoomsFilter } from '@/features/rooms-filter';
import { AreaFilter } from '@/features/area-filter';
import { QueryTitleEditor } from '@/features/query-title-editor';

export function SearchFiltersBar() {
  return (
    <div className="filters-bar">
      <QueryTitleEditor />
      <MarkerTypeFilter />
      <LocationFilterButton />
      <CategoryFilter />
      <PriceFilter />
      <RoomsFilter />
      <AreaFilter />
    </div>
  );
}
```
