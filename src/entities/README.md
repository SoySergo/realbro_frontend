# Entities Layer

## Назначение

Слой Entities содержит бизнес-сущности приложения - модели данных и их логику.

## Правила

1. **Чистые данные** - типы, store, валидация
2. **Без UI логики** - только бизнес-логика
3. **Переиспользуемость** - используются в features
4. **Минимум зависимостей** - только от shared

## Структура

```
entities/
├── property/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── index.ts
│   ├── ui/
│   │   ├── property-card/
│   │   └── index.ts
│   └── index.ts
└── filter/
    ├── model/
    │   ├── types.ts
    │   ├── store.ts
    │   └── index.ts
    ├── lib/
    │   ├── convert-filters.ts
    │   └── index.ts
    └── index.ts
```

## Пример

```tsx
// src/entities/filter/model/store.ts
import { create } from 'zustand'
import type { SearchFilters } from './types'

interface FilterState {
  filters: SearchFilters
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
  resetFilters: () => set({ filters: {} }),
}))
```
