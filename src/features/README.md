# Features Layer

## Назначение

Слой Features содержит функциональность с бизнес-логикой - конкретные действия пользователя.

## Правила

1. **Одна фича = одно действие** - фильтр, поиск, добавление в избранное
2. **Может иметь state** - через Zustand или React state
3. **Использует entities** - для работы с данными
4. **Переиспользуемость** - может использоваться в разных местах

## Структура

```
features/
├── price-filter/
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── index.ts
│   ├── ui/
│   │   ├── ui.tsx
│   │   └── index.ts
│   ├── lib/
│   │   └── index.ts
│   └── index.ts
└── location-filter/
    ├── model/
    │   ├── store.ts
    │   ├── types.ts
    │   └── index.ts
    ├── ui/
    │   ├── location-search/
    │   └── index.ts
    ├── lib/
    │   ├── url-sync.ts
    │   └── index.ts
    ├── hooks/
    │   └── index.ts
    └── index.ts
```

## Пример

```tsx
// src/features/price-filter/ui/ui.tsx
'use client'
import { useFilterStore } from '@/entities/filter'
import { Slider } from '@/shared/ui/slider'

export const PriceFilter = () => {
  const { minPrice, maxPrice, setPrice } = useFilterStore()
  
  return (
    <div className="price-filter">
      <Slider 
        value={[minPrice, maxPrice]}
        onChange={setPrice}
      />
    </div>
  )
}
```
