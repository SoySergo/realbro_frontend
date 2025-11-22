# LocationDrawMode - Рисование области на карте

**Что делает**: Режим рисования произвольного полигона на карте для фильтрации недвижимости по пользовательской области.

**Ключевые особенности**:

### Функциональность
- **Рисование**: Активация режима рисования на карте (например, через Mapbox Draw)
- **Название**: Редактируемое поле для названия нарисованной области
- **Визуализация**: Отображение нарисованного полигона на карте
- **Удаление**: Возможность удалить нарисованную область
- **Локальное состояние**: Полигон сохраняется локально до применения фильтра

### Интеграция с картой
- **Активация рисования**: `onActivateDrawing()` - коллбэк для включения режима рисования на карте
- **Получение полигона**: `drawnPolygon` - передаётся с карты после завершения рисования
- **Удаление с карты**: `onDeletePolygon(polygonId)` - удаляет полигон с визуализации

### Двухслойная система
- **Локальный слой** (localStorage): временный полигон до применения
- **Глобальный слой** (store): применённый фильтр

### Пропсы
```typescript
type LocationDrawModeProps = {
    onActivateDrawing: () => void;
    onDeletePolygon?: (polygonId: string) => void;
    drawnPolygon?: DrawPolygon | null;
};
```

### Store state
- `locationFilter.polygon: DrawPolygon` - нарисованный полигон
- Локальное состояние: `{ polygon: DrawPolygon | null }`

### Типы
```typescript
interface DrawPolygon {
    id: string;
    coordinates: [number, number][][]; // GeoJSON Polygon
    color?: string;
    name?: string;
    createdAt: Date;
}
```

### Стили
Используются стили приложения:
- Кнопки: `bg-brand-primary hover:bg-brand-primary-hover text-white`
- Инпуты: `bg-background border-border text-text-primary`
- Кнопка удаления: `text-error hover:bg-error/10`
- Переходы: `transition-colors duration-150`

### UI состояния
1. **Без полигона**: кнопка "Начать рисование" + подсказка
2. **Рисование**: disabled кнопка с текстом "Рисование..."
3. **Полигон нарисован**: поле для названия + информация + кнопка удаления

### Локализация
Все тексты через `next-intl`:
- `drawAreaHint` - "Нарисуйте область на карте"
- `startDrawing` - "Начать рисование"
- `drawing` - "Рисование..."
- `polygonNamePlaceholder` - "Название области"
- `polygonDrawn` - "Область нарисована"
- `deletePolygon` - "Удалить область"

### Управление
Компонент использует `LocationModeActions` для:
- Очистить: удаляет полигон с карты и из локального состояния
- Сохранить: применяет фильтр в store, удаляет данные других режимов
- Выход (X): удаляет полигон, очищает localStorage, закрывает панель

**Файлы**:
- Компонент: `src/components/features/search/location-details/LocationDrawMode.tsx`
- Кнопки управления: `src/components/features/search/location-details/LocationModeActions.tsx`
- Store: `src/store/filterStore.ts`
- Типы: `src/types/filter.ts`
- Hook: `src/hooks/useLocalLocationState.ts`
