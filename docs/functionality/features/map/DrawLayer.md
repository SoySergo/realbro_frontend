# DrawLayer Component

## Обзор

`DrawLayer` - компонент для интерактивного рисования полигонов на карте с использованием библиотеки `@mapbox/mapbox-gl-draw`.

## Основные улучшения

### 1. **Исправленные баги**

#### Проблемы инициализации
- ✅ **Проблема**: Draw контрол мог инициализироваться до полной загрузки карты
- **Решение**: Добавлена проверка `map.loaded()` и обработчик события `load`
- **Результат**: Гарантированная инициализация после готовности карты

#### Утечки памяти
- ✅ **Проблема**: События не отписывались при размонтировании
- **Решение**: Корректная cleanup функция с отпиской от всех событий
- **Результат**: Отсутствие утечек памяти при переключении режимов

#### Дублирование полигонов
- ✅ **Проблема**: Полигоны могли дублироваться при повторной синхронизации
- **Решение**: Проверка существования полигона перед добавлением через `getAll()`
- **Результат**: Каждый полигон отображается ровно один раз

#### Конфликты режимов
- ✅ **Проблема**: Режим рисования мог не переключаться корректно
- **Решение**: Обертка в try-catch и логирование всех переключений
- **Результат**: Стабильные переключения между `draw_polygon` и `simple_select`

### 2. **Лучшие практики разработки**

#### Мемоизация обработчиков
```typescript
const handleCreate = useCallback((e) => {
    // Обработка создания полигона
}, [onPolygonDrawn]);
```
- Использование `useCallback` для предотвращения пересоздания функций
- Стабильные ссылки на обработчики событий

#### Валидация данных
```typescript
// Валидация типа геометрии
if (feature.geometry.type !== 'Polygon') {
    console.warn('[DRAW] Invalid geometry type');
    return;
}

// Валидация координат
if (!coordinates || coordinates.length === 0 || coordinates[0].length < 4) {
    console.warn('[DRAW] Invalid polygon coordinates');
    return;
}
```
- Проверка всех входящих данных перед обработкой
- Предотвращение ошибок при некорректных данных

#### Управление состоянием через refs
```typescript
const isInitializedRef = useRef(false);
const currentPolygonIdRef = useRef<string | null>(null);
```
- Использование refs для хранения служебной информации
- Избежание лишних ре-рендеров компонента

#### Comprehensive error handling
```typescript
try {
    map.addControl(draw, 'top-left');
    drawRef.current = draw;
} catch (error) {
    console.error('[DRAW] Failed to initialize:', error);
}
```
- Все операции с картой обернуты в try-catch
- Детальное логирование ошибок для отладки

### 3. **Улучшенные стили**

#### Inactive состояние
```typescript
{
    id: 'gl-draw-polygon-fill-inactive',
    paint: {
        'fill-color': '#198BFF',
        'fill-opacity': 0.15,
    },
}
```

#### Active состояние
```typescript
{
    id: 'gl-draw-polygon-fill-active',
    paint: {
        'fill-color': '#198BFF',
        'fill-opacity': 0.25,
    },
}
```

#### Вершины с улучшенной видимостью
```typescript
{
    id: 'gl-draw-polygon-and-line-vertex-active',
    paint: {
        'circle-radius': 6,
        'circle-color': '#FFFFFF',
        'circle-stroke-color': '#198BFF',
        'circle-stroke-width': 2,
    },
}
```

#### Midpoints для добавления вершин
```typescript
{
    id: 'gl-draw-polygon-midpoint',
    paint: {
        'circle-radius': 4,
        'circle-color': '#FFFFFF',
        'circle-stroke-color': '#198BFF',
        'circle-stroke-width': 1.5,
        'circle-opacity': 0.8,
    },
}
```

### 4. **Дополнительные обработчики событий**

#### Update события
```typescript
const handleUpdate = useCallback((e: { features: GeoJSON.Feature[] }) => {
    if (!e.features || e.features.length === 0) return;
    const feature = e.features[0];
    console.log('[DRAW] Polygon updated:', feature.id);
}, []);
```
- Отслеживание изменений существующих полигонов
- Возможность сохранения обновлений

#### Delete события
```typescript
const handleDelete = useCallback((e: { features: GeoJSON.Feature[] }) => {
    if (!e.features || e.features.length === 0) return;
    const feature = e.features[0];
    console.log('[DRAW] Polygon deleted:', feature.id);
    currentPolygonIdRef.current = null;
}, []);
```
- Корректная обработка удаления полигонов
- Очистка внутреннего состояния

## API

### Props

```typescript
interface DrawLayerProps {
    /** Инстанс Mapbox GL карты */
    map: mapboxgl.Map | null;
    
    /** Колбэк при завершении рисования полигона */
    onPolygonDrawn: (polygon: DrawPolygon) => void;
    
    /** Флаг активного режима рисования */
    isDrawing: boolean;
}
```

### DrawPolygon тип

```typescript
interface DrawPolygon {
    id: string;
    coordinates: [number, number][][]; // GeoJSON Polygon
    color?: string;
    name?: string;
    createdAt: Date;
}
```

## Использование

### Базовый пример

```tsx
import { DrawLayer } from '@/components/features/map/DrawLayer';

function MapComponent() {
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const handlePolygonDrawn = (polygon: DrawPolygon) => {
        console.log('Polygon created:', polygon);
        setIsDrawing(false);
        // Сохранить полигон в store
    };

    return (
        <>
            <MapboxMap onLoad={setMap} />
            <DrawLayer 
                map={map} 
                onPolygonDrawn={handlePolygonDrawn}
                isDrawing={isDrawing}
            />
            <button onClick={() => setIsDrawing(true)}>
                Start Drawing
            </button>
        </>
    );
}
```

### Интеграция с filterStore

```tsx
import { useFilterStore } from '@/store/filterStore';

function MapWithFilters() {
    const { locationFilter } = useFilterStore();
    
    // DrawLayer автоматически синхронизируется с locationFilter
    return (
        <DrawLayer 
            map={map} 
            onPolygonDrawn={handlePolygonDrawn}
            isDrawing={isDrawing}
        />
    );
}
```

## Жизненный цикл рисования

### 1. Активация режима рисования
```typescript
// Пользователь нажимает кнопку "Draw"
setIsDrawing(true);

// DrawLayer переключает режим
drawRef.current.changeMode('draw_polygon');
```

### 2. Процесс рисования
```typescript
// Пользователь кликает на карте для добавления вершин
// Mapbox Draw автоматически отрисовывает промежуточные состояния

// Можно:
// - Добавлять вершины кликами
// - Перемещать вершины перетаскиванием
// - Добавлять вершины между существующими (midpoints)
// - Завершить полигон двойным кликом или кликом на первую вершину
```

### 3. Создание полигона
```typescript
// При завершении рисования срабатывает событие 'draw.create'
map.on('draw.create', (e) => {
    const feature = e.features[0];
    
    // Валидация
    if (feature.geometry.type !== 'Polygon') return;
    
    // Создание DrawPolygon объекта
    const polygon: DrawPolygon = {
        id: feature.id as string,
        coordinates: feature.geometry.coordinates,
        color: '#198BFF',
        name: '',
        createdAt: new Date(),
    };
    
    // Вызов колбэка
    onPolygonDrawn(polygon);
});
```

### 4. Сохранение в store
```typescript
// В родительском компоненте
const handlePolygonDrawn = (polygon: DrawPolygon) => {
    // Сохранить в filterStore
    const savedPolygon = addPolygon(polygon);
    
    // Установить как активный фильтр
    setLocationFilter({
        mode: 'draw',
        polygon: savedPolygon,
    });
    
    // Деактивировать режим рисования
    setIsDrawing(false);
};
```

## Обработка ошибок

### Сценарии ошибок

1. **Карта не загружена**
   ```typescript
   if (!map.loaded()) {
       console.log('[DRAW] Waiting for map to load...');
       // Ожидание события 'load'
   }
   ```

2. **Некорректная геометрия**
   ```typescript
   if (coordinates[0].length < 4) {
       console.warn('[DRAW] Invalid polygon coordinates');
       return;
   }
   ```

3. **Ошибка инициализации**
   ```typescript
   try {
       map.addControl(draw);
   } catch (error) {
       console.error('[DRAW] Failed to initialize:', error);
       isInitializedRef.current = false;
   }
   ```

## Логирование

Компонент использует префикс `[DRAW]` для всех логов:

- `[DRAW] Initializing MapboxDraw...` - начало инициализации
- `[DRAW] MapboxDraw initialized successfully` - успешная инициализация
- `[DRAW] Drawing mode activated` - активация режима рисования
- `[DRAW] Polygon created: {id}` - создание полигона
- `[DRAW] Polygon updated: {id}` - обновление полигона
- `[DRAW] Polygon deleted: {id}` - удаление полигона
- `[DRAW] Loaded polygon from filter: {id}` - загрузка из фильтра
- `[DRAW] Cleared polygons (mode changed)` - очистка при смене режима
- `[DRAW] MapboxDraw cleaned up` - очистка при размонтировании

## Performance оптимизации

### 1. Мемоизация колбэков
- Все обработчики событий мемоизированы через `useCallback`
- Предотвращение переподписки на события

### 2. Refs вместо state
- Служебная информация хранится в refs
- Избежание лишних ре-рендеров

### 3. Условная инициализация
- Инициализация только при наличии карты
- Проверка загруженности карты

### 4. Efficient cleanup
- Корректная отписка от всех событий
- Удаление контролов при размонтировании

## Интеграция с другими компонентами

### PropertyMap
```tsx
<DrawLayer
    map={map}
    onPolygonDrawn={handlePolygonDrawn}
    isDrawing={isDrawing}
/>
```

### LocationDetailsBar
```typescript
// Активация через window.mapCallbacks
window.mapCallbacks?.activateDrawing();

// Обработка результата
window.mapCallbacks?.getDrawnPolygon();
```

### filterStore
```typescript
// Автоматическая синхронизация через locationFilter
const { locationFilter } = useFilterStore();

// DrawLayer отображает polygon из locationFilter.polygon
```

## Тестирование

### Unit тесты (рекомендации)

1. **Инициализация**
   - Проверка создания Draw контрола
   - Проверка ожидания загрузки карты
   - Проверка добавления на карту

2. **События**
   - Мок событий draw.create, draw.update, draw.delete
   - Проверка вызова колбэков
   - Проверка валидации данных

3. **Режимы**
   - Проверка переключения режимов
   - Проверка активации рисования
   - Проверка деактивации

4. **Синхронизация**
   - Проверка загрузки из locationFilter
   - Проверка очистки при смене режима
   - Проверка предотвращения дубликатов

5. **Cleanup**
   - Проверка отписки от событий
   - Проверка удаления контрола
   - Проверка сброса refs

### Integration тесты (рекомендации)

1. **Полный цикл рисования**
   - Активация режима
   - Создание полигона
   - Сохранение в store
   - Отображение на карте

2. **Переключение режимов**
   - Draw → Search
   - Draw → Isochrone
   - Draw → Radius

3. **Множественные полигоны**
   - Создание нескольких полигонов
   - Переключение между полигонами
   - Удаление полигонов

## Будущие улучшения

### Планируемые функции

1. **Редактирование полигонов**
   - Сохранение изменений через handleUpdate
   - UI для редактирования вершин
   - История изменений (undo/redo)

2. **Стили полигонов**
   - Выбор цвета полигона
   - Прозрачность заливки
   - Толщина обводки

3. **Валидация полигонов**
   - Минимальная площадь
   - Максимальное количество вершин
   - Проверка самопересечений

4. **Экспорт/импорт**
   - Экспорт в GeoJSON
   - Импорт из GeoJSON
   - Сохранение в файл

5. **Снэппинг**
   - Привязка к существующим полигонам
   - Привязка к границам административных единиц
   - Привязка к сетке

## Связанные компоненты

- `PropertyMap` - основной компонент карты
- `LocationDetailsBar` - панель управления фильтрами локации
- `BoundariesLayer` - отображение административных границ
- `IsochroneLayer` - отображение изохронов
- `RadiusLayer` - отображение радиусов

## Зависимости

- `mapbox-gl` - библиотека карт Mapbox
- `@mapbox/mapbox-gl-draw` - библиотека для рисования
- `@/store/filterStore` - Zustand store для фильтров
- `@/types/filter` - типы фильтров

## Changelog

### v2.0.0 (текущая версия)
- ✅ Исправлены все баги инициализации
- ✅ Добавлена валидация данных
- ✅ Улучшены стили полигонов
- ✅ Добавлены обработчики update и delete
- ✅ Мемоизация всех колбэков
- ✅ Comprehensive error handling
- ✅ Улучшенное логирование
- ✅ Предотвращение дубликатов
- ✅ Корректная cleanup функция

### v1.0.0 (предыдущая версия)
- Базовая функциональность рисования
- Интеграция с filterStore
- Базовые стили
