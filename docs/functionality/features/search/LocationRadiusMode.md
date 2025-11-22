# LocationRadiusMode - Радиус от точки

**Что делает**: Режим построения круга заданного радиуса от выбранной точки на карте для фильтрации недвижимости.

**Ключевые особенности**:

### Функциональность
- **Выбор радиуса**: Кнопки для выбора радиуса (1, 3, 5, 10, 15, 20 км)
- **Выбор точки**: Клик на карте для выбора центра круга
- **Визуализация**: Отображение круга на карте
- **Динамическое изменение**: Изменение радиуса обновляет круг на карте в реальном времени
- **Локальное состояние**: Настройки сохраняются локально до применения

### Интеграция с картой
- **Выбор точки**: `onSelectPoint()` - активирует режим выбора на карте
- **Получение координат**: `selectedCoordinates` - передаются с карты после клика
- **Отображение**: `onShowRadius(center, radiusKm)` - рисует круг на карте
- **Удаление**: `onClearRadius()` - убирает круг с карты

### Двухслойная система
- **Локальный слой** (localStorage): временные настройки радиуса
- **Глобальный слой** (store): применённый фильтр

### Пропсы
```typescript
type LocationRadiusModeProps = {
    onSelectPoint: () => void;
    onShowRadius?: (center: [number, number], radiusKm: number) => void;
    onClearRadius?: () => void;
    selectedCoordinates?: [number, number] | null;
};
```

### Store state
- `locationFilter.radius: RadiusSettings` - настройки радиуса
- Локальное состояние: `{ radius: RadiusSettings | null }`

### Типы
```typescript
interface RadiusSettings {
    center: [number, number]; // [lng, lat]
    radiusKm: number;
}
```

### Стили
Используются стили приложения:
- Активная кнопка: `bg-brand-primary hover:bg-brand-primary-hover text-white`
- Неактивная: `bg-background text-text-secondary border-border`
- Ховер (светлая тема): `hover:bg-background-secondary hover:text-text-primary`
- Ховер (тёмная тема): `dark:hover:bg-background-tertiary dark:hover:text-text-primary`
- Кнопка удаления: `text-error hover:bg-error/10`

### UI состояния
1. **Выбор радиуса**: кнопки радиусов + подсказка + кнопка "Выбрать точку"
2. **Радиус создан**: информация + кнопки изменения радиуса + кнопка "Удалить"

### Локализация
Все тексты через `next-intl`:
- `locationRadius` - "Радиус от точки"
- `selectPointOnMap` - "Выберите точку на карте"
- `selectPoint` - "Выбрать точку"
- `radiusReady` - "Радиус {radius} км"
- `delete` - "Удалить"

### Управление
Компонент использует `LocationModeActions` для:
- Очистить: удаляет круг с карты и из локального состояния
- Сохранить: применяет фильтр в store, удаляет данные других режимов
- Выход (X): удаляет круг, очищает localStorage, закрывает панель

### Реализация на карте
Для отрисовки круга на карте можно использовать:

#### Вариант 1: Turf.js (рекомендуется)
```typescript
import * as turf from '@turf/turf';

const center = turf.point([lng, lat]);
const radius = radiusKm;
const options = { steps: 64, units: 'kilometers' as const };
const circle = turf.circle(center, radius, options);
```

#### Вариант 2: Нативный Mapbox
```typescript
// Добавление source
map.addSource('radius-circle', {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        }
    }
});

// Добавление layer с paint-circle-radius
map.addLayer({
    id: 'radius-circle',
    type: 'circle',
    source: 'radius-circle',
    paint: {
        'circle-radius': radiusKm * metersPerPixel, // конвертация в пиксели
        'circle-color': '#198BFF',
        'circle-opacity': 0.2,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#198BFF'
    }
});
```

### Лучшие практики
- **Реактивность**: Изменение радиуса мгновенно обновляет визуализацию
- **Цвета**: Использовать `brand-primary` для круга
- **Центральный маркер**: Добавить маркер в центре для наглядности
- **Ограничения**: Максимальный радиус 20 км (можно расширить при необходимости)

**Файлы**:
- Компонент: `src/components/features/search/location-details/LocationRadiusMode.tsx`
- Кнопки управления: `src/components/features/search/location-details/LocationModeActions.tsx`
- Store: `src/store/filterStore.ts`
- Типы: `src/types/filter.ts`
- Hook: `src/hooks/useLocalLocationState.ts`
