# Plan: realbro_frontend — Bug Fixes (11.03)

> **Сервис**: `realbro_frontend`  
> **Стек**: Next.js 16, React 19, TypeScript, Zustand, next-intl, Mapbox GL, Tailwind CSS v4  
> **Архитектура**: FSD (`app/ → screens/ → widgets/ → features/ → entities/ → shared/`)  
> **Итерация**: 4  

---

## TL;DR

23 задачи. Критичные: несовпадение поля `price_per_m2`/`price_per_meter`, потеря данных локаций при смене мода (нет localStorage), восстановление только 1 полигона, hydration mismatch timeAgo, отсутствующие переводы. Остальные — UX улучшения карты и сайдбара.

---

## Порядок выполнения (приоритет)

| # | Задача | Приоритет |
|---|--------|-----------|
| 1 | D3 — отсутствующие переводы | 🔴 Блокер |
| 2 | B4 — `price_per_m2` не отображается | 🔴 Видимый баг |
| 3 | D2 — hydration mismatch timeAgo | 🟠 Высокий |
| 4 | D1 — NaN в children | 🟠 Высокий |
| 5 | B1 — bedrooms/rooms в карточках | 🟠 Высокий |
| 6 | B2.2 — transport ref вместо name | 🟠 Высокий |
| 7 | B3 — agency slug fallback | 🟠 Высокий |
| 8 | A5 — localStorage для мода локаций | 🟠 Высокий |
| 9 | A8 — восстановление всех полигонов | 🟠 Высокий |
| 10 | D5 — двойная сериализация геометрии | 🟡 Средний |
| 11 | A6 — полигоны исчезают после загрузки | 🟡 Средний |
| 12 | C7 — компактные контролы в сайдбаре | 🟡 Средний |
| 13 | C8 — кнопка «Закрыть» для кластера | 🟡 Средний |
| 14 | C1 — infinite scroll вместо пагинации | 🟡 Средний |
| 15 | C2 — каунт не отображается в сайдбаре | 🟡 Средний |
| 16 | C5 — обновление сайдбара при движении карты | 🟡 Средний |
| 17 | C4 — hover подсветка объекта на карте | 🟡 Средний |
| 18 | C3 — цена на маркерах карты | 🟡 Средний |
| 19 | A1 — layout фильтров на ПК | 🟢 Низкий |
| 20 | A3 — категории/субкатегории из API | 🟢 Низкий |
| 21 | C6 — синхронизация фильтров | 🟢 Низкий |
| 22 | D4 — логирование BaseMap error | 🟢 Низкий |
| 23 | A4 — debounce на фильтрах | 🟢 Низкий |

---

## Секция A: Фильтры

### A1. Расположение фильтров на ПК

**Файл**: `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx`  
Возможно затрагивает `src/screens/search-map-page/ui/ui.tsx`.

Изменить layout верхнего бара: фильтры прижать к правому краю (`ml-auto` / `justify-end`), логотип слева.  
Паттерн:
```tsx
<div className="flex items-center ...">
    <Logo />
    <SearchFiltersBar className="ml-auto" />
</div>
```
**Важно**: не ломать мобильную версию.

---

### A3. Получение категорий/субкатегорий из API

**Файлы**:
- Создать `src/shared/api/dictionaries.ts`:
```typescript
export async function getCategories(lang: string): Promise<Category[]>
export async function getSubcategories(categoryId: number, lang?: string): Promise<Subcategory[]>
```
- `src/widgets/search-filters-bar/model/store.ts` — добавить `categoryIds: number[]`, `subcategoryIds: number[]`, actions `setCategoryIds`, `setSubcategoryIds`
- `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx` — добавить:
  - `property_type = "rent"` (disabled)
  - `property_category` — multi-select из API
  - `property_subcategory` — зависит от выбранной категории

---

### A4. Debounce на фильтрах

**Файл**: `src/widgets/search-filters-bar/model/store.ts`

Добавить debounce 300–500 мс при изменении полей фильтра перед отправкой запросов на `short-listing` и тайлы.  
Панель уже использует `debounce 500мс` для `fetchResultsCount()` (~строки 130–155) — убедиться что тот же debounce применяется при отправке тайл-запросов.

---

### A5. Сохранение данных мода локаций в localStorage

**Файл**: `src/features/location-search-mode/model/hooks/use-search-mode-state.ts`

**Текущее**: `useState<LocationItem[]>([])` — нет персистенции.

**Реализовать**:
- При изменении данных в каждом моде → записывать в `localStorage` (ключ `location-mode-{modeName}`)
- При переключении мода → восстанавливать из `localStorage`
- При закрытии мода локаций → очищать все ключи `location-mode-*`

---

### A6. Полигоны городов/районов исчезают после загрузки

**Файлы**: `src/features/location-search-mode/model/hooks/use-boundaries-hover.ts` и связанные хуки `useBoundariesLayer`.

**Проблема**: Race condition — слои добавляются, но при смене `activeLocationMode` источник данных очищается или видимость переключается.

**Исправление**: Слой должен быть видим только когда поиск активен, но данные не очищать при переключении мода. Добавить проверку что `visibility: 'visible'` остаётся при активном поиске.

---

### A8. Восстановление только 1 полигона при переоткрытии

**Файл**: `src/widgets/search-filters-bar/model/store.ts` ~строка 180

**Проблема**: `convertFiltersToLocationFilter()` использует `filters.geometryIds[0]` — берёт только первый.

**Исправление**: Итерировать по всем `filters.geometryIds` и восстанавливать все полигоны.

---

## Секция B: Карточки объекта

### B1. Отображение bedrooms/rooms

Бекенд возвращает `bedrooms` в `PaginatedShortListResponse`, фронтенд не читает это поле.

**Файлы**:
1. `src/entities/property/model/api-types.ts` — добавить `bedrooms?: number` в `PropertyShortListingDTO`
2. `src/entities/property/model/card-types.ts` — добавить `bedrooms?: number` в `PropertyGridCard`
3. `src/entities/property/model/converters.ts` — маппить `dto.bedrooms`
4. `src/entities/property/ui/property-card-grid/ui.tsx` ~строка 278 — рендерить оба значения если присутствуют: «N комнат · M спален»

---

### B2.2. Лимитирование станций + стиль hover + ref вместо name

**Файлы**:
1. `src/entities/property/model/converters.ts` строка 53 — заменить `line.name` на `line.ref || line.name` при маппинге
2. `src/entities/property/ui/property-card-grid/ui.tsx`:
   - Строка 345: рендерить `line.ref || line.name || 'M'`
   - Добавить `MAX_VISIBLE_LINES = 3` лимит
   - **Hover стиль**: убрать реверс цвета, использовать `bg-popover text-popover-foreground` для попапа. В тёмной теме — тёмный фон (через CSS-переменные, auto, **никаких** хардкодных цветов)

---

### B3. Agency slug undefined

**Файл**: `src/entities/property/ui/property-card-grid/ui.tsx` ~строка 215–235

Добавить проверку — не рендерить ссылку если нет ни slug ни id:
```tsx
{property.author?.slug || property.author?.id ? (
    <Link href={`/agency/${property.author.slug || property.author.id}`} ...>
        ...
    </Link>
) : (
    <div className="flex items-center gap-1.5">
        ...
    </div>
)}
```

---

### B4. `price_per_m2` не отображается

**Причина**: бекенд возвращает `price_per_m2`, фронтенд читает `price_per_meter`.

**Файлы** (сделать grep по `price_per_meter` — могут быть и другие вхождения):
1. `src/entities/property/model/api-types.ts` строка 133 — переименовать `price_per_meter` → `price_per_m2`
2. `src/entities/property/model/card-types.ts` — обновить тип
3. `src/entities/property/model/converters.ts` строка 35 — обновить маппинг
4. `src/entities/property/ui/property-card-grid/ui.tsx` строка 246 — обновить обращение к полю
5. Проверить `PropertyCardHorizontal`, детальную страницу — обновить все вхождения

---

## Секция C: Список (Сайдбар)

### C1. Пагинация по скролу (infinite scroll)

**Файл**: `src/screens/search-list-page/ui/ui.tsx` ~строка 230

Заменить `<Pagination>` на `IntersectionObserver`:
```tsx
const sentinelRef = useRef<HTMLDivElement>(null)

useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !isLoadingMore && hasMore) loadMore()
        },
        { threshold: 0.1 }
    )
    if (sentinelRef.current) observer.observe(sentinelRef.current)
    return () => observer.disconnect()
}, [hasMore, isLoadingMore])

// В JSX после грида:
<div ref={sentinelRef} className="h-10" />
{isLoadingMore && <LoadingSpinner />}
```

Бекенд уже поддерживает cursor-based pagination (`next_cursor`, `has_more`). Использовать подход аналогично `src/widgets/map-sidebar/ui/ui.tsx` ~строка 350.

---

### C2. Каунт не отображается в сайдбаре

**Файлы**: `src/widgets/listing-controls/ui/ui.tsx`, `src/widgets/map-sidebar/ui/ui.tsx` ~строка 307.

Бекенд корректно возвращает `{ "data": { "count": 78 } }`.  
Проверить: возможно фронтенд читает `response.count` вместо `response.data.count`. Найти функцию count в `src/shared/api/properties.ts` и исправить путь к данным.

---

### C3. Точки на карте: цена для одиночных, кол-во для кластеров

**Файл**: `src/features/map/ui/search-map/ui.tsx` ~строки 79–125

1. Заменить слой `properties-points` с типа `circle` на `symbol` с ценой:
```typescript
map.addLayer({
    id: 'properties-points',
    type: 'symbol',
    source: 'properties',
    filter: ['!', ['has', 'point_count']],
    layout: {
        'text-field': ['concat', ['get', 'price_formatted'], '€'],
        'text-size': 12,
        'text-anchor': 'center',
    },
    paint: {
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
    }
})
```
> Проверить что поле `price` / `price_formatted` присутствует в MVT тайлах.

2. Клик по одиночному объекту → popup с карточкой (`onPropertyClick?.(propertyId)`)
3. Клик по кластеру → передать IDs в сайдбар + кнопка «Закрыть» (см. C8)

---

### C4. Hover на карточку → подсветка на карте

**Файл**: `src/screens/search-map-page/ui/ui.tsx` ~строка 100–103

**Текущее**: `handlePropertyHover` только `console.log`.

**Реализовать**:
1. Добавить `highlightedPropertyId: string | null` в `SearchMap` props
2. В `SearchMapPage` — state `hoveredPropertyId`, передавать в `SearchMap`
3. В `SearchMap` при изменении `highlightedPropertyId` — добавлять/убирать маркер-иконку (домик в круге) поверх всех слоёв
4. Иконку загрузить как Mapbox image: `map.loadImage('/icons/house-marker.png', ...)`

---

### C5. Обновление сайдбара при движении карты

**Файл**: `src/features/map/ui/search-map/ui.tsx`

Добавить `onBoundsChange` prop и обработчик `moveend`:
```typescript
map.current.on('moveend', () => {
    const bounds = map.current!.getBounds()
    onBoundsChange?.([bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()])
})
```

В `SearchMapPage` — при изменении `mapBbox` делать запрос `short-listing` с debounce 300 мс.

---

### C6. Синхронизация с фильтрами

При вызове `setFilters()` должны триггериться все три запроса:
1. Обновление тайлов (`source.setTiles([newUrl])`)
2. Перезапрос `short-listing` для сайдбара
3. Перезапрос `count` для каунтера

Проверить `useEffect` на `currentFilters` в соответствующих компонентах.

---

### C7. Компактные контролы в сайдбаре

**Файл**: `src/widgets/listing-controls/ui/ui.tsx` (131 строк)

Новый layout:
```tsx
<div className="flex items-center justify-between px-3 py-2">
    {/* Слева — каунт */}
    <span className="text-sm text-muted-foreground">{count ? tListing('subtitle', { count }) : ''}</span>

    {/* Справа — 2 иконки с Tooltip */}
    <div className="flex items-center gap-1">
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleViewMode}>
                    {listingViewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{t('toggleView')}</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>{t('sort')}</TooltipContent>
        </Tooltip>
    </div>
</div>
```

Использовать Tooltip из Radix UI (уже в проекте). Добавить переводы для tooltip.

---

### C8. Кнопка «Закрыть» для кластера

**Файл**: `src/widgets/map-sidebar/ui/ui.tsx` или `src/widgets/listing-controls/ui/ui.tsx`

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

**Файл**: `src/app/[locale]/search/properties/list/page.tsx` строка 55

`pagination?.total` может быть `undefined` → NaN.

```typescript
const count = pagination?.total ?? 0
```

---

### D2. Hydration mismatch — timeAgo

**Файл**: `src/entities/property/ui/property-card-grid/ui.tsx` ~строки 60–79

`useMemo` с `new Date()` различается между SSR и клиентом.

**Исправление** (предпочтительный вариант — `useEffect`):
```tsx
const [timeAgo, setTimeAgo] = useState<string>('')

useEffect(() => {
    const dateStr = property.published_at || property.updated_at || property.created_at
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') { setTimeAgo(''); return }
    // ... логика расчёта timeAgo
    setTimeAgo(result)
}, [property.published_at, property.updated_at, property.created_at])
```

Альтернатива — `suppressHydrationWarning` на `<span>`.

---

### D3. Отсутствующие переводы `filters.show` и `filters.resultsFound`

**Файлы**: все 9 файлов в `messages/` — `ru.json`, `en.json`, `es.json`, `fr.json`, `ca.json`, `de.json`, `it.json`, `pt.json`, `uk.json`

Добавить в секцию `"filters"`:

| Язык | `show` | `resultsFound` |
|------|--------|----------------|
| ru | Показать | Найдено {count} объектов |
| en | Show | {count} results found |
| es | Mostrar | {count} resultados encontrados |
| fr | Afficher | {count} résultats trouvés |
| ca | Mostrar | {count} resultats trobats |
| de | Anzeigen | {count} Ergebnisse gefunden |
| it | Mostra | {count} risultati trovati |
| pt | Mostrar | {count} resultados encontrados |
| uk | Показати | Знайдено {count} об'єктів |

---

### D4. BaseMap error `{}`

**Файл**: `src/features/map/ui/base-map/ui.tsx` строка 100

Добавить детальное логирование (не логировать пустые ошибки):
```typescript
map.current.on('error', (e) => {
    if (e.error?.message || e.message) {
        console.error('[BaseMap] Map error:', e.error?.message || e.message, e)
    }
})
```

---

### D5. Двойная сериализация геометрии

**Файл**: `src/shared/api/geometries.ts` ~строка 170

В `createGeometry()` проверить тип перед `JSON.stringify`:
```typescript
const geometryString = typeof data.geometry === 'string'
    ? data.geometry
    : JSON.stringify(data.geometry)
```

---

## Verification

| Задача | Как проверить |
|--------|---------------|
| B4 | GET `/properties/short-listing` → `price_per_m2` отображается на карточке |
| A5/A8 | Переключить мод `search→draw→search` — данные сохранились. Нарисовать 3 полигона, закрыть→открыть — все 3 восстановились |
| C1 | Скролл до конца списка → подгружаются следующие карточки через cursor |
| C3–C5 | Одиночный объект на карте = цена; клик = карточка; движение карты обновляет сайдбар |
| D3 | Нет ошибок `MISSING_MESSAGE: Could not resolve "filters.show"` |
| D2 | Нет hydration mismatch в консоли |

---

## Правила кода

- **Цвета**: только CSS-переменные (`bg-background`, `text-text-primary`, `bg-brand-primary`). **Никогда** `bg-white`, `bg-blue-500`
- **Текст**: только через `next-intl` (`useTranslations`, `getTranslations`)
- **Комментарии**: на русском; `console.log`: на английском
- **Server Components** по умолчанию; `'use client'` только при необходимости интерактивности
