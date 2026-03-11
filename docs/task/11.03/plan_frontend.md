# План — Frontend (realbro_frontend)

> Все задачи привязаны к пунктам из `init.md`. Указаны конкретные файлы, что менять и как.

---

## 1. Панель фильтров

### 1.1. Убрать субкатегорию "Комната" из фильтров

**Файл:** `src/features/subcategory-filter/ui/ui.tsx`

**Что сделать:**
- В `useMemo` где формируются `items` из `subcategories` — добавить `.filter()` для исключения slug `room` (или соответствующего id комнаты)
- Строка ~67: после `subcategories.map(...)` добавить фильтрацию:
```tsx
const items = useMemo(() => 
    subcategories
        .filter(s => s.slug !== 'room') // исключаем "Комната"
        .map(s => ({ id: s.id, label: s.translated_name || s.slug })),
    [subcategories]
);
```
- Если фильтрация нужна только для категории "Недвижимость" — добавить условие на `categoryIds`

---

### 1.2. Адаптивность фильтров на 1366px

**Файлы:**
- `src/widgets/search-filters-bar/ui/ui.tsx` — основной бар фильтров (десктоп)
- `src/features/price-filter/ui/ui.tsx` — кнопка цены

**Что сделать:**

1. **Кнопка PriceFilter — убрать слово "Цена" из активного состояния:**
   - Строка ~232-235 в `price-filter/ui/ui.tsx`:
   ```tsx
   // Было:
   const buttonLabel = `${t('price')}: €${formatPrice(min)} - €${formatPrice(max)}`;
   // Стало:
   const buttonLabel = `€${formatPrice(min)} - €${formatPrice(max)}`;
   ```

2. **Фиксированная ширина кнопок фильтров:**
   - В `search-filters-bar/ui/ui.tsx` — задать `max-w-[...]` или `shrink-0` для каждого фильтра
   - Добавить `overflow-hidden` и `truncate` на контейнер кнопок
   - Обернуть фильтры в `flex` с `gap-1.5` вместо `gap-2` для экономии места
   - Использовать `@media (max-width: 1400px)` для уменьшения padding'ов кнопок

3. **Контейнер не залезает на логотип:**
   - Проверить `src/widgets/search-filters-bar/ui/ui.tsx` — контейнер рендерится в `HeaderSlot`
   - В layout добавить `min-w-0` на контейнер фильтров и ограничить flex-grow
   - Или задать `ml-[ширина_лого]` чтобы гарантировать отступ от логотипа

---

### 1.3. Синхронизация фильтров — пайплайн облачных иконок

**Файл:** `src/widgets/search-filters-bar/ui/ui.tsx`

**Текущее состояние:** Логика иконок уже частично реализована (строка ~281):
```tsx
const SaveIcon = isSyncing ? RefreshCw : activeQuery ? (justSynced ? CloudCheck : (hasUnsavedChanges ? CloudCog : CloudCheck)) : CloudUpload;
```

**Что доработать:**

1. **Иконки по пайплайну из init.md:**
   - `CloudCog` — фильтр изменился, ждём (уже есть ✓)
   - `CloudSync` (вместо `RefreshCw`) — запрос на апдейт фильтра идёт
     - Заменить `RefreshCw` на `CloudSync` из `lucide-react` + добавить CSS анимацию вращения
   - `CloudAlert` — ошибка синхронизации (НЕ реализовано)
     - Добавить состояние `syncError: boolean` и обработку catch в auto-sync useEffect
   - `CloudCheck` с зелёным цветом — успех (частично есть)
     - Добавить `text-green-500` класс при `justSynced`
   - После `justSynced` — переход в неактивное состояние (серый `CloudCheck`)

2. **Обновление объектов при изменении price/area/rooms:**
   - Проблема: `currentFilters` из `useSearchFilters()` не обновляется при изменениях
   - Проверить что `PriceFilter`, `AreaFilter`, `RoomsFilter` вызывают `setFilters()` из `useSearchFilters()` а не напрямую `filterStore.setFilters()`
   - `fetchResultsCount` (строка 145) зависит от `filters` и `currentFilters` — убедиться что оба обновляются
   - Проверить `MapSidebar` и `SearchMap` — подписаны ли на `useFilterStore` для ререндера при изменении этих фильтров
   - В `src/widgets/map-sidebar/ui/ui.tsx` — проверить зависимости `useEffect` для загрузки properties

3. **Обновление полигона на карте при изменении фильтров:**
   - Если карта активна и есть полигон — перезапрашивать маркеры при смене фильтров
   - В `src/features/map/ui/search-map/ui.tsx` — проверить что fetch маркеров зависит от всех фильтров store

---

### 1.4. Переработать дизайн деталей фильтров (позже. След итерация)

**Файлы:**
- `src/features/price-filter/ui/ui.tsx` — попап цены
- `src/features/area-filter/ui/ui.tsx` — попап площади
- `src/features/rooms-filter/ui/ui.tsx` — выбор комнат
- `src/features/bathrooms-filter/ui/ui.tsx` — выбор ванных
- `src/features/category-filter/ui/ui.tsx` — категории
- `src/features/subcategory-filter/ui/ui.tsx` — субкатегории
- `src/widgets/search-filters-bar/ui/filters-desktop-panel.tsx` — развёрнутая панель

**Что сделать:**
- Подогнать компоненты под дизайн из примера (требуется ссылка на дизайн)
- Унифицировать стили Popover-ов: padding, border-radius, shadow
- Использовать CSS-переменные проекта (`bg-background`, `text-text-primary` и т.д.)

---

## 2. Мод Локация

### 2.1. Границы исчезают после загрузки (race condition)

**Файлы:**
- `src/features/location-search-mode/model/hooks/use-boundaries-layer.ts`
- `src/features/map/ui/base-map/ui.tsx`

**Корневая причина:** 
- `useBoundariesLayer` слушает событие `styledata` (строка ~182), которое может сработать до полной готовности стиля
- При смене темы `BaseMap` вызывает `map.setStyle()` → все кастомные source/layer удаляются
- `style.load` в BaseMap вызывает `onMapLoad`, но `useBoundariesLayer` не реинициализируется (зависимости useEffect: `[map, initializeBoundariesLayer]` — `map` ref не меняется)

**Что исправить:**

1. **В `use-boundaries-layer.ts`:**
   - Заменить `map.once('styledata', handleLoad)` на `map.once('style.load', handleLoad)` — гарантирует полную загрузку стиля
   - Добавить обработчик `style.load` для переинициализации после смены темы:
   ```tsx
   useEffect(() => {
       if (!map) return;
       const handleStyleLoad = () => {
           // Переинициализация source и layers после setStyle()
           initializeBoundariesLayer();
       };
       map.on('style.load', handleStyleLoad);
       return () => { map.off('style.load', handleStyleLoad); };
   }, [map, initializeBoundariesLayer]);
   ```

2. **В `use-boundaries-hover.ts`:**
   - Добавить проверку существования source перед `setFeatureState` (строка ~84):
   ```tsx
   if (!map.getSource(BOUNDARIES_LAYER_IDS.SOURCE)) return;
   ```
   - Добавить `try/catch` вокруг `map.getCanvas().style.cursor = ''`

### 2._ Ошибки при сохранении полигона

**Файлы:**
- `src/features/location-draw-mode/ui/map-draw/ui.tsx` — handleApply()
- `src/shared/api/geometries.ts` (или аналог) — `createFilterGeometry()`
- `src/widgets/sidebar/model/store.ts` — `generateId()`

**Корневая причина:**
- Фронтенд отправляет `query_1772834890393_e4najj0li` (ID сгенерированный `generateId()`) как filter ID
- Бекенд ожидает UUID: `POST /api/v1/filters/:id/geometry` → `parseFilterID()` → `uuid.Parse()` → error

**Что исправить:**
- В `handleApply()` (map-draw/ui.tsx, строка ~160):
  - Проверять формат `activeQueryId` — если не UUID, использовать гостевой endpoint
  - Или: если tab имеет `backendId` (реальный UUID от бекенда) — использовать его
  ```tsx
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-.*/.test(activeQueryId);
  if (isUUID) {
      await createFilterGeometry(activeQueryId, geojsonStr);
  } else {
      await saveGeometry({ type: 'polygon', coordinates, metadata });
  }
  ```
- Альтернатива: в `useSidebarStore` при создании таба через API — сохранять `backendId` (UUID) отдельно от фронтенд `id`

### 2._ Ошибки при очистке слоёв карты

**Файлы:**
- `src/features/location-draw-mode/lib/map-layer-helpers.ts`
- `src/features/location-draw-mode/ui/map-draw/ui.tsx` (useEffect cleanup, строка ~243, 255)

**Что исправить:**

1. **В `map-layer-helpers.ts` — добавить guard:**
   ```tsx
   export const removeLayerIfExists = (map: mapboxgl.Map, layerId: string): void => {
       try {
           if (map.getStyle() && map.getLayer(layerId)) {
               map.removeLayer(layerId);
           }
       } catch { /* map destroyed */ }
   };

   export const removeSourceIfExists = (map: mapboxgl.Map, sourceId: string): void => {
       try {
           if (map.getStyle() && map.getSource(sourceId)) {
               map.removeSource(sourceId);
           }
       } catch { /* map destroyed */ }
   };
   ```

2. **В `map-draw/ui.tsx` — cleanup useEffect:**
   - Строка ~243: перед `cleanupDrawingLayers(map)` — проверить `map.getCanvas()`:
   ```tsx
   if (!map || !map.getCanvas()) return;
   ```
   - Строка ~255: аналогично перед доступом к `map.getCanvas().style`

---

## 5. Детали объекта

### 5.1. Убрать логотип из хедера страницы деталей

**Файлы:**
- `src/screens/property-detail-page/ui.tsx`
- `src/widgets/property-detail-header/ui/ui.tsx`

**Что сделать:**
- В layout деталей — скрыть логотип через prop или CSS-класс
- Или: если `PropertyDetailHeader` рендерится в `HeaderSlot` — не рендерить дефолтный логотип AppHeader

### 5.2. Не отображается ближайший транспорт вверху

**Файл:** `src/widgets/property-detail/ui.tsx`

**Что сделать:**
- Проверить данные: бекенд возвращает `nearest_transport` в ответе `/properties/by-slug/:slug`
- Если транспорт есть в данных — проверить компонент `PropertyHeader` или `PropertyMainInfo` — рендерят ли они блок с ближайшими станциями
- Если нет компонента — создать `TransportBadges` секцию над основной информацией, показывающую 1-2 ближайшие станции (название, тип, время пешком)

### 5.3. Фото поверх сайдбара

**Файл:** `src/entities/property/ui/property-gallery/ui.tsx` (или fullscreen gallery компонент)

**Что сделать:**
- При открытии галереи на весь экран — задать `z-index` выше сайдбара
- Использовать портал (`createPortal`) для рендера в `document.body`
- Или: `z-[500]` класс

### 5.4. Нет эндпоинтов для заметок — см. план бекенда
> Заметки уже есть: `GET/POST/PATCH/DELETE /api/v1/favorites/notes`. Нужно проверить интеграцию фронтенда.

**Файл:** `src/entities/property/ui/property-note-field/ui.tsx`

**Что сделать:**
- Проверить что `PropertyNoteField` использует API `/api/v1/favorites/notes`
- Если нет — подключить через `apiClient.post('/favorites/notes', {...})`

### 5.5. Отображение атрибутов с иконками

**Файлы:**
- `src/entities/property/ui/property-characteristics/ui.tsx`
- `src/entities/property/ui/property-amenities-grid/ui.tsx`
- `src/entities/property/ui/property-tenant-info/ui.tsx`

**Что сделать:**
1. Создать маппинг `icon_type` → иконка (Lucide):
   ```tsx
   // src/shared/lib/attribute-icons.ts
   const ATTRIBUTE_ICONS: Record<string, LucideIcon> = {
       'wifi': Wifi,
       'parking': ParkingCircle,
       'elevator': ArrowUpDown,
       'pool': Waves,
       'garden': TreePine,
       'washing_machine': WashingMachine,
       'air_conditioning': Wind,
       'heating': Flame,
       // ... ~30-40 маппингов
   };
   export const getAttributeIcon = (iconType: string): LucideIcon | null => 
       ATTRIBUTE_ICONS[iconType] || null;
   ```
2. В компонентах отображения — показывать иконку если `icon_type` не пустой
3. Бекенд должен начать отдавать `icon_type` — см. план бекенда

### 5.6. Удобства — не скрывать/открывать

**Файл:** `src/entities/property/ui/property-amenities-grid/ui.tsx`

**Что сделать:**
- Убрать логику "Показать ещё" / collapse
- Отображать все элементы сразу, без ограничения по количеству
- Аналогично для `PropertyCharacteristics` и `PropertyTenantInfo`

### 5.7. Нет ближайших станций метро над картой

**Файл:** `src/entities/property/ui/property-location-section/ui.tsx`

**Что сделать:**
- Добавить секцию `TransportStationsDetailed` или `TransportBadges` **над** BaseMap
- Данные: `property.nearest_transport` из API ответа
- Показывать: название станции, тип (иконка метро/автобуса), расстояние, ~мин пешком
**Note** - Поидее уже было реализовано на моковых данных отображалось, тут сейчас нет. Найти проблему и решить. 

### 5.8. Карта — POI, транспорт, тайлы с location сервиса

**Файл:** `src/entities/property/ui/property-location-section/ui.tsx`

**Что сделать:**
1. В `handleMapLoad` — добавить PBF tile sources:
   ```tsx
   map.addSource('transport-tiles', {
       type: 'vector',
       tiles: [`${LOCATION_URL}/api/v1/tiles/transport/{z}/{x}/{y}.pbf?types=metro,tram,bus,train`],
       minzoom: 10, maxzoom: 16,
   });
   map.addSource('poi-tiles', {
       type: 'vector',
       tiles: [`${LOCATION_URL}/api/v1/tiles/poi/{z}/{x}/{y}.pbf`],
       minzoom: 12, maxzoom: 16,
   });
   ```
2. Добавить слои для отображения станций/POI с соответствующими иконками
3. **Сайдбар под картой** — запрашивать POI по категориям:
   - При выборе вкладки (transport/schools/medical/etc.) → запрос `POST /api/v1/radius/poi` с координатами объекта и соответствующей категорией
   - Отобразить список в `LocationCategoryList`

### 5.9. Карточка автора — author_type + рейтинг/отзывы

**Файлы:**
- `src/entities/property/ui/property-agent-block/ui.tsx`
- `src/entities/property/ui/property-agent-sidebar-card/ui.tsx`

**Что сделать:**
1. Учитывать `author_type`:
   - `owner` → "Собственник" 
   - `agent` → "Агент"
   - `agency` → "Агентство"
   - Использовать `t('authorType.' + author.author_type)` через i18n
2. Отображать `rating`, `review_count`, `object_count` из API ответа
3. Бекенд должен начать отдавать реальные значения — см. план бекенда

### 5.10. Похожие объекты / объекты автора

**Файл:** `src/widgets/property-detail/ui.tsx` (строки ~550-561)

**Что сделать:**
- Логика уже есть (`PropertyListSection` для agent properties и similar)
- Проверить что API запросы работают:
  - Объекты автора: `GET /api/v1/properties?contact_id=...` или `?company_id=...`
  - Похожие: `GET /api/v1/properties/similar/:id`
- Приоритет: если `agentProperties.length > 0` → показать их первыми, затем similar
- Если `agentProperties.length === 0` → показать только similar

### 5.11. Сайдбар — история цены + правка вёрстки

**Файл:** `src/entities/property/ui/property-sidebar-conditions/ui.tsx`

**Что сделать:**
1. **Кнопка истории цены** — скрывать если нет данных:
   ```tsx
   {property.price_history && property.price_history.length > 0 && (
       <PriceHistoryButton />
   )}
   ```
2. **Вёрстка на ПК** — исправить break layout:
   - Проверить `max-w` и `overflow` на сайдбаре
   - Sticky sidebar: убедиться `top-[header_height]` и `max-h-[calc(100vh-header)]` + `overflow-y-auto`

### 5.12. Финансовые условия — корректное отображение залога

**Файл:** `src/entities/property/ui/property-sidebar-conditions/ui.tsx`

**Что сделать:**
- Бекенд возвращает `deposit_months: 2` и `deposit: 1200`
- Отображать: "Залог: 2 мес. (1 200 €)" вместо "Залог —"
- Проверить маппинг полей в компоненте: возможно ищет `deposit` а данные в `deposit_months` + `deposit`

### 5.13. "Объектов в работе" = 0

**Что сделать:**
- Бекенд не заполняет `object_count` в `AuthorResponseLong` — см. план бекенда
- На фронтенде: если `object_count === 0` → показать минимум `1` (текущий объект)
- Или: скрывать блок пока бекенд не починит

### 5.14. Логика перевода описания

**Файлы:**
- `src/entities/property/ui/property-description-section/ui.tsx`
- `src/shared/api/properties.ts` (или аналог)

**Что сделать:**
1. Бекенд возвращает `description` (перевод) и `description_original` (оригинал на ES)
2. Если `description` отсутствует/пустой и `description_original` есть:
   - Показать оригинал с пометкой "Оригинал (ES)"
   - Показать лейбл "Переводится..." с анимацией
   - Вызвать Google Translate API (клиентский): `POST /api/translate` через Next.js API route
   - После получения перевода — показать перевод сверху, оригинал как подложку снизу
   - Отправить перевод на бекенд: `PUT /api/v1/properties/:id/translation` (нужен новый endpoint — см. план бекенда)
3. Создать Next.js API route: `src/app/api/translate/route.ts` — проксирует к Google Translate

---

## 3. Хедер и навигация, сайдбар

**Файлы:**
- `src/widgets/sidebar/ui/` — весь сайдбар
- `src/app/[locale]/layout.tsx` — рендер AppHeader и Sidebar

**Что сделать:** (требуется дизайн-макет)
- Проработать навигацию, переходы, активные состояния
- Мобильный bottom-navigation: `src/widgets/sidebar/ui/bottom-navigation/`

---

## 4. Чат — стили из AI Studio

**Файлы:**
- `src/widgets/chat/ui/` — layout, sidebar, window, header
- `src/entities/chat/ui/` — message-bubble, typing-indicator, chat-avatar
- `src/features/chat-messages/ui/` — message-list, send-message-form

**Что сделать:**
- Перенести стили из шаблона AI Studio
- Обновить CSS/Tailwind классы согласно дизайну
- Использовать CSS-переменные проекта

---

## Порядок приоритетов

| # | Задача | Критичность | Сложность |
|---|--------|-------------|-----------|
| 1 | 2.1 + 2._ Race condition границ + cleanup карты | 🔴 Высокая | Средняя |
| 2 | 2._ Ошибка сохранения полигона (UUID vs query_id) | 🔴 Высокая | Низкая |
| 3 | 1.3 Синхронизация фильтров / обновление объектов | 🔴 Высокая | Средняя |
| 4 | 5.8 Карта POI/транспорт на деталях | 🟡 Средняя | Высокая |
| 5 | 5.9 + 5.13 Author type / object count | 🟡 Средняя | Низкая |
| 6 | 5.5 Иконки атрибутов | 🟡 Средняя | Средняя |
| 7 | 5.12 + 5.11 Залог / сайдбар | 🟡 Средняя | Низкая |
| 8 | 1.1 + 1.2 Фильтры UI | 🟢 Низкая | Низкая |
| 9 | 5.14 Перевод описания | 🟡 Средняя | Высокая |
| 10 | 4. Чат стили | 🟢 Низкая | Средняя |
