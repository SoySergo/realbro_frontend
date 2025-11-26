# Search Filters Feature

## Назначение

Feature для управления фильтрами поиска недвижимости через URL параметры.

## Почему это Feature, а не Shared?

Этот код **специфичен для фильтрации недвижимости**:
- Работает с конкретными типами фильтров (цена, комнаты, площадь, локации)
- Содержит бизнес-логику сериализации фильтров
- Управляет состоянием через URL (feature-specific behavior)
- Используется только в контексте поиска недвижимости

## Структура

```
search-filters/
├── model/
│   ├── use-search-filters.ts    # Hook для работы с фильтрами через URL
│   └── index.ts
├── lib/
│   ├── search-params.ts          # Утилиты сериализации/десериализации фильтров
│   └── index.ts
└── index.ts
```

## Использование

```tsx
import { useSearchFilters } from '@/features/search-filters'

const { filters, setFilters, clearFilters } = useSearchFilters()

// Установить фильтры
setFilters({ minPrice: 500, maxPrice: 2000 })

// Очистить все
clearFilters()
```
