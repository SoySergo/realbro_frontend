# Backend Integration Plan — Поэтапная интеграция фронтенда

> **Источник правды**: Backend API (snake_case)
> **Дата создания**: 2026-02-16
> **Связанные документы**: [BACKEND_API_DOCS.md](./BACKEND_API_DOCS.md) · [RULES.md](./RULES.md) · [BACKEND_REQUESTS.md](./BACKEND_REQUESTS.md)

---

## Принципы

1. **snake_case everywhere** — все данные на фронте хранятся и используются в snake_case как приходят с бекенда. Никаких рекурсивных трансформеров camel↔snake.
2. **Бекенд = источник правды** — если поля нет на бекенде, но оно нужно фронту → фиксируем в `BACKEND_REQUESTS.md` и продолжаем разработку "как будто бекенд уже отдаёт".
3. **Не ломать вёрстку** — каждая фаза самодостаточна, UI работает на моках до подключения реального API.
4. **Помодульные feature-флаги** — каждый модуль (properties, auth, tabs и т.д.) переключается на реальный API независимо.
5. **Cursor-пагинация везде** — чаты, объекты, маркеры, история — всё через cursor.
6. **Виртуализация списков** — grid-листинг и sidebar используют виртуальное окно для производительности при большом количестве элементов.
7. **SEO** — первый запрос с увеличенным `limit` (SSR/ISR), далее — infinite scroll с cursor.

---

## Маппинг admin_level → location fields

**Единственная версия** (все дубли в проекте заменяются на одну функцию):

| admin_level | Backend field | Описание |
|-------------|---------------|----------|
| 2 | `country_ids` | Страна |
| 4 | `region_ids` | Регион / Автономное сообщество |
| 6 | `province_ids` | Провинция |
| 7 | `city_ids` | Комарка / Крупный город |
| 8 | `city_ids` | Город / Муниципалитет |
| 9 | `district_ids` | Район |
| 10 | `neighborhood_ids` | Квартал / Баррио |

> **Примечание**: admin_level 7 и 8 оба маппятся на `city_ids` — бекенд принимает и комарки и города в одном параметре.

---

## Naming Convention (из BACKEND_API_DOCS)

| Поле | Значение | Описание |
|------|----------|----------|
| `property_type` | `sale`, `rent` | Тип сделки |
| `property_kind_ids` | `1`=residential, `2`=commercial, `3`=industrial, `4`=land, `5`=other | Вид недвижимости |
| `categories` | `1`=room, `2`=apartment, `3`=house | Категория |
| `sub_categories` | `4`=piso, `5`=studio, `6`=loft, `7`=atico, `8`=penthouse, ... | Подкатегория |

---

## Фаза 0 — Инфраструктура

### 0.1 · API Client
- [x] Создать `src/shared/api/lib/api-client.ts`
- Обёртка над `fetch` с `credentials: 'include'`
- Base URL из `NEXT_PUBLIC_API_BASE_URL` (`http://localhost:8080/api/v1`)
- Подстановка `Authorization: Bearer {access_token}` из auth store
- Обработка ошибок по `ErrorResponse` (`{ error, message }`)
- Авто-retry при 401 → вызов `/auth/refresh` → повтор запроса
- **Без авто-конвертации полей** — данные проходят as-is в snake_case
- Методы: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`

### 0.2 · Cursor Pagination Types
- [x] Обновить `src/shared/api/types.ts`
- Добавить `CursorPaginatedResponse<T>`:
  ```typescript
  interface CursorPaginatedResponse<T> {
    data: T[];
    pagination: {
      next_cursor?: string;
      has_more: boolean;
      total: number;
      limit: number;
    };
  }
  ```
- Добавить `ApiDataResponse<T>` (обёртка `{ data: T }` для одиночных ответов)
- Сохранить старый `PaginatedResponse<T>` временно для обратной совместимости

### 0.3 · Cursor Pagination Hook
- [x] Создать `src/shared/hooks/use-cursor-pagination.ts`
- Хранит: `items: T[]`, `cursor: string | null`, `has_more: boolean`, `is_loading: boolean`, `total: number`
- Метод `loadMore()` — подгружает следующую порцию
- Метод `reset()` — сброс (при смене фильтров)
- Метод `setInitialData()` — для SSR (первая страница приходит с сервера)
- Интеграция с `IntersectionObserver` для автоподгрузки при скролле
- Debounce/throttle на скролл

### 0.4 · Виртуализация списков
- [x] Подключить `@tanstack/react-virtual` (или расширить использование `react-window`)
- Grid-листинг: `VariableSizeGrid` / `useVirtualizer` для сетки карточек
- Sidebar-листинг: уже используется `react-window` → унифицировать подход
- Первый запрос (SSR): `limit=60` для SEO (контент рендерится на сервере)
- Последующие: `limit=20` при скролле через cursor

### 0.5 · Feature Flags (помодульные)
- [x] Расширить `src/shared/config/features.ts`
- Добавить флаги:
  ```typescript
  USE_REAL_PROPERTIES: boolean;  // properties listing, detail, count
  USE_REAL_AUTH: boolean;        // auth + user profile
  USE_REAL_TABS: boolean;        // search tabs CRUD
  USE_REAL_MARKERS: boolean;     // markers (like, dislike, saved, hidden...)
  USE_REAL_AUTOSEARCH: boolean;  // autosearch + WS notifications
  USE_REAL_FILTERS: boolean;     // saved filters + geometries
  USE_REAL_FAVORITES: boolean;   // notes, professionals
  USE_REAL_PAYMENTS: boolean;    // subscriptions, payment methods
  ```
- Все из `process.env.NEXT_PUBLIC_USE_REAL_*` с fallback на `false`

---

## Фаза 1 — Property Listing (Grid = Short Listing)

### 1.1 · Backend DTO Types
- [x] Создать `src/entities/property/model/api-types.ts`
- Типы **точно** как бекенд-ответ (snake_case, все поля):
  ```typescript
  interface PropertyShortListingDTO {
    id: string;
    title: string;
    slug: string;
    property_type: 'sale' | 'rent';
    property_kind: string;
    category: string;
    sub_category: string;
    price: number;
    price_per_meter?: number;
    currency: string;
    rooms: number;
    bathrooms: number;
    area: number;
    floor?: number;
    total_floors?: number;
    location: LocationShortDTO;
    media: MediaResponseDTO;
    author: AuthorShortDTO;
    is_new: boolean;
    published_at: string;
    updated_at: string;
  }

  interface LocationShortDTO {
    address: string;
    city: string;
    is_address_visible: boolean;
    transport?: NearestStationDTO;
  }

  interface NearestStationDTO {
    station_id: number;
    name: string;
    lat: number;
    lon: number;
    distance: number;
    walking_distance: number;
    walking_duration: number;
    type: string;
    lines?: TransportLineDTO[];
  }

  interface TransportLineDTO {
    id: number;
    name: string;
    ref?: string;
    type: string;
    color?: string;
  }

  interface AuthorShortDTO {
    id: string;
    contact_id: string;
    name: string;
    author_type: string;
    avatar_url?: string;
    company_id?: string;
    company_name?: string;
    company_logo?: string;
    company_url?: string;
    is_verified: boolean;
  }

  interface MediaResponseDTO {
    photos: MediaItemDTO[];
    videos: MediaItemDTO[];
    plans: MediaItemDTO[];
    photos_count: number;
    videos_count: number;
    plans_count: number;
  }

  interface MediaItemDTO {
    id: string;
    url: string;
    thumbnail_url: string;
    width: number;
    height: number;
    description?: string;
  }
  ```

### 1.2 · Обновить Card Types
- [x] Обновить `src/entities/property/model/card-types.ts`
- `PropertyGridCard` приводится к `PropertyShortListingDTO`:
  - Добавить: `slug`, `property_type`, `property_kind`, `sub_category`, `currency`, `bathrooms`, `published_at`
  - `images: PropertyCardImage[]` → `media: MediaResponseDTO`
  - `transport_station` → `location.transport` (вложенная структура)
  - `author` → `AuthorShortDTO` (добавить `contact_id`, `company_*`, `is_verified`)
  - Убрать: `created_at` (заменён на `published_at`), `type` (заменён на `property_type` + `category`)
- `PropertyHorizontalCard` приводится к `PropertyEnrichedListingDTO`:
  - Наследует все поля grid + `characteristics: AttributeDTO[]`, `short_description`
  - Убрать: `amenities: string[]`, `no_commission`, `exclusive`, `video`, `floor_plan`, `tour_3d` (всё это будет в `characteristics` / `media`)

### 1.3 · Обновить UI карточек
- [x] Обновить `src/entities/property/ui/property-card-grid/ui.tsx`
  - Дата: `card.published_at || card.created_at` (с fallback для обратной совместимости)
  - Остальные поля (images, transport, author) работают через legacy-формат с поддержкой нового
- [x] Обновить `src/entities/property/ui/property-card-horizontal/ui.tsx`
  - Аналогичные изменения + поддержка `author_type` (новый) и `type` (legacy)

### 1.4 · Обновить API Properties
- [x] Обновить `src/shared/api/properties.ts`
  - `getPropertiesListCursor()` → `GET /api/v1/properties/short-listing` через api-client
  - Query params в snake_case: `property_types`, `categories`, `city_ids`, `min_price`, `max_price`, `sort_by`, `sort_order`, `limit`, `cursor`, `language`
  - Ответ: `CursorPaginatedResponse<PropertyShortListingDTO>`
  - Fallback на мок по флагу `USE_REAL_PROPERTIES`
- [x] Обновить `src/shared/api/properties-server.ts`
  - SSR-версия с `limit=60` для SEO
  - Тот же эндпоинт, серверный fetch без credentials
- [x] `getPropertiesCount()` → `GET /api/v1/properties/count` → `{ data: { count: number } }`
- [x] `getPropertyBySlug()` → `GET /api/v1/properties/by-slug/:slug`
- [x] `getSimilarPropertiesApi()` → `POST /api/v1/properties/:id/similar`

### 1.5 · Интеграция с виджетами
- [x] Обновить `src/widgets/property-listing/` — типы совместимы, cursor-пагинация готова через хук
- [x] Обновить `src/widgets/map-sidebar/` — уже использует `react-window`, типы синхронизированы

---

## Фаза 2 — Property Detail + Enriched Listing + Иконки

### 2.1 · Расширить DTO Types
- [x] Добавить в `src/entities/property/model/api-types.ts`:
  ```typescript
  interface PropertyEnrichedListingDTO extends PropertyShortListingDTO {
    characteristics: AttributeDTO[];
    estate_info: AttributeDTO[];
    short_description: string;
  }

  interface PropertyDetailsDTO {
    property_type: 'sale' | 'rent';
    property_kind: string;
    category: string;
    sub_category: string;
    id: string;
    slug: string;
    title: string;
    price: number;
    price_per_meter?: number;
    price_per_month?: number;
    currency: string;
    rooms: number;
    bathrooms: number;
    area: number;
    area_useful?: number;
    area_kitchen?: number;
    floor?: number;
    total_floors?: number;
    description: string;
    description_original?: string;
    location: LocationDetailsDTO;
    media: MediaResponseDTO;
    author: AuthorLongDTO;
    characteristics: AttributeDTO[];
    estate_info: AttributeDTO[];
    energy_efficiency: AttributeDTO[];
    amenities: AttributeDTO[];
    tenants: AttributeDTO[];
    rental_conditions?: RentalConditionsDTO;
    deposit_months?: number;
    min_income?: number;
    agency_fee?: number;
    min_term?: number;
    max_term?: number;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string[];
    is_new: boolean;
    is_verified: boolean;
    published_at: string;
    created_at: string;
    updated_at: string;
  }

  interface AttributeDTO {
    label: string;
    value: string;
    icon_type: string;
  }

  interface LocationDetailsDTO {
    formatted_address: string;
    city: string;
    coordinates: CoordinatesDTO;
    transport: NearestStationDTO[];
  }

  interface CoordinatesDTO {
    lat: number;
    lng: number;
  }

  interface AuthorLongDTO extends AuthorShortDTO {
    object_count: number;
    rating: number;
    review_count: number;
  }
  ```

### 2.2 · Синхронизировать Property Entity Types
- [x] Обновить `src/entities/property/model/types.ts`
- Привести `Property` к snake_case
- Убрать поля которых нет на бекенде: `amenities: string[]` (теперь `AttributeDTO[]`), `noCommission`, `exclusive` (в атрибутах), `features: PropertyFeature[]` (заменены на `characteristics`)
- Добавить: `description_original`, `estate_info`, `energy_efficiency`, `tenants`, `seo_*`
- Типы дат: `string` (ISO 8601), не `Date`
- **Проверить**: если у бекенда не хватает полей для группировки атрибутов (какие — удобства, какие — характеристики, какие — требования к арендатору) → записать в `BACKEND_REQUESTS.md`

### 2.3 · Dynamic Icon Component
- [x] Создать `src/shared/ui/dynamic-icon/ui.tsx`
  ```typescript
  // <DynamicIcon name="bath" size={18} />
  // Бекенд шлёт icon_type (ключ lucide: 'bath', 'bed', 'ruler', ...)
  // Маппинг: { bath: Bath, bed: Bed, ruler: Ruler, ... } с fallback
  ```
- [x] Создать `src/shared/ui/dynamic-icon/icon-map.ts` — объект маппинга string → LucideIcon
- Ключи совпадают с теми, что уже используются на фронте (бекенд шлёт те же)
- Fallback-иконка при неизвестном ключе (например `HelpCircle`)
- **Не** dynamic import — статический маппинг для tree-shaking

### 2.4 · Обновить Property Detail Widget
- [x] Обновить `src/widgets/property-detail/ui.tsx`
- Рендерить `characteristics: AttributeDTO[]` через `<DynamicIcon name={attr.icon_type} />`
- Показывать первые N атрибутов (например 3-4), рядом лейбл `+X` для раскрытия
- Секции: характеристики, удобства, информация о здании, энергоэффективность, арендаторы — каждая с collapse
- `location.transport[]` — список ближайших станций (не одна)
- `media` — фото/видео/планировки через `MediaResponseDTO`
- `author` → `AuthorLongDTO` с `object_count`, `rating`, `review_count`

### 2.5 · Обновить sub-components
- [x] `PropertyCharacteristics` — рендер `AttributeDTO[]` с `<DynamicIcon>`
- [x] `PropertyAmenitiesGrid` — рендер `amenities: AttributeDTO[]`
- [ ] Transport section — рендер `location.transport: NearestStationDTO[]`
- [ ] Author card — `AuthorLongDTO` поля
- [ ] Rental conditions — плоские поля `deposit_months`, `agency_fee`, `min_term`, `max_term`

---

## Фаза 3 — Фильтры и Query-параметры

// NOTE: у нас есть действия пользователей для объектов. Лайк, дизлайк и при открытии карточеки (видел/не разобранные) и у нас есть в фильтрах маркер, для выбора отображаемых вариантов. Этот момент должен работать корректно тоже. Учитывая что в маркерах есть вещи противоположные, которые не должны быть выбраны одноврменно. Например нравится и не нравится. Но может быть Нравится и неразобранные/видел(логика одна и та же у неразобранные и видел, нужно по названию скоректироваться, использовать которое уже есть)


### 3.1 · Обновить Filter Types
- [x] Обновить `src/entities/filter/model/types.ts`
- Новая структура `SearchFilters`:
  ```typescript
  interface SearchFilters {
    // Тип сделки
    property_types?: string;         // 'sale' | 'rent' | 'sale,rent'
    // Вид недвижимости
    property_kind_ids?: number[];    // 1=residential, 2=commercial...
    // Категория / подкатегория
    categories?: number[];           // 1=room, 2=apartment, 3=house
    sub_categories?: number[];       // 4=piso, 5=studio...
    // Локации
    country_ids?: number[];
    region_ids?: number[];
    province_ids?: number[];
    city_ids?: number[];             // 7 и 8 admin_level → сюда
    district_ids?: number[];
    neighborhood_ids?: number[];
    // Цена / площадь
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    // Комнаты / ванные
    rooms?: number[];
    bathrooms?: number[];
    // Геолокация
    bbox?: string;                   // 'minLat,minLng,maxLat,maxLng'
    radius?: number;                 // метры
    radius_lat?: number;
    radius_lng?: number;
    geojson?: string;                // inline GeoJSON
    polygon_ids?: string[];          // UUID[] сохранённых геометрий
    // Включение / исключение
    include_ids?: string[];          // UUID[]
    exclude_ids?: string[];          // UUID[]
    // Сортировка
    sort_by?: string;                // 'published_at' | 'price' | 'area' | 'created_at'
    sort_order?: 'asc' | 'desc';
    // Пагинация
    limit?: number;
    cursor?: string;
    // Язык
    language?: string;
    // Маркеры (для saved filters)
    exclude_marker_types?: string[]; // 'dislike', 'hidden'
    // Мета (frontend-only для UI)
    locations_meta?: Array<{
      id: number;
      name?: string;
      admin_level?: number;
      wikidata?: string;
    }>;
  }
  ```

### 3.2 · Унифицировать mapAdminLevelToType
- [x] Оставить **единственную** реализацию в `src/entities/boundary/lib/boundary-utils.ts`
- Маппинг:
  ```typescript
  function adminLevelToLocationField(admin_level: number): string {
    switch (admin_level) {
      case 2: return 'country_ids';
      case 4: return 'region_ids';
      case 6: return 'province_ids';
      case 7:
      case 8: return 'city_ids';
      case 9: return 'district_ids';
      case 10: return 'neighborhood_ids';
      default: return 'city_ids';
    }
  }
  ```
- [x] Удалить дубли из:
  - `src/app/api/boundaries/search/route.ts`
  - `src/features/location-search-mode/lib/boundaries-helpers.ts`
  - `src/features/location-search-mode/ui/boundaries-sync/ui.tsx`
  - `src/widgets/search-filters-bar/model/store.ts`
- Все используют импорт из `@/entities/boundary`

### 3.3 · Обновить convert-filters
- [x] Обновить `src/entities/filter/lib/convert-filters.ts`
- `locationToFilters()` — группировка `locations_meta` по `admin_level` → `country_ids`, `city_ids`, etc.
- `filtersToLocation()` — обратная конвертация
- `filtersToQueryString(filters: SearchFilters): string` — формирует query params:
  ```
  property_types=rent&categories=2,3&city_ids=1001&min_price=500
  &sort_by=price&sort_order=asc&limit=20&cursor=abc...&language=en
  ```
- Числовые массивы → CSV: `[1, 2, 3]` → `"1,2,3"`
- UUID массивы → CSV: `["uuid1", "uuid2"]` → `"uuid1,uuid2"`

### 3.4 · Обновить Filter Store
- [x] Обновить `src/widgets/search-filters-bar/model/store.ts`
- `SearchFilters` с новыми именами полей
- Убрать inline `mapAdminLevelToType` — импорт из `@/entities/boundary`
- `convertFiltersToQuery()` → вызов `filtersToQueryString()`
- При изменении `sort_by` / `sort_order` — cursor сбрасывается (бекенд игнорирует старый)
- Производительность: `shallow` comparison для предотвращения лишних ререндеров

### 3.5 · Обновить Feature-фильтры
- [x] `src/features/price-filter/` — поля `min_price`, `max_price`
- [x] `src/features/rooms-filter/` — поле `rooms: number[]`
- [x] `src/features/area-filter/` — поля `min_area`, `max_area`
- [x] `src/features/category-filter/` — поля `property_kind_ids`, `categories`, `sub_categories`
- [ ] `src/features/location-filter/` — поля `country_ids`...`neighborhood_ids`, `radius`, `radius_lat`, `radius_lng`, `polygon_ids`, `geojson`
- [x] `src/features/marker-type-filter/` — поле `exclude_marker_types`
- [x] `src/features/search-category/` — `property_types` (sale/rent)
- [x] Добавить `src/features/bathrooms-filter/` — поле `bathrooms: number[]` (новый фильтр)

---

## Фаза 4 — Карта (MVT Тайлы + Кластеры + Сайдбар)

### 4.1 · MVT Tile Source
- [x] Обновить `src/features/map/` — vector tile source:
  ```typescript
  map.addSource('properties', {
    type: 'vector',
    tiles: [`${API_BASE}/properties/tiles/{z}/{x}/{y}.pbf?${filtersToQueryString(filters)}`],
    minzoom: 0,
    maxzoom: 22
  });
  ```
- Layer name: `properties`
- `Cache-Control: public, max-age=60`
- При изменении фильтров — обновлять URL source и делать `map.getSource('properties').setTiles([...])`

### 4.2 · Кластеры
- [x] Логика кластеризации: `z ≤ 15` — кластеры (бекенд группирует), `z > 15` — индивидуальные точки
- [x] При клике на кластер:
  1. Забрать `property_ids` из feature properties тайла
  2. Запросить `GET /api/v1/properties/short-listing?include_ids=id1,id2,...`
  3. Отобразить в sidebar через виртуализированный список (нужно учитывать что если объектов много, то делить доп и запрашивать при прокрутке сайдбара)
- [x] При клике на индивидуальную точку — popup с кратким описанием или переход в detail (карточка как в grid стиле на листинге или в сайдбаре. Запрашиваем та к же как для кластера, просто в массив айди 1 даём)

### 4.3 · Sidebar (Map)
- [x] Обновить `src/widgets/map-sidebar/` — типы карточек = `PropertyShortListingDTO`
- [x] Виртуализация уже есть (`react-window`) — синхронизировать типы
- [x] Infinite scroll в sidebar: cursor-пагинация при скролле вниз

### 4.4 · Boundaries
- [x] Boundaries остаются на текущем сервисе (separate location service)
- [x] Унифицировать маппинг `admin_level` через единую функцию (п.3.2)
- [x] `src/app/api/boundaries/search/route.ts` — убрать дубль маппинга

---

## Фаза 5 — Search Tabs + Сохранённые фильтры + Геометрии

### 5.1 · Обновить Tab Types
- [x] Обновить `src/widgets/sidebar/model/types.ts`
- Расширить `SearchQuery`:
  ```typescript
  interface SearchQuery {
    id: string;
    title: string;
    filters: SearchFilters;        // фильтры ЗАШИТЫ в табе
    query_type?: SearchQueryType;
    results_count?: number;
    view_mode?: string;
    listing_view_mode?: string;
    map_state?: object;
    is_pinned?: boolean;
    is_default?: boolean;
    is_unsaved?: boolean;
    folder_id?: string;
    usage_count?: number;
    has_ai_agent?: boolean;
    ai_agent_status?: AiAgentStatus;
    created_at: string;
    updated_at: string;
  }
  ```
- При переключении табов → фильтры из таба применяются в `useSearchFiltersStore` → обновляется запрос объектов и тайлов

### 5.2 · Обновить API Search Tabs
- [x] Обновить `src/shared/api/search-queries.ts`
- CRUD: `GET/POST/PUT/DELETE /api/v1/search-tabs`
- `POST /api/v1/search-tabs/reorder` — изменение порядка
- `POST /api/v1/search-tabs/:id/usage` — отметка использования
- `GET /api/v1/search-tabs/templates` — шаблоны
- Папки: `POST/PUT/DELETE /api/v1/search-tabs/folders`
- **→ BACKEND_REQUESTS.md**: объединить tabs и saved filters — каждый таб содержит свой фильтр. Инициализация фильтра при создании таба.

### 5.3 · Геометрии
- [x] Обновить `src/shared/api/geometries.ts`
- Эндпоинт: `POST/GET/PUT/DELETE /api/v1/filters/:filter_id/geometry`
- `id: string` (UUID)
- **Неавторизованные**: `filter_id = "0"` (временная геометрия, очищается)
- **Авторизованные**: `filter_id` = ID фильтра текущего таба
- Фронтенд при создании вкладки → инициализирует фильтр → привязывает геометрию к фильтру

### 5.4 · Sidebar Store Sync
- [x] Обновить `src/widgets/sidebar/model/store.ts`
- При переключении таба:
  1. `setActiveQuery(tabId)` → загрузить фильтры таба
  2. `useSearchFiltersStore.getState().setFilters(tab.filters)` → применить
  3. Триггернуть обновление запроса объектов + тайлов
- При изменении фильтров:
  1. Обновить `filters` в текущем табе
  2. `PUT /api/v1/search-tabs/:id` (debounced)
- Default tab (id = 'default') — не удаляется, всегда есть

---

## Фаза 6 — Auth, Профиль, Маркеры, Избранное, Автопоиск

### 6.1 · Auth → Bearer Token
- [x] Обновить `src/shared/api/auth.ts`
- Централизовать на Bearer:
  - `access_token` хранится в Zustand store (in-memory, не persist — безопасность)
  - `refresh_token` — httpOnly cookie (бекенд устанавливает)
  - API-client подставляет `Authorization: Bearer {access_token}` из store
  - При 401 → вызов `POST /auth/refresh` → получение нового `access_token` → повтор запроса
- [x] Обновить `src/features/auth/model/store.ts`
  - Хранить `access_token` + `user` (persist только `user` в localStorage)
  - `initAuth()`: попытка refresh → если ок → сохранить `access_token` + `user`
  - `login()` → сохранить `access_token` из `AuthResponse`
  - `logout()` → очистить `access_token`, вызвать `POST /auth/logout`
- [x] Google OAuth: `GET /auth/google/login?return_url=...` → редирект → callback
- **→ BACKEND_REQUESTS.md**: расширить `role` до `'user' | 'agent' | 'agency' | 'developer' | 'admin'`

### 6.2 · User Types
- [x] Обновить `src/entities/user/model/types.ts`
- Привести к snake_case, синхронизировать с `UserResponse`, `UserSettings`, `NotificationSettings`
- Убрать `role: 'moderator'`
- Добавить роли: `'user' | 'agent' | 'agency' | 'developer' | 'admin'` (→ BACKEND_REQUESTS.md)

### 6.3 · Markers API + UI
- [x] Создать `src/shared/api/markers.ts`
  - `POST /markers` — установить маркер (`{ property_id, marker_type }`)
  - `GET /markers/:property_id` — получить маркер
  - `DELETE /markers/:property_id?type=like` — удалить
  - `GET /markers?type=saved&limit=20` — список с cursor
  - `GET /markers/stats` — статистика
  - `GET /markers/property-ids?types=like,saved` — ID объектов
- Типы: `like`, `dislike`, `saved`, `hidden`, `to_review`, `to_think`
- [x] Обновить `src/entities/user-actions/model/store.ts` — подключить реальный API
- [x] Обновить UI карточек:
  - Убрать дублирующуюся логику like/dislike из `property-card-grid/ui.tsx` и `property-card-horizontal/ui.tsx`
  - Использовать централизованный `useUserActionsStore`
  - Добавить 3-dot меню (⋮) с действиями: `saved`, `hidden`, `to_review`, `to_think`
  - Like/dislike остаются как основные кнопки
  - Тестировать UX: inline кнопки vs dropdown vs swipe (mobile)

### 6.4 · Favorites (Notes + Professionals)
- [x] Обновить `src/entities/favorites/model/types.ts`
  - `PropertyNote`: `text` → `content`, добавить `property_id` (required), `tags: string[]`
  - `FavoriteProfessional`: хранить `contact_id` + `professional_type`, данные автора подтягиваются
  - Недостающие поля → BACKEND_REQUESTS.md
- [x] API: подключить `/api/v1/favorites/notes`, `/api/v1/favorites/professionals`

### 6.5 · Autosearch + WebSocket Online
- [x] Обновить `src/entities/autosearch/model/types.ts`
  - Сохранить `frequency: 'online'` (→ BACKEND_REQUESTS.md для поддержки на бекенде)
  - Привязка к `filter_id`
- [x] Обновить `src/shared/hooks/use-autosearch-websocket.ts`
  - Режим **online**: если пользователь онлайн + автоподбор активен → держать WS-соединение на `autosearch:user_{id}`
  - Новые объекты пушатся в реальном времени → уведомление + добавление в ленту
  - Режим **offline**: бекенд пушит push-уведомление / telegram (серверная логика)
- [x] API: `POST/GET/PUT/DELETE /api/v1/autosearch`, `/api/v1/autosearch/:id/activate|deactivate`

### 6.6 · Views (Просмотры)
- [x] Создать `src/shared/api/views.ts`
  - `POST /views/:property_id` — записать просмотр при открытии detail
  - `GET /views` — история с cursor
  - `POST /views/unseen` — проверить непросмотренные из списка ID

### 6.7 · Subscriptions & Payments
- [x] Создать `src/shared/api/subscriptions.ts`
  - `GET /subscription/plans`, `/subscription/current`
  - `POST /subscription/change`, `/subscription/cancel`
- [x] Создать `src/shared/api/payments.ts`
  - `GET /payments/history`, `/payments/methods`
  - `POST /payments/methods`, `DELETE /payments/methods/:id`

---

## Порядок выполнения и зависимости

```
Фаза 0 (инфраструктура)
  ↓
Фаза 1 (grid listing) ←── зависит от 0.1, 0.2, 0.3, 0.4, 0.5
  ↓
Фаза 2 (detail + enriched) ←── зависит от 1.1
  ↓
Фаза 3 (фильтры) ←── зависит от 1.4 (query params)
  ↓
Фаза 4 (карта) ←── зависит от 3.3 (filtersToQueryString)
  ↓
Фаза 5 (tabs + geometries) ←── зависит от 3.1 (SearchFilters type)
  ↓
Фаза 6 (auth + markers + ...) ←── зависит от 0.1 (api-client)
```

> **Фаза 6 может выполняться параллельно с 2-5** — auth и маркеры зависят только от api-client (0.1).

---

## Файлы которые создаются

| Фаза | Файл | Описание |
|------|------|----------|
| 0 | `src/shared/api/lib/api-client.ts` | Единый HTTP-клиент |
| 0 | `src/shared/hooks/use-cursor-pagination.ts` | Хук cursor-пагинации |
| 1 | `src/entities/property/model/api-types.ts` | Backend DTO types |
| 2 | `src/shared/ui/dynamic-icon/ui.tsx` | Компонент динамических иконок |
| 2 | `src/shared/ui/dynamic-icon/icon-map.ts` | Маппинг string → LucideIcon |
| 3 | `src/features/bathrooms-filter/` | Новый фильтр по ванным |
| 6 | `src/shared/api/markers.ts` | Markers API |
| 6 | `src/shared/api/views.ts` | Views API |
| 6 | `src/shared/api/subscriptions.ts` | Subscriptions API |
| 6 | `src/shared/api/payments.ts` | Payments API |

## Файлы которые обновляются

| Фаза | Файл | Что меняется |
|------|------|-------------|
| 0 | `src/shared/api/types.ts` | + CursorPaginatedResponse |
| 0 | `src/shared/config/features.ts` | + помодульные флаги |
| 1 | `src/entities/property/model/card-types.ts` | Синхронизация с backend DTO |
| 1 | `src/entities/property/ui/property-card-grid/ui.tsx` | Новые поля в рендере |
| 1 | `src/entities/property/ui/property-card-horizontal/ui.tsx` | Новые поля в рендере |
| 1 | `src/shared/api/properties.ts` | Реальные эндпоинты + cursor |
| 1 | `src/shared/api/properties-server.ts` | SSR + increased limit |
| 1 | `src/widgets/property-listing/` | Cursor + виртуализация |
| 1 | `src/widgets/map-sidebar/` | Синхронизация типов |
| 2 | `src/entities/property/model/types.ts` | snake_case, бекенд-поля |
| 2 | `src/widgets/property-detail/ui.tsx` | AttributeDTO[], DynamicIcon, collapse |
| 3 | `src/entities/filter/model/types.ts` | Бекенд-имена полей |
| 3 | `src/entities/boundary/lib/boundary-utils.ts` | Единственный маппинг admin_level |
| 3 | `src/entities/filter/lib/convert-filters.ts` | filtersToQueryString snake_case |
| 3 | `src/widgets/search-filters-bar/model/store.ts` | Новые имена + импорт маппинга |
| 3 | `src/features/*/` | Все фильтр-фичи — новые поля |
| 4 | `src/features/map/` | MVT source URL + filter params |
| 5 | `src/widgets/sidebar/model/types.ts` | Расширенный SearchQuery |
| 5 | `src/widgets/sidebar/model/store.ts` | Tab↔filter sync |
| 5 | `src/shared/api/search-queries.ts` | Реальные эндпоинты |
| 5 | `src/shared/api/geometries.ts` | Per-filter, UUID |
| 6 | `src/shared/api/auth.ts` | Bearer token |
| 6 | `src/features/auth/model/store.ts` | access_token in memory |
| 6 | `src/entities/user/model/types.ts` | snake_case, roles |
| 6 | `src/entities/user-actions/model/store.ts` | Real API |
| 6 | `src/entities/property/ui/property-card-grid/ui.tsx` | Centralized markers |
| 6 | `src/entities/property/ui/property-card-horizontal/ui.tsx` | Centralized markers |
| 6 | `src/entities/favorites/model/types.ts` | Backend fields |
| 6 | `src/entities/autosearch/model/types.ts` | filter_id, online mode |
| 6 | `src/shared/hooks/use-autosearch-websocket.ts` | Online mode |
