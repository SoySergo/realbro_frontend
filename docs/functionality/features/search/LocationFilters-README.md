# Двухслойная система фильтров локации - Краткая справка

## Проблема
Раньше при выборе локации она сразу применялась в глобальный фильтр и запускала поиск. Это:
- Засоряло историю фильтров
- Не давало пользователю "поиграть" с настройками до применения
- Теряло изменения при переключении между режимами

## Решение
Два независимых слоя состояния:

```
┌─────────────────────────────────┐
│   Локальный слой (localStorage)  │ ← Временные изменения
│   - Выбор локаций               │
│   - Рисование полигонов         │
│   - Настройка изохрона          │
│   - Настройка радиуса           │
└─────────────────────────────────┘
           ↓ (Кнопка "Применить")
┌─────────────────────────────────┐
│  Глобальный слой (filterStore)  │ ← Применённые фильтры
│   - Влияет на результаты        │
│   - Отправляется на бекенд      │
│   - Синхронизируется с картой   │
└─────────────────────────────────┘
```

## Быстрый старт

### 1. Используйте хук в режиме
```typescript
import { useLocalLocationState } from '@/hooks/useLocalLocationState';

const {
    currentLocalState,      // Текущее состояние режима
    updateSearchState,      // Для search режима
    clearLocalState,        // Очистка локального слоя
} = useLocalLocationState(activeLocationMode);
```

### 2. Работайте с локальным состоянием
```typescript
// При изменении данных
const handleChange = (newData) => {
    updateSearchState({ selectedLocations: newData });
    // НЕ вызывается setLocationFilter!
};
```

### 3. Применение по кнопке
```typescript
const handleApply = () => {
    // Копируем в store
    setLocationFilter({
        mode: 'search',
        selectedLocations: localData,
    });
    
    // Синхронизируем с картой
    syncWithMap(localData);
};
```

### 4. Очистка
```typescript
const handleClear = () => {
    clearLocalState('search');     // Локальный слой
    setLocationFilter(null);       // Глобальный слой
    clearMapBoundaries();          // Карта
};
```

## Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `hooks/useLocalLocationState.ts` | Хук для управления локальным состоянием |
| `types/filter.ts` | Типы локальных состояний всех режимов |
| `components/.../LocationSearchMode.tsx` | Пример использования (search режим) |
| `docs/.../LocationFilters-TwoLayer.md` | Подробная документация |
| `docs/.../LocationFilters-Template.md` | Шаблон для новых режимов |

## Проверочный список для нового режима

- [ ] Добавить тип `LocalYourModeState` в `types/filter.ts`
- [ ] Добавить в `LocalLocationStates` интерфейс
- [ ] Добавить начальное состояние в `INITIAL_STATES`
- [ ] Создать апдейтер `updateYourModeState` в хуке
- [ ] Использовать хук в компоненте режима
- [ ] Реализовать `handleChange` через апдейтер
- [ ] Реализовать `handleApply` с копированием в store
- [ ] Реализовать `handleClear` с очисткой обоих слоёв
- [ ] Добавить UI кнопок "Очистить" и "Применить"
- [ ] Протестировать переключение между режимами

## Логика работы

### Выбор локации
```
Пользователь выбирает город → updateSearchState() 
→ Сохраняется в localStorage → UI обновляется 
→ Store НЕ меняется → Поиск НЕ запускается
```

### Применение
```
Кнопка "Применить" → setLocationFilter() 
→ Store обновляется → API запрос с новыми фильтрами 
→ Карта синхронизируется
```

### Переключение режима
```
Режим Search → Draw → localStorage сохранён 
→ Draw → Search → localStorage восстановлен 
→ Все выбранные локации на месте!
```

### Очистка
```
Кнопка "Очистить" → clearLocalState() 
→ localStorage очищен → setLocationFilter(null) 
→ Store очищен → Границы на карте удалены
```

## Преимущества

✅ Не засоряет store временными изменениями  
✅ Сохраняет состояние между режимами  
✅ Даёт контроль момента применения  
✅ Позволяет откатить изменения  
✅ Персистентность через localStorage  

## Смотри также

- [Полная документация](LocationFilters-TwoLayer.md)
- [Шаблон для новых режимов](LocationFilters-Template.md)
- [LocationSearchMode - пример](LocationSearchMode.md)
