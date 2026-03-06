# Инструкции для агента: realbro_frontend

**Сервис**: `/home/sergio/realbro/realbro_frontend`  
**Стек**: Next.js 16 (App Router), React 19, TypeScript, Zustand, next-intl, mapbox-gl, Tailwind CSS v4  
**Архитектура**: Feature-Sliced Design (FSD): `app/` → `screens/` → `widgets/` → `features/` → `entities/` → `shared/`

### Глобальные правила (из AGENT.md)
- **Цвета** только CSS-переменные: `bg-background`, `text-text-primary`, `brand-primary` и т.д. НИКОГДА `bg-white`, `bg-blue-500`
- **Текст** только через `next-intl`: `useTranslations()` (клиент), `getTranslations()` (сервер)
- **Комментарии** на русском, console.log на англ
- **Импорты**: React/Next → External libs → Internal → Types → Utils
- **Server Components first** — `'use client'` только при interactivity
- **Zustand** для UI state, `nuqs` для URL state

---

## Секция A: Фильтры

### A1. Расположение фильтров на ПК — фильтры справа, логотип слева

**Файлы**:
- `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx` (525 строк) — основная панель фильтров
- `src/screens/search-map-page/ui/ui.tsx` (222 строки) — экран карты, layout
- `src/widgets/search-filters-bar/ui/ui.tsx` — `SearchFiltersBar` координатор

**Что изменить**: 
В layout экрана карты (`search-map-page/ui/ui.tsx`) верхний бар с фильтрами расположен неправильно. Фильтры должны прижиматься к правому краю. Найти контейнер фильтров и добавить `ml-auto` или `justify-end` на родительский flex-контейнер. Логотип остаётся слева.

Ищи паттерн типа:
```tsx
<div className="flex items-center ...">
    <Logo /> {/* слева */}
    <SearchFiltersBar className="ml-auto" /> {/* справа */}
</div>
```

**Важно**: Не ломать мобильную версию. Проверить responsive поведение.

---

### A3. Получение категорий/субкатегорий по API + фильтры

**Файлы**:
- `src/shared/api/` — добавить новый файл `dictionaries.ts` для API вызовов
- `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx` — добавить селекторы
- `src/widgets/search-filters-bar/model/store.ts` (694 строки) — добавить в store

**Шаг 1**: Создать API-функции в `src/shared/api/dictionaries.ts`:
```typescript
import { apiClient } from './lib/api-client'

export interface Category {
    id: number
    name: string
    code: string
}

export interface Subcategory {
    id: number
    name: string
    code: string
    category_id: number
}

export async function getCategories(lang: string): Promise<Category[]> {
    return apiClient.get(`/dictionaries/categories`, { params: { lang } })
}

export async function getSubcategories(categoryId: number, lang?: string): Promise<Subcategory[]> {
    return apiClient.get(`/dictionaries/categories/${categoryId}/subcategories`, { params: { lang } })
}
```

**Шаг 2**: В store (`store.ts`) добавить поля `categoryIds: number[]` и `subcategoryIds: number[]` в `FilterState` и в `currentFilters`. Добавить actions `setCategoryIds`, `setSubcategoryIds`.

**Шаг 3**: В `filters-desktop-panel.tsx` добавить секции фильтров:
- `property_type = "rent"` — Select, заблокирован (disabled), значение по умолчанию
- `property_category` — Multi-select из API данных (categories)
- `property_subcategory` — Multi-select, зависит от выбранной категории

Использовать Radix UI Select/Checkbox компоненты (уже есть в проекте). Данные запрашивать через `useEffect` при маунте или через `useSWR`/`useQuery` если есть в проекте.

---

### A4. Debounce на фильтрах

**Файл**: `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx`

**Текущее состояние**: Панель уже использует debounce 500мс для `fetchResultsCount()` (строки ~130-155). Убедиться что этот же debounce применяется при отправке запросов на тайлы и short-listing.

**Что проверить**: При нажатии "Применить" (Apply) — фильтры устанавливаются в store через `setFilters()`. Если запросы на тайлы/listing идут реактивно через `useEffect` на `currentFilters` — debounce уже будет от панели. Если нет — добавить debounce на уровне store actions.

---

### A5. Сохранение данных мода локаций в localStorage

**Файл**: `src/features/location-search-mode/model/hooks/use-search-mode-state.ts` (65 строк)

**Текущий код**: Простой `useState<LocationItem[]>([])` без персистенции.

**Исправить**:
```typescript
const STORAGE_KEY_PREFIX = 'location-mode-data-'

function getStorageKey(mode: string): string {
    return `${STORAGE_KEY_PREFIX}${mode}`
}

function loadFromStorage(mode: string): LocationItem[] {
    if (typeof window === 'undefined') return []
    try {
        const data = localStorage.getItem(getStorageKey(mode))
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

function saveToStorage(mode: string, items: LocationItem[]): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(getStorageKey(mode), JSON.stringify(items))
    } catch {
        // storage full — ignore
    }
}

export function clearAllLocationStorage(): void {
    if (typeof window === 'undefined') return
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY_PREFIX))
    keys.forEach(k => localStorage.removeItem(k))
}
```

Хук `useSearchModeState` принимает `mode: string` параметр:
- Инициализировать state из `loadFromStorage(mode)`
- При каждом изменении (add/remove/toggle) — вызывать `saveToStorage(mode, newItems)`
- Экспортировать `clearAllLocationStorage()` — вызывается при закрытии мода локаций

**Где вызывать clearAll**: В `store.ts` в `resetFilters()` или в обработчике закрытия мода локаций.

---

### A6. Полигоны городов/районов исчезают после загрузки

**Файлы**:
- `src/features/location-search-mode/model/hooks/use-boundaries-hover.ts`
- Связанные хуки `useBoundariesLayer` (найти через grep `useBoundariesLayer`)

**Проблема**: При загрузке полигоны рендерятся, потом исчезают. Race condition: слои добавляются на карту, но при изменении `activeLocationMode` источник данных очищается.

**Как исправить**: 
1. Найти место где при смене `activeLocationMode` очищаются source данные для boundaries
2. Не очищать данные при переключении — только менять `visibility` слоя (`'visible'`/`'none'`)
3. Данные очищать только при полном закрытии мода локаций, а не при переключении между модами

Паттерн mapbox-gl для visibility:
```typescript
map.setLayoutProperty('boundaries-fill', 'visibility', isSearchMode ? 'visible' : 'none')
```

---

### A8. Восстановление всех полигонов (не только первого)

**Файл**: `src/widgets/search-filters-bar/model/store.ts`

**Текущий код** (~строка 180, `convertFiltersToLocationFilter`):
```typescript
const polygonId = 'polygon_' + filters.geometryIds[0]
```
Берёт только первый полигон.

**Исправить**: Итерировать по всем `geometryIds`:
```typescript
const polygons = (filters.geometryIds || []).map((id, index) => ({
    id: `polygon_${id}`,
    // ... остальные поля полигона
}))
```

Найти точный контекст использования и восстановить все полигоны. Возможно нужно подгружать геометрии с бекенда для каждого `geometryId` через `getGuestGeometry(id)` или `getFilterGeometry(filterId, id)`.

---

## Секция B: Карточки объекта

### B1. Отображение bedrooms/rooms

**Файлы**:
1. `src/entities/property/model/api-types.ts` (~строка 137) — добавить `bedrooms?: number` в `PropertyShortListingDTO`
2. `src/entities/property/model/card-types.ts` (~строка 70) — добавить `bedrooms?: number` в `PropertyGridCard`  
3. `src/entities/property/model/converters.ts` (~строка 16, `dtoToGridCard`) — добавить маппинг: `bedrooms: dto.bedrooms`
4. `src/entities/property/ui/property-card-grid/ui.tsx` (~строки 280-306) — рендерить по логике:

```tsx
{/* Комнаты и спальни */}
{property.rooms != null && property.rooms > 0 && (
    <>
        <span>{property.rooms}</span>
        <span className="text-muted-foreground text-xs">{t('roomsShort')}</span>
    </>
)}
{property.bedrooms != null && property.bedrooms > 0 && (
    <>
        {property.rooms != null && property.rooms > 0 && <span className="text-muted-foreground">·</span>}
        <span>{property.bedrooms}</span>
        <span className="text-muted-foreground text-xs">{t('bedroomsShort')}</span>
    </>
)}
```

Также добавить переводы: `bedroomsShort` в `messages/ru.json` (секция `property`), и во все остальные локали (en, es, fr, ca, de, it, pt, uk).

---

### B2.2. Transport lines: ref вместо name, лимит, стиль hover

**Файлы**:
1. `src/entities/property/model/converters.ts` (~строка 53):
   - Заменить `line.name` на `line.ref || line.name` при маппинге линий
   
2. `src/entities/property/ui/property-card-grid/ui.tsx` (~строки 322-378):
   - Рендерить `line.ref || line.name || 'M'` вместо `line.name || 'M'`
   - Лимит уже есть (MAX 3 видимых + `+N`), проверить что работает
   - **Стиль hover**: Найти tooltip/hover popup для станций. Убрать реверс цвета (светлый текст на тёмном фоне не меняется). Hover бекграунд в стиле приложения:
     - Использовать `bg-popover text-popover-foreground` для попапа
     - НЕ инвертировать цвета при hover
     - В тёмной теме — тёмный фон попапа (через CSS-переменные, auto)

---

### B3. Agency slug undefined (фронтенд часть)

**Файл**: `src/entities/property/ui/property-card-grid/ui.tsx` (~строка 215-235)

**Текущий код**:
```tsx
<Link href={`/agency/${property.author.slug || property.author.id}`} ...>
```

**Исправить**: Добавить проверку, не рендерить линк если нет ни slug ни id:
```tsx
{property.author?.slug || property.author?.id ? (
    <Link href={`/agency/${property.author.slug || property.author.id}`} ...>
        {/* avatar + timeAgo */}
    </Link>
) : (
    <div className="flex items-center gap-1.5">
        {/* avatar + timeAgo без ссылки */}
    </div>
)}
```

---

### B4. price_per_m2 не отображается — несовпадение имён полей

**Причина**: Бекенд возвращает JSON поле `price_per_m2`, фронтенд читает `price_per_meter`.

**Файлы**:
1. `src/entities/property/model/api-types.ts` (~строка 133):
   ```typescript
   // Было: price_per_meter?: number
   price_per_m2?: number  // Совпадает с бекенд JSON
   ```

2. `src/entities/property/model/card-types.ts`:
   ```typescript
   // Тоже обновить тип если используется
   price_per_m2?: number
   ```

3. `src/entities/property/model/converters.ts` (~строка 35):
   ```typescript
   // Было: price_per_meter: dto.price_per_meter
   price_per_m2: dto.price_per_m2
   ```

4. `src/entities/property/ui/property-card-grid/ui.tsx` (~строка 246):
   ```typescript
   // Было: property.price_per_meter?.toLocaleString('ru-RU')
   property.price_per_m2?.toLocaleString('ru-RU')
   ```

**Внимание**: Сделать grep по всему проекту на `price_per_meter` — может использоваться в других компонентах (PropertyCardHorizontal, детальная страница). Обновить все вхождения.

---

## Секция C: Список (Сайдбар)

### C1. Пагинация по скролу вместо кнопок

**Файл**: `src/screens/search-list-page/ui/ui.tsx` (~строка 230)

**Текущее**: Используется `<Pagination>` — компонент с кнопками prev/next/page numbers (`src/shared/ui/pagination/ui.tsx`, 89 строк).

**Заменить на IntersectionObserver**:
```tsx
// Удалить импорт и использование <Pagination>

// Добавить состояние
const [isLoadingMore, setIsLoadingMore] = useState(false)
const [cursor, setCursor] = useState<string | null>(null)
const [hasMore, setHasMore] = useState(true)
const sentinelRef = useRef<HTMLDivElement>(null)

// IntersectionObserver для sentinel элемента в конце списка
useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
                loadMore()
            }
        },
        { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
}, [hasMore, isLoadingMore, cursor])

// Функция подгрузки
async function loadMore() {
    if (!cursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
        const response = await getPropertiesList({ ...currentFilters, cursor })
        setProperties(prev => [...prev, ...response.data])
        setCursor(response.pagination?.next_cursor || null)
        setHasMore(response.pagination?.has_more ?? false)
    } finally {
        setIsLoadingMore(false)
    }
}

// В JSX: после grid с карточками
<div ref={sentinelRef} className="h-10" />
{isLoadingMore && <LoadingSpinner />}
```

Бекенд уже поддерживает cursor-based pagination (`next_cursor`, `has_more`). Начальные данные приходят через `initialData` props.

---

### C2. Каунт не отображается в сайдбаре

**Файлы**:
- `src/widgets/listing-controls/ui/ui.tsx` (~строка 67) — `tListing('subtitle', { count })`
- `src/widgets/map-sidebar/ui/ui.tsx` (~строка 316) — `tMapSidebar('objectsCount', { count: pagination.total })`

**Проверить**:
1. API возвращает `{ "data": { "count": 78 } }` — проверить как фронтенд парсит этот ответ
2. Найти функцию count в `src/shared/api/properties.ts` — проверить что возвращает `response.data.count`, а не `response.count`
3. Если `pagination.total` не заполняется — проверить маппинг в хуке/компоненте который вызывает count API

---

### C3. Точки на карте: цена для одиночных, кол-во для кластеров

**Файл**: `src/features/map/ui/search-map/ui.tsx` (~строки 79-125)

**Текущее**: Одиночные объекты показаны как синие круги (`circle` layer). Нужно: текст с ценой.

**Изменения**:
1. Заменить слой `properties-points` с типа `circle` на `symbol`:
```typescript
map.addLayer({
    id: 'properties-points',
    type: 'symbol',
    source: 'properties',
    'source-layer': 'properties',
    filter: ['!', ['has', 'point_count']],
    layout: {
        'text-field': ['concat', ['get', 'price_formatted'], '€'],
        'text-size': 12,
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-anchor': 'center',
        'text-allow-overlap': false,
    },
    paint: {
        'text-color': 'var(--text-primary)', // или конкретный цвет из стиля карты
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
    }
})
```

**Примечание**: Нужно проверить какие properties доступны в MVT тайлах (поле `price` или `price_formatted`). Если цена не включена в тайлы — нужно добавить на бекенде в `toMVTParams()`.

2. **Клик по одиночному объекту** — показать popup с карточкой:
```typescript
map.on('click', 'properties-points', (e) => {
    const feature = e.features?.[0]
    if (!feature) return
    const propertyId = feature.properties?.id
    onPropertyClick?.(propertyId) // callback наверх для показа popup
})
```

3. **Клик по кластеру** → передать IDs в сайдбар (уже частично реализовано через `property_ids` в feature properties).

---

### C4. Hover на карточку → подсветка на карте

**Файл**: `src/screens/search-map-page/ui/ui.tsx` (~строка 100-103)

**Текущий код**: 
```typescript
const handlePropertyHover = useCallback((property: PropertyGridCard | null) => {
    console.log('Property hover:', property?.id)
}, [])
```

**Реализовать**:
1. В `SearchMap` добавить prop `highlightedPropertyId: string | null`
2. В `SearchMapPage` — state:
```typescript
const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null)

const handlePropertyHover = useCallback((property: PropertyGridCard | null) => {
    setHoveredPropertyId(property?.id || null)
}, [])
```

3. В `SearchMap` — при изменении `highlightedPropertyId`:
```typescript
useEffect(() => {
    if (!map.current) return
    const sourceId = 'highlight-marker'
    
    if (!highlightedPropertyId) {
        // Убрать маркер
        if (map.current.getLayer('highlight-layer')) {
            map.current.setLayoutProperty('highlight-layer', 'visibility', 'none')
        }
        return
    }
    
    // Найти координаты из тайлов или из переданных данных
    // Добавить/обновить маркер-иконку (домик в круге) поверх всех слоёв
}, [highlightedPropertyId])
```

**Иконка**: Использовать SVG домик в круге. Загрузить как mapbox image:
```typescript
map.current.loadImage('/icons/house-marker.png', (error, image) => {
    if (image) map.current.addImage('house-marker', image)
})
```

**Координаты**: Нужно передавать `lat/lng` свойства из `PropertyGridCard` вместе с hover. Обновить `handlePropertyHover` чтобы передавал координаты.

---

### C5. Обновление сайдбара при движении карты

**Файл**: `src/features/map/ui/search-map/ui.tsx`

**Добавить**:
```typescript
// Props
interface SearchMapProps {
    // ... existing
    onBoundsChange?: (bbox: [number, number, number, number]) => void
}

// В useEffect после инициализации карты
map.current.on('moveend', () => {
    const bounds = map.current!.getBounds()
    onBoundsChange?.([
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth()
    ])
})
```

В `SearchMapPage` — использовать bbox для запроса:
```typescript
const [mapBbox, setMapBbox] = useState<[number, number, number, number] | null>(null)

// При изменении bbox — перезапрос short-listing с новым bbox
useEffect(() => {
    if (!mapBbox) return
    const timeoutId = setTimeout(() => {
        fetchProperties({ ...currentFilters, bbox: mapBbox.join(',') })
    }, 300) // debounce
    return () => clearTimeout(timeoutId)
}, [mapBbox])
```

---

### C6. Синхронизация с фильтрами

**Файлы**: 
- `src/widgets/search-filters-bar/model/store.ts` — `setFilters()` action
- `src/screens/search-map-page/ui/ui.tsx` — реакция на смену фильтров

**Что проверить/добавить**: При вызове `setFilters()` должны триггериться:
1. Обновление тайлов (`source.setTiles([newUrl])` — уже есть в `SearchMap`)
2. Перезапрос `short-listing` для сайдбара
3. Перезапрос `count` для каунтера

Если какой-то из запросов не происходит — добавить `useEffect` на `currentFilters` в соответствующем компоненте.

---

### C7. Компактные контролы в сайдбаре

**Файл**: `src/widgets/listing-controls/ui/ui.tsx` (131 строка)

**Текущее**: Sort Select + View buttons + "Show on map" — всё с текстом.

**Новый layout**:
```tsx
<div className="flex items-center justify-between px-3 py-2">
    {/* Слева — каунт */}
    <span className="text-sm text-muted-foreground">
        {count != null ? tListing('subtitle', { count }) : ''}
    </span>
    
    {/* Справа — 2 иконки */}
    <div className="flex items-center gap-1">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleViewMode}>
                    {listingViewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{/* перевод: Переключить вид */}</TooltipContent>
        </Tooltip>
        
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSort}>
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{/* перевод: Сортировка */}</TooltipContent>
        </Tooltip>
    </div>
</div>
```

Использовать Tooltip из Radix UI (уже есть в проекте). Добавить переводы для tooltip текстов.

---

### C8. Кнопка «Закрыть» для кластера

**Файл**: `src/widgets/map-sidebar/ui/ui.tsx` или `src/widgets/listing-controls/ui/ui.tsx`

Когда в сайдбаре отображается кластер (есть `clusterPropertyIds`):
```tsx
{isClusterView ? (
    <div className="flex items-center justify-between px-3 py-2">
        <span className="text-sm text-muted-foreground">
            {t('clusterObjects', { count: clusterPropertyIds.length })}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClusterReset}>
            <X className="h-4 w-4" />
        </Button>
    </div>
) : (
    <ListingControls ... />
)}
```

---

## Секция D: Ошибки консоли

### D1. NaN в children

**Файл**: `src/app/[locale]/search/properties/list/page.tsx` (~строка 55)

Проблема: `pagination?.total` может быть `undefined`, что создаёт NaN при передаче дальше.

**Исправить** в месте где `total` используется как число:
```typescript
const count = pagination?.total ?? 0
```

Проверить все компоненты которые получают `total` — добавить fallback.

---

### D2. Hydration mismatch — timeAgo

**Файл**: `src/entities/property/ui/property-card-grid/ui.tsx` (~строки 60-79)

**Текущее**: `useMemo` с `new Date()` — различается между SSR и клиентом.

**Исправить**: Рендерить timeAgo только на клиенте:
```tsx
const [timeAgo, setTimeAgo] = useState<string>('')

useEffect(() => {
    // Логика вычисления timeAgo (перенести из useMemo сюда)
    const dateStr = property.published_at || property.updated_at || property.created_at
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') {
        setTimeAgo('')
        return
    }
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    // ... rest of timeAgo calculation
    setTimeAgo(result)
}, [property.published_at, property.updated_at, property.created_at])
```

Или обернуть `<span>` с timeAgo в `suppressHydrationWarning`:
```tsx
<span suppressHydrationWarning className="text-[10px] text-text-secondary">
    {timeAgo}
</span>
```

Первый вариант (useEffect) предпочтительнее — чище и нет серверного рендера устаревшего значения.

---

### D3. Отсутствующие переводы `filters.show` и `filters.resultsFound`

**Файлы**: Все 9 файлов в `messages/` — `ru.json`, `en.json`, `es.json`, `fr.json`, `ca.json`, `de.json`, `it.json`, `pt.json`, `uk.json`

**Что добавить** в секцию `"filters"`:

```json
{
    "filters": {
        "show": "Показать",
        "resultsFound": "Найдено {count} объектов",
        // ... остальные существующие ключи
    }
}
```

**Для каждого языка**:
| Язык | `show` | `resultsFound` |
|------|--------|-----------------|
| ru | Показать | Найдено {count} объектов |
| en | Show | {count} results found |
| es | Mostrar | {count} resultados encontrados |
| fr | Afficher | {count} résultats trouvés |
| ca | Mostrar | {count} resultats trobats |
| de | Anzeigen | {count} Ergebnisse gefunden |
| it | Mostra | {count} risultati trovati |
| pt | Mostrar | {count} resultados encontrados |
| uk | Показати | Знайдено {count} об'єктів |

**Важно**: Вставить в правильное место внутри объекта `"filters"`, после существующих ключей. Не сломать JSON-синтаксис.

---

### D4. BaseMap error `{}`

**Файл**: `src/features/map/ui/base-map/ui.tsx` (~строка 100)

**Текущее**: 
```typescript
map.current.on('error', (e) => {
    console.error('[BaseMap] Map error:', e);
});
```

**Исправить**: Добавить детальное логирование и не логировать пустые ошибки:
```typescript
map.current.on('error', (e) => {
    if (e.error?.message || e.message) {
        console.error('[BaseMap] Map error:', e.error?.message || e.message, e);
    }
});
```

---

### D5. Двойная сериализация геометрии

**Файл**: `src/shared/api/geometries.ts` (~строка 170)

**Проверить** `createGeometry()`: если `data.geometry` уже строка — не делать `JSON.stringify`:
```typescript
const geometryString = typeof data.geometry === 'string' 
    ? data.geometry 
    : JSON.stringify(data.geometry)
```

---

## Порядок выполнения (приоритет)

1. **D3** — переводы (быстро, блокирует UI)
2. **B4** — price_per_m2 (быстро, видимый баг)
3. **D2** — hydration mismatch (быстро)
4. **D1** — NaN children (быстро)
5. **B1** — bedrooms
6. **B2.2** — transport ref вместо name
7. **B3** — agency slug fallback
8. **A5** — localStorage для мода локаций
9. **A8** — все полигоны
10. **D5** — двойная сериализация
11. **A6** — полигоны исчезают
12. **C7** — компактные контролы
13. **C8** — кнопка закрыть кластер
14. **C1** — infinite scroll
15. **C2** — каунт в сайдбаре
16. **C5** — обновление при движении карты
17. **C4** — hover подсветка
18. **C3** — цена на маркерах
19. **A1** — layout фильтров
20. **A3** — категории API
21. **C6** — синхронизация фильтров
22. **D4** — map error logging
23. **A4** — debounce
