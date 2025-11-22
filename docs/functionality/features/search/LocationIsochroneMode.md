# LocationIsochroneMode - Изохрон (время в пути)

**Что делает**: Режим построения изохрона - области доступности от точки за определённое время, используя Mapbox Isochrone API.

**Ключевые особенности**:

### Функциональность
- **Профили**: Выбор способа передвижения (пешком/велосипед/машина)
- **Время**: Выбор времени в минутах (5, 10, 15, 30, 45, 60)
- **Выбор точки**: Клик на карте для выбора центра изохрона
- **Расчёт через API**: Автоматический запрос к Mapbox Isochrone API
- **Визуализация**: Отображение полигона изохрона на карте с цветом профиля
- **Пересчёт**: Возможность пересчитать изохрон с новыми параметрами

### Интеграция с Mapbox API
Использует `getIsochrone()` из `src/services/mapbox-isochrone.ts`:
```typescript
GET https://api.mapbox.com/isochrone/v1/mapbox/{profile}/{lng},{lat}
  ?access_token={token}
  &contours_minutes={minutes}
  &polygons=true
  &denoise=1
```

### Профили и цвета
- `walking` - Пешком (зелёный #28A745)
- `cycling` - Велосипед (жёлтый #FFC107)
- `driving` - Машина (синий #198BFF)

### Интеграция с картой
- **Выбор точки**: `onSelectPoint()` - активирует режим выбора на карте
- **Получение координат**: `selectedCoordinates` - передаются с карты
- **Отображение**: `onShowIsochrone(polygon, color)` - рисует изохрон
- **Удаление**: `onClearIsochrone()` - убирает изохрон с карты

### Двухслойная система
- **Локальный слой** (localStorage): временные настройки изохрона
- **Глобальный слой** (store): применённый фильтр

### Пропсы
```typescript
type LocationIsochroneModeProps = {
    onSelectPoint: () => void;
    onShowIsochrone?: (polygon: number[][][], color: string) => void;
    onClearIsochrone?: () => void;
    selectedCoordinates?: [number, number] | null;
};
```

### Store state
- `locationFilter.isochrone: IsochroneSettings` - настройки изохрона
- Локальное состояние: `{ isochrone: IsochroneSettings | null }`

### Типы
```typescript
interface IsochroneSettings {
    center: [number, number]; // [lng, lat]
    profile: 'walking' | 'cycling' | 'driving';
    minutes: number; // 5, 10, 15, 30, 45, 60
}
```

### Стили
Используются стили приложения:
- Активная кнопка: `bg-brand-primary hover:bg-brand-primary-hover text-white`
- Неактивная: `bg-background text-text-secondary border-border`
- Ховер (тёмная тема): `dark:hover:bg-background-tertiary`
- Лоадер: `Loader2` с `animate-spin`
- Статус успеха: `text-success`

### UI состояния
1. **Выбор настроек**: кнопки профиля и времени + кнопка "Выбрать точку"
2. **Вычисление**: лоадер + disabled кнопки
3. **Готово**: информация + кнопка "Пересчитать" + кнопка "Удалить"

### Локализация
Все тексты через `next-intl`:
- `locationTimeFrom` - "Время до точки"
- `walking/cycling/driving` - названия профилей
- `selectPointOnMap` - "Выберите точку на карте"
- `selectPoint` - "Выбрать точку"
- `calculating` - "Вычисление..."
- `isochroneReady` - "{profile} {minutes} мин"
- `recalculate` - "Пересчитать"
- `delete` - "Удалить"

### Управление
Компонент использует `LocationModeActions` для:
- Очистить: удаляет изохрон с карты и из локального состояния
- Сохранить: применяет фильтр в store (disabled пока идёт расчёт)
- Выход (X): удаляет изохрон, очищает localStorage, закрывает панель

### Лучшие практики
- **Debounce**: автоматический расчёт только при выборе координат (не при каждом изменении настроек)
- **Кэширование**: можно добавить кэш результатов для одинаковых запросов
- **Обработка ошибок**: логирование ошибок API, fallback на пустой результат
- **Сглаживание**: параметр `denoise=1` для улучшения визуализации полигонов

**Файлы**:
- Компонент: `src/components/features/search/location-details/LocationIsochroneMode.tsx`
- Сервис API: `src/services/mapbox-isochrone.ts`
- Кнопки управления: `src/components/features/search/location-details/LocationModeActions.tsx`
- Store: `src/store/filterStore.ts`
- Типы: `src/types/filter.ts`
- Hook: `src/hooks/useLocalLocationState.ts`
