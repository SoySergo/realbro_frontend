# Двухслойная система фильтров локации

**Что делает**: Реализует промежуточный слой для временных изменений фильтров локации перед их применением в глобальное состояние.

## Архитектура

### Два слоя состояния

1. **Локальный слой (localStorage)**
   - Временные изменения пользователя
   - Сохраняется при переключении между режимами
   - Очищается кнопкой "Очистить"
   - Не влияет на результаты поиска до применения

2. **Глобальный слой (filterStore)**
   - Применённые фильтры
   - Влияет на результаты поиска и карту
   - Обновляется только по кнопке "Применить"

## Компоненты

### useLocalLocationState Hook

**Файл**: `src/hooks/useLocalLocationState.ts`

Управляет локальным состоянием всех режимов локации:
- Сохранение в localStorage
- Восстановление при монтировании
- Отдельные апдейтеры для каждого режима

**Методы**:
```typescript
{
  currentLocalState,           // Состояние активного режима
  localStates,                 // Все локальные состояния
  getLocalState,               // Получить состояние конкретного режима
  updateSearchState,           // Обновить search режим
  updateDrawState,             // Обновить draw режим
  updateIsochroneState,        // Обновить isochrone режим
  updateRadiusState,           // Обновить radius режим
  clearLocalState,             // Очистить конкретный режим
  clearAllLocalStates,         // Очистить все режимы
}
```

### LocationSearchMode

**Файл**: `src/components/features/search/location-details/LocationSearchMode.tsx`

Режим поиска локаций с двухслойной системой:

**Локальный слой**:
- `handleAddLocation` - добавляет в localStorage
- `handleRemoveLocation` - удаляет из localStorage
- `handleClear` - очищает localStorage для этого режима

**Применение**:
- `handleApply` - копирует из localStorage в store + синхронизирует границы на карте

### LocationFilter

**Файл**: `src/components/features/search/filters/LocationFilter.tsx`

Селектор режима локации:
- Сохраняет состояние при переключении режимов
- Восстанавливает состояние при возврате к режиму

## Типы

**Файл**: `src/types/filter.ts`

```typescript
// Локальное состояние для каждого режима
interface LocalSearchModeState {
  selectedLocations: LocationItem[];
}

interface LocalDrawModeState {
  polygon: DrawPolygon | null;
}

interface LocalIsochroneModeState {
  isochrone: IsochroneSettings | null;
}

interface LocalRadiusModeState {
  radius: RadiusSettings | null;
}

// Общий тип
interface LocalLocationStates {
  search: LocalSearchModeState;
  draw: LocalDrawModeState;
  isochrone: LocalIsochroneModeState;
  radius: LocalRadiusModeState;
}
```

## Пример работы

### 1. Пользователь выбирает локации
```typescript
handleAddLocation(mapboxLocation)
// ✅ Добавляет в localStorage
// ❌ НЕ добавляет в store
// ❌ НЕ влияет на поиск
```

### 2. Пользователь переключает режим
```typescript
setLocationMode('draw')
// ✅ Локальное состояние 'search' сохранено в localStorage
// ✅ При возврате к 'search' состояние восстановится
```

### 3. Пользователь применяет фильтр
```typescript
handleApply()
// ✅ Копирует из localStorage в store
// ✅ Синхронизирует границы на карте
// ✅ Теперь влияет на результаты поиска
```

### 4. Пользователь очищает фильтр
```typescript
handleClear()
// ✅ Очищает только localStorage для текущего режима
// ❌ НЕ влияет на store (применённые фильтры)
```

## Логирование

```typescript
console.log('LocationSearchMode mounted, local state:', count, 'locations')
console.log('Added location to local state:', name)
console.log('Removed location from local state:', name)
console.log('Cleared local search state')
console.log('Location filter applied:', count, 'locations')
console.log('Location filter mode selected:', mode)
```

## Преимущества

1. **Не засоряет store** - временные изменения не триггерят поиск
2. **Сохранение между режимами** - можно переключаться без потери данных
3. **Явное применение** - пользователь контролирует момент применения
4. **Откат изменений** - кнопка "Очистить" возвращает к исходному состоянию
5. **Персистентность** - состояние сохраняется между сессиями (localStorage)

## Будущие режимы

Аналогичная логика будет применена к:
- **Draw Mode** - рисование полигонов
- **Isochrone Mode** - зоны доступности по времени
- **Radius Mode** - радиус от точки
