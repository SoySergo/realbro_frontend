# Location Filter Feature

## Назначение

Feature для управления локальным состоянием фильтра по локации (режимы: search, draw, isochrone, radius).

## Почему это Feature, а не Shared?

Этот код **специфичен для фильтрации по локации**:
- Управляет состоянием разных режимов локации (search, draw, etc.)
- Содержит бизнес-логику работы с локациями
- Используется только в контексте location-filter
- Временное состояние до применения фильтра

## Структура

```
location-filter/
├── model/
│   ├── use-local-location-state.ts    # Hook для локального состояния режимов
│   └── index.ts
├── lib/
│   └── index.ts
└── index.ts
```

## Использование

```tsx
import { useLocalLocationState } from '@/features/location-filter'

const { 
  currentLocalState, 
  updateSearchState 
} = useLocalLocationState('search')

// Обновить локации в режиме search
updateSearchState({ selectedLocations: [...locations] })
```
