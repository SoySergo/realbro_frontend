# Backend API — Полная документация для фронтенда

> **Base URL:** `http://localhost:8080/api/v1`
> **Формат:** JSON
> **Авторизация:** Bearer token в заголовке `Authorization` или HTTP-only cookie
> **Язык по умолчанию:** `es` (испанский)

---

## Содержание

1. [Аутентификация](#1-аутентификация)
2. [Объекты недвижимости (Properties)](#2-объекты-недвижимости)
3. [Фильтры — Query параметры](#3-фильтры--query-параметры)
4. [Сортировка и Пагинация (Cursor)](#4-сортировка-и-пагинация)
5. [MVT Тайлы (Карта)](#5-mvt-тайлы-карта)
6. [Сохранённые фильтры (Search Filters)](#6-сохранённые-фильтры)
7. [Геометрии фильтров (Полигоны)](#7-геометрии-фильтров-полигоны)
8. [Вкладки поиска (Search Tabs)](#8-вкладки-поиска-search-tabs)
9. [Папки вкладок (Tab Folders)](#9-папки-вкладок)
10. [Автопоиск (Autosearch)](#10-автопоиск)
11. [Маркеры (Markers)](#11-маркеры-markers)
12. [Просмотры (Views)](#12-просмотры-views)
13. [Избранные профессионалы (Favorites)](#13-избранные-профессионалы)
14. [Заметки к объектам (Property Notes)](#14-заметки-к-объектам)
15. [Справочники (Dictionaries)](#15-справочники-dictionaries)
16. [Подписки и Платежи](#16-подписки-и-платежи)
17. [Профиль пользователя](#17-профиль-пользователя)
18. [Справочник типов и категорий](#18-справочник-типов-и-категорий)
19. [Обработка ошибок](#19-обработка-ошибок)

---

## 1. Аутентификация

### Типы (TypeScript)

```typescript
interface RegisterRequest {
  email: string;       // required, email format
  password: string;    // required, min 8 chars
}

interface LoginRequest {
  email: string;       // required, email format
  password: string;    // required
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;       // секунды (обычно 3600)
  token_type: "Bearer";
  user: UserInfo;
}

interface UserInfo {
  id: string;          // UUID
  email: string;
  role: "user" | "admin";
  is_active: boolean;
  created_at: string;  // ISO 8601
}

interface ChangePasswordRequest {
  old_password: string;
  new_password: string;     // min 8 chars
}

interface PasswordResetRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  new_password: string;     // min 8 chars
}
```

### Эндпоинты

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `POST` | `/auth/register` | ❌ | Регистрация |
| `POST` | `/auth/login` | ❌ | Вход |
| `POST` | `/auth/refresh` | ❌ | Обновление токенов (refresh_token из cookie) |
| `POST` | `/auth/logout` | ✅ | Выход (инвалидирует текущий refresh token) |
| `POST` | `/auth/logout-all` | ✅ | Выход со всех устройств |
| `GET` | `/auth/google/login` | ❌ | Получить URL для Google OAuth |
| `GET` | `/auth/google/callback` | ❌ | Callback Google OAuth |
| `POST` | `/auth/facebook` | ❌ | Вход через Facebook |
| `POST` | `/auth/password/change` | ✅ | Смена пароля |
| `POST` | `/auth/password/reset-request` | ❌ | Запрос сброса пароля |
| `POST` | `/auth/password/reset` | ❌ | Сброс пароля по токену |
| `GET` | `/auth/sessions` | ✅ | Количество активных сессий |
| `GET` | `/auth/me` | ✅ | Текущий пользователь |

### Примеры

```bash
# Регистрация
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123"
}

# Ответ (201)
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-02-16T12:00:00Z"
  }
}

# Google OAuth (фронтенд редиректит на этот URL)
GET /api/v1/auth/google/login?return_url=/dashboard
→ { "url": "https://accounts.google.com/o/oauth2/v2/auth?...", "state": "random-string" }
```

---

## 2. Объекты недвижимости

### Типы (TypeScript)

```typescript
// ============================
// Краткий листинг (для списков)
// ============================
interface PropertyShortListing {
  id: string;
  property_type: "sale" | "rent";
  property_kind: "residential" | "commercial" | "industrial" | "land" | "other";
  category: "room" | "apartment" | "house" | "property";
  sub_category: SubcategoryCode;
  author: AuthorShort;
  location: LocationShort;
  title: string;
  slug: string;
  price: number;              // integer
  price_per_month?: number;   // только для rent
  area: number;               // integer (m²)
  area_useful?: number;       // integer
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  media: MediaResponse;
  published_at: string;       // ISO 8601
  updated_at: string;
}

// ============================
// Обогащённый листинг (с атрибутами)
// ============================
interface PropertyEnrichedListing extends PropertyShortListing {
  characteristics: Attribute[];
  amenities: Attribute[];
  tenant_preferences: Attribute[];
  tenants: Attribute[];
  short_description: string;
}

// ============================
// Детали объекта (полная карточка)
// ============================
interface PropertyDetails {
  property_type: "sale" | "rent";
  property_kind: "residential" | "commercial" | "industrial" | "land" | "other";
  category: string;            // переведённое название (напр. "Apartment")
  sub_category: string;        // переведённое (напр. "Flat")
  author: AuthorLong;
  location: LocationDetails;
  title: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords: string[];
  price: number;
  price_per_month?: number;
  area: number;
  area_useful?: number;
  area_kitchen?: number;
  rooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  total_floors: number | null;
  deposit_months?: number;
  deposit?: number;
  agency_fee?: number;
  min_term?: number;
  max_term?: number;
  description: string;
  description_original: string;   // всегда на испанском
  building_info: Attribute[];
  estate_info: Attribute[];
  energy_efficiency: Attribute[];
  characteristics: Attribute[];
  amenities: Attribute[];
  tenant_preferences: Attribute[];
  tenants: Attribute[];
  media: MediaResponse;
  published_at: string;
  updated_at: string;
}

// ============================
// Вспомогательные типы
// ============================
interface Attribute {
  label: string;        // переведённое название
  value: string;        // код (напр. "has_elevator")
  icon_type: string;    // тип иконки
}

interface AuthorShort {
  id: string;
  contact_id: string;
  name: string;
  avatar?: string;
  author_type: "owner" | "agent" | "agency";
  company_id?: string;
  company_name?: string;
  company_logo?: string;
  company_url?: string;
  is_verified: boolean;
}

interface AuthorLong extends AuthorShort {
  object_count: number;
  rating: number;
  review_count: number;
}

interface LocationShort {
  address: string;
  is_address_visible: boolean;
  coordinates: Coordinates;
  transport?: NearestStation;    // ближайшая 1 станция
}

interface LocationDetails {
  formatted_address: string;
  is_address_visible: boolean;
  coordinates: Coordinates;
  transport: NearestStation[];   // все ближайшие станции
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface NearestStation {
  station_id: number;
  name: string;
  type: string;              // "metro", "tram", "bus", etc.
  lat: number;
  lon: number;
  distance: number;          // метры
  walking_distance?: number;
  walking_duration?: number; // секунды
  lines?: TransportLine[];
}

interface TransportLine {
  id: number;
  name: string;
  ref?: string;
  type?: string;
  color?: string;
}

interface MediaResponse {
  photos: MediaItem[];
  videos: MediaItem[];
  plans: MediaItem[];
  photos_count: number;
  videos_count: number;
  plans_count: number;
}

interface MediaItem {
  id: string;
  url: string;
  type: string;             // "image" | "video" | "floor"
  width?: number;
  height?: number;
  description?: string;
}
```

### Эндпоинты

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| `GET` | `/properties/short-listing` | optional | Краткий список с фильтрами |
| `GET` | `/properties/enriched-listing` | optional | Обогащённый список с атрибутами |
| `GET` | `/properties/count` | ❌ | Количество по фильтрам |
| `GET` | `/properties/:id` | optional | Детали по UUID |
| `GET` | `/properties/by-slug/:slug` | optional | Детали по slug |
| `POST` | `/properties/:id/similar` | ❌ | Похожие объекты |
| `GET` | `/properties/tiles/:z/:x/:y.pbf` | ❌ | MVT тайлы для карты |

### Примеры запросов

```bash
# Краткий список — аренда квартир в Мадриде, до 1500€
GET /api/v1/properties/short-listing?property_types=rent&categories=2&city_ids=123&max_price=1500&sort_by=price&sort_order=asc&limit=20&language=en

# Ответ
{
  "data": [
    {
      "id": "550e8400-...",
      "property_type": "rent",
      "property_kind": "residential",
      "category": "apartment",
      "sub_category": "piso",
      "title": "Bright apartment in center",
      "slug": "bright-apartment-center-madrid",
      "price": 1200,
      "price_per_month": 1200,
      "area": 75,
      "rooms": 2,
      "bathrooms": 1,
      "floor": 3,
      "total_floors": 6,
      "author": { "id": "...", "author_type": "agency", ... },
      "location": {
        "address": "Calle Gran Vía 25, Madrid",
        "is_address_visible": true,
        "coordinates": { "lat": 40.4168, "lng": -3.7038 },
        "transport": {
          "station_id": 456,
          "name": "Gran Vía",
          "type": "metro",
          "distance": 150,
          "lines": [{ "id": 1, "name": "Línea 1", "color": "#00BFFF" }]
        }
      },
      "media": {
        "photos": [{ "id": "...", "url": "https://...", "type": "image" }],
        "videos": [],
        "plans": [],
        "photos_count": 12,
        "videos_count": 0,
        "plans_count": 0
      },
      "published_at": "2026-01-15T10:30:00Z",
      "updated_at": "2026-02-10T08:00:00Z"
    }
  ],
  "pagination": {
    "next_cursor": "cHVibGlzaGVkX2F0fGRlc2N8MTczNzAyODYwMDAwMHw1NTBlODQwMC0uLi4=",
    "has_more": true,
    "limit": 20
  }
}

# Количество объектов
GET /api/v1/properties/count?property_types=rent&categories=2&city_ids=123&max_price=1500
→ { "data": { "count": 342 } }

# Детали по slug
GET /api/v1/properties/by-slug/bright-apartment-center-madrid?language=en
→ { "data": { ... PropertyDetails ... } }

# Похожие объекты
POST /api/v1/properties/550e8400-.../similar
{ "limit": 10 }
→ { "data": [ ...PropertyShortListing[] ] }
```

---

## 3. Фильтры — Query параметры

Все фильтры передаются как query parameters в GET-запросах для `short-listing`, `enriched-listing`, `count` и `tiles`.

### Полная таблица параметров

| Параметр | Тип | Пример | Описание |
|----------|-----|--------|----------|
| `language` | string | `en` | Язык ответа: `es`, `en`, `ru`, `de`, `fr`, `it`, `pt-PT`, `uk` |
| `property_types` | string (csv) | `rent` или `sale,rent` | Тип: `sale`, `rent` |
| `property_kind_ids` | string (csv int) | `1,2` | Вид: 1=residential, 2=commercial, 3=industrial, 4=land, 5=other |
| `categories` | string (csv int) | `2,3` | Категория: 1=room, 2=apartment, 3=house |
| `sub_categories` | string (csv int) | `4,5` | Подкатегория (см. справочник ниже) |
| `country_ids` | string (csv int64) | `1` | ID стран |
| `region_ids` | string (csv int64) | `10,11` | ID регионов |
| `province_ids` | string (csv int64) | `100` | ID провинций |
| `city_ids` | string (csv int64) | `1001,1002` | ID городов |
| `district_ids` | string (csv int64) | `5001` | ID районов |
| `neighborhood_ids` | string (csv int64) | `9001` | ID кварталов |
| `min_price` | int | `500` | Минимальная цена |
| `max_price` | int | `2000` | Максимальная цена |
| `min_area` | int | `40` | Минимальная площадь (m²) |
| `max_area` | int | `200` | Максимальная площадь (m²) |
| `rooms` | string (csv int) | `1,2,3` | Количество комнат (множественный выбор) |
| `bathrooms` | string (csv int) | `1,2` | Количество ванных (множественный выбор) |
| `bbox` | string | `40.0,-3.8,40.5,-3.6` | Bounding box: `minLat,minLng,maxLat,maxLng` |
| `radius` | int | `5000` | Радиус поиска в метрах |
| `radius_lat` | float | `40.4168` | Центр радиуса — широта |
| `radius_lng` | float | `-3.7038` | Центр радиуса — долгота |
| `geojson` | string | `{"type":"Polygon",...}` | GeoJSON геометрия (inline) |
| `polygon_ids` | string (csv UUID) | `uuid1,uuid2` | ID сохранённых геометрий фильтров |
| `include_ids` | string (csv UUID) | `uuid1,uuid2` | Включить только эти объекты |
| `exclude_ids` | string (csv UUID) | `uuid1,uuid2` | Исключить эти объекты |
| `sort_by` | string | `price` | Поле сортировки |
| `sort_order` | string | `asc` | Направление: `asc` или `desc` |
| `limit` | int | `20` | Размер страницы (1–100, default: 20) |
| `cursor` | string | `cHVibGlz...` | Курсор пагинации (base64) |

### Пример комбинированного фильтра

```
GET /api/v1/properties/short-listing
  ?property_types=rent
  &categories=2
  &city_ids=1001
  &min_price=500
  &max_price=1500
  &rooms=1,2,3
  &bathrooms=1,2
  &min_area=40
  &sort_by=price
  &sort_order=asc
  &limit=20
  &language=en
```

---

## 4. Сортировка и Пагинация

### Доступные поля сортировки

| `sort_by` | Описание | Примечание |
|-----------|----------|------------|
| `published_at` | Дата публикации | **По умолчанию.** Если нет published_at, используется created_at |
| `price` | Цена | NULL значения — в конце |
| `area` | Площадь | NULL значения — в конце |
| `created_at` | Дата создания | |

### Направление сортировки

| `sort_order` | Описание |
|--------------|----------|
| `desc` | По убыванию (**по умолчанию**) |
| `asc` | По возрастанию |

### Cursor-пагинация

Бекенд использует **cursor-based pagination** (не offset). Это обеспечивает стабильную пагинацию при изменении данных.

**Как это работает:**

1. Первый запрос — без `cursor`
2. В ответе `pagination.next_cursor` содержит закодированный курсор
3. Для следующей страницы передайте `cursor=<next_cursor>`
4. Когда `has_more = false` — данных больше нет

```typescript
interface CursorPagination {
  next_cursor?: string;    // base64-encoded, передать для следующей страницы
  has_more: boolean;       // есть ли ещё данные
  limit: number;           // текущий размер страницы
}
```

**Формат курсора** (внутренний, base64):
```
sort_by|sort_order|sort_value|last_id
```

> ⚠️ **Важно:** Если `sort_by` или `sort_order` изменились — курсор игнорируется, загрузка начинается сначала.

### Пример пагинации

```typescript
// Первая страница
const page1 = await fetch('/api/v1/properties/short-listing?sort_by=price&sort_order=asc&limit=20');
// page1.pagination.next_cursor = "cHJpY2V8YXNjfDEyMDB8NTUwZTg0MDAuLi4="
// page1.pagination.has_more = true

// Вторая страница
const page2 = await fetch('/api/v1/properties/short-listing?sort_by=price&sort_order=asc&limit=20&cursor=cHJpY2V8YXNjfDEyMDB8NTUwZTg0MDAuLi4=');

// Последняя страница
// page_n.pagination.has_more = false
// page_n.pagination.next_cursor = undefined
```

---

## 5. MVT Тайлы (Карта)

### Эндпоинт

```
GET /api/v1/properties/tiles/{z}/{x}/{y}.pbf
```

**Параметры пути:**
- `z` — zoom level (0–22)
- `x` — координата X тайла
- `y` — координата Y тайла

**Query параметры:** Все те же [фильтры](#3-фильтры--query-параметры) работают и для тайлов.

**Ответ:**
- `Content-Type: application/x-protobuf`
- Бинарные данные MVT (Mapbox Vector Tiles)
- Layer name: `properties`
- `204 No Content` — если тайл пустой

**Логика кластеризации:**
- `z ≤ 15` — кластеризованные тайлы (точки группируются)
- `z > 15` — индивидуальные объекты

**Кэширование:**
- `Cache-Control: public, max-age=60`

### Пример использования с MapLibre/Mapbox

```typescript
map.addSource('properties', {
  type: 'vector',
  tiles: [
    `${API_BASE}/properties/tiles/{z}/{x}/{y}.pbf?property_types=rent&categories=2&max_price=1500`
  ],
  minzoom: 0,
  maxzoom: 22
});

map.addLayer({
  id: 'properties-points',
  type: 'circle',
  source: 'properties',
  'source-layer': 'properties',
  paint: {
    'circle-radius': 6,
    'circle-color': '#007cbf'
  }
});
```

---

## 6. Сохранённые фильтры

> 🔒 Все эндпоинты требуют авторизации

### Типы

```typescript
interface CreateFilterRequest {
  name: string;                     // required, 1-100 chars
  description?: string;             // max 500 chars
  property_types?: string[];        // ["sale", "rent"]
  property_kind_ids?: number[];     // [1, 2, 3, 4, 5]
  category_ids?: number[];
  subcategory_ids?: number[];
  country_ids?: number[];
  region_ids?: number[];
  province_ids?: number[];
  city_ids?: number[];
  district_ids?: number[];
  neighborhood_ids?: number[];
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  rooms?: number[];
  bathrooms?: number[];
  polygon_ids?: string[];           // UUID[] сохранённых геометрий
  radius_meters?: number;
  radius_lat?: number;
  radius_lng?: number;
  sort_by?: string;
  sort_order?: string;
  exclude_marker_types?: string[];  // ["hidden", "dislike"]
  language?: string;
  notificationsEnabled?: boolean;
  notificationFrequency?: "instant" | "daily" | "weekly";
}

// UpdateFilterRequest — идентична CreateFilterRequest

interface FilterResponse {
  id: string;                       // UUID
  user_id: string;
  name: string;
  description?: string;
  // ...все поля фильтра...
  notificationsEnabled: boolean;
  notificationFrequency?: string;
  timesUsed: number;
  last_used_at?: string;            // ISO 8601
  created_at: string;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/filters` | Создать фильтр |
| `GET` | `/filters` | Список фильтров пользователя |
| `GET` | `/filters/paginated?page=1&per_page=20` | Список с offset-пагинацией |
| `GET` | `/filters/:id` | Получить фильтр по ID |
| `PUT` | `/filters/:id` | Обновить фильтр |
| `DELETE` | `/filters/:id` | Удалить фильтр |
| `POST` | `/filters/:id/use` | Пометить фильтр как использованный (+1 timesUsed) |

### Пример: создание фильтра

```bash
POST /api/v1/filters
Authorization: Bearer <token>

{
  "name": "Квартиры в центре до 1500€",
  "property_types": ["rent"],
  "category_ids": [2],
  "city_ids": [1001],
  "min_price": 500,
  "max_price": 1500,
  "rooms": [1, 2, 3],
  "sort_by": "price",
  "sort_order": "asc",
  "notificationsEnabled": true,
  "notificationFrequency": "daily"
}

# Ответ (201)
{
  "data": {
    "id": "d4f5e6a7-...",
    "user_id": "user-uuid",
    "name": "Квартиры в центре до 1500€",
    "property_types": ["rent"],
    "category_ids": [2],
    "city_ids": [1001],
    "min_price": 500,
    "max_price": 1500,
    "rooms": [1, 2, 3],
    "sort_by": "price",
    "sort_order": "asc",
    "notificationsEnabled": true,
    "notificationFrequency": "daily",
    "timesUsed": 0,
    "created_at": "2026-02-16T12:00:00Z"
  }
}
```

### Применение сохранённого фильтра к запросу объектов

Фронтенд берёт параметры из `FilterResponse` и формирует query string:

```typescript
function filterToQueryString(filter: FilterResponse): string {
  const params = new URLSearchParams();
  if (filter.property_types?.length) params.set('property_types', filter.property_types.join(','));
  if (filter.category_ids?.length) params.set('categories', filter.category_ids.join(','));
  if (filter.city_ids?.length) params.set('city_ids', filter.city_ids.join(','));
  if (filter.min_price) params.set('min_price', String(filter.min_price));
  if (filter.max_price) params.set('max_price', String(filter.max_price));
  if (filter.rooms?.length) params.set('rooms', filter.rooms.join(','));
  if (filter.bathrooms?.length) params.set('bathrooms', filter.bathrooms.join(','));
  if (filter.sort_by) params.set('sort_by', filter.sort_by);
  if (filter.sort_order) params.set('sort_order', filter.sort_order);
  if (filter.polygon_ids?.length) params.set('polygon_ids', filter.polygon_ids.join(','));
  if (filter.radius_meters && filter.radius_lat && filter.radius_lng) {
    params.set('radius', String(filter.radius_meters));
    params.set('radius_lat', String(filter.radius_lat));
    params.set('radius_lng', String(filter.radius_lng));
  }
  // ...и т.д.
  return params.toString();
}
```

---

## 7. Геометрии фильтров (Полигоны)

> 🔒 Требует авторизации. Привязаны к конкретному фильтру.

### Типы

```typescript
interface CreateGeometryRequest {
  geometry: string;    // GeoJSON строка
}

interface GeometryResponse {
  id: string;          // UUID
  filter_id: string;
  geometry: string;    // GeoJSON строка
  created_at: string;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/filters/:id/geometry` | Создать геометрию для фильтра |
| `GET` | `/filters/:id/geometry` | Получить геометрию фильтра |
| `PUT` | `/filters/:id/geometry` | Обновить геометрию |
| `DELETE` | `/filters/:id/geometry` | Удалить геометрию |

### Пример: создание полигона

```bash
POST /api/v1/filters/d4f5e6a7-.../geometry
{
  "geometry": "{\"type\":\"Polygon\",\"coordinates\":[[[-3.71,40.42],[-3.69,40.42],[-3.69,40.41],[-3.71,40.41],[-3.71,40.42]]]}"
}

# Ответ (201)
{
  "data": {
    "id": "geom-uuid",
    "filter_id": "d4f5e6a7-...",
    "geometry": "{\"type\":\"Polygon\",\"coordinates\":[...]}",
    "created_at": "2026-02-16T12:00:00Z"
  }
}
```

### Использование геометрии в поиске

После создания геометрии, её `id` можно передавать в `polygon_ids`:

```
GET /api/v1/properties/short-listing?polygon_ids=geom-uuid-1,geom-uuid-2
```

Или передать GeoJSON inline через `geojson`:

```
GET /api/v1/properties/short-listing?geojson={"type":"Polygon","coordinates":[...]}
```

---

## 8. Вкладки поиска (Search Tabs)

> 🔒 Требует авторизации

Search Tabs — это сохранённые конфигурации поиска с состоянием интерфейса (режим просмотра, позиция карты и т.д.).

### Типы

```typescript
interface CreateTabRequest {
  title: string;                   // required
  description?: string;
  folder_id?: string;              // UUID папки
  icon?: string;
  color?: string;
  filters: Record<string, any>;    // JSON — параметры фильтра
  view_mode: "map" | "list";       // required
  listing_view_mode?: string;
  sort_by?: string;
  sort_order?: string;
  map_state?: Record<string, any>; // JSON — zoom, center и т.д.
  is_pinned?: boolean;
  is_default?: boolean;
}

interface UpdateTabRequest {
  title?: string;
  description?: string;
  folder_id?: string;
  icon?: string;
  color?: string;
  filters?: Record<string, any>;
  view_mode?: string;
  listing_view_mode?: string;
  sort_by?: string;
  sort_order?: string;
  map_state?: Record<string, any>;
  is_pinned?: boolean;
  is_default?: boolean;
}

interface TabResponse {
  id: string;
  userId: string;
  folderId?: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  filters: Record<string, any>;      // JSON
  viewMode: string;
  listingViewMode?: string;
  sort?: string;
  sortOrder?: string;
  mapState?: Record<string, any>;     // JSON
  isPinned: boolean;
  isDefault: boolean;
  resultsCount?: number;
  lastUsedAt: string;                 // ISO 8601
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TabsListResponse {
  data: {
    tabs: TabResponse[];
    folders: FolderResponse[];
  }
}

interface ReorderRequest {
  tabIds: string[];                   // UUID[], новый порядок
}

interface UsageRequest {
  resultsCount?: number;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/search-tabs` | Список вкладок + папки |
| `POST` | `/search-tabs` | Создать вкладку |
| `GET` | `/search-tabs/:id` | Получить вкладку |
| `PUT` | `/search-tabs/:id` | Обновить вкладку |
| `DELETE` | `/search-tabs/:id` | Удалить вкладку |
| `POST` | `/search-tabs/reorder` | Изменить порядок |
| `POST` | `/search-tabs/:id/usage` | Обновить использование |
| `GET` | `/search-tabs/templates` | Шаблоны вкладок |

### Пример

```bash
POST /api/v1/search-tabs
{
  "title": "Аренда в центре",
  "view_mode": "map",
  "filters": {
    "property_types": ["rent"],
    "category_ids": [2],
    "city_ids": [1001],
    "max_price": 1500
  },
  "map_state": {
    "zoom": 14,
    "center": { "lat": 40.4168, "lng": -3.7038 }
  },
  "is_pinned": true
}
```

---

## 9. Папки вкладок

> 🔒 Требует авторизации

```typescript
interface CreateFolderRequest {
  name: string;        // required
  icon?: string;
  color?: string;
}

interface FolderResponse {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  sortPosition: number;
  createdAt: string;
  updatedAt: string;
}
```

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/search-tabs/folders` | Создать папку |
| `PUT` | `/search-tabs/folders/:id` | Обновить папку |
| `DELETE` | `/search-tabs/folders/:id` | Удалить папку (вкладки перемещаются в корень) |

---

## 10. Автопоиск

> 🔒 Требует авторизации. Привязан к сохранённому фильтру.

### Типы

```typescript
interface CreateAutosearchRequest {
  filter_id: string;                            // UUID, required
  name: string;                                 // required, max 100
  notification_channels: ("email" | "push" | "telegram")[];  // required, min 1
  send_frequency: "instant" | "daily" | "weekly";            // required
  is_active: boolean;
}

interface UpdateAutosearchRequest {
  name?: string;
  notification_channels?: string[];
  send_frequency?: "instant" | "daily" | "weekly";
}

interface AutosearchResponse {
  id: string;
  filter_id: string;
  user_id: string;
  name: string;
  notification_channels: string[];
  send_frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AutosearchListResponse {
  items: AutosearchResponse[];
  total: number;
}

interface AutosearchStatsResponse {
  total_sent: number;
  last_sent_at?: string;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/autosearch` | Создать автопоиск |
| `GET` | `/autosearch` | Список автопоисков |
| `GET` | `/autosearch/:id` | Получить по ID |
| `PUT` | `/autosearch/:id` | Обновить |
| `DELETE` | `/autosearch/:id` | Удалить |
| `POST` | `/autosearch/:id/activate` | Активировать |
| `POST` | `/autosearch/:id/deactivate` | Деактивировать |
| `GET` | `/autosearch/:id/stats` | Статистика отправок |

### Пример

```bash
POST /api/v1/autosearch
{
  "filter_id": "d4f5e6a7-...",
  "name": "Новые квартиры в центре",
  "notification_channels": ["email", "push"],
  "send_frequency": "daily",
  "is_active": true
}
```

---

## 11. Маркеры (Markers)

> 🔒 Требует авторизации

Маркеры позволяют пользователю отмечать объекты (лайк, дизлайк, сохранить, скрыть и т.д.).

### Типы

```typescript
type MarkerType = "like" | "dislike" | "saved" | "hidden" | "to_review" | "to_think";

interface SetMarkerRequest {
  property_id: string;     // UUID, required
  marker_type: MarkerType; // required
}

interface MarkerResponse {
  id: string;
  user_id: string;
  property_id: string;
  marker_type: MarkerType;
  created_at: string;      // ISO 8601
  updated_at: string;
}

interface MarkersListResponse {
  markers: MarkerResponse[];
  total: number;
  limit: number;
  offset: number;
}

interface MarkerStatsResponse {
  like: number;
  dislike: number;
  saved: number;
  hidden: number;
  to_review: number;
  to_think: number;
}

interface PropertyIDsResponse {
  property_ids: { property_id: string; marker_type: MarkerType }[];
  total: number;
}
```

### Эндпоинты

| Метод | Путь | Query | Описание |
|-------|------|-------|----------|
| `POST` | `/markers` | — | Установить маркер (body: SetMarkerRequest) |
| `GET` | `/markers/:property_id` | — | Получить маркер для объекта |
| `DELETE` | `/markers/:property_id` | `?type=like` | Удалить маркер (тип обязателен) |
| `GET` | `/markers` | `?type=saved&limit=20&offset=0` | Список маркеров пользователя |
| `GET` | `/markers/stats` | — | Статистика по типам |
| `GET` | `/markers/property-ids` | `?types=like,saved` | ID объектов с маркерами |
| `DELETE` | `/markers` | — | Удалить все маркеры пользователя |
| `DELETE` | `/markers/type/:marker_type` | — | Удалить все маркеры определённого типа |

### Исключение маркированных объектов из поиска

Используйте `exclude_marker_types` в сохранённых фильтрах, чтобы скрыть объекты с определёнными маркерами:

```bash
# В сохранённом фильтре
{
  "name": "Мой поиск",
  "exclude_marker_types": ["hidden", "dislike"],
  ...
}
```

---

## 12. Просмотры (Views)

> 🔒 Требует авторизации

### Типы

```typescript
interface ViewResponse {
  id: string;
  user_id: string;
  property_id: string;
  viewed_at: string;
}

interface ViewListResponse {
  views: ViewResponse[];
  total: number;
  limit: number;
  offset: number;
}

interface UnviewedPropertiesRequest {
  property_ids: string[];    // UUID[]
}

interface UnviewedPropertiesResponse {
  unviewed_ids: string[];    // UUID[] — ещё не просмотренные
}

interface ViewStatsResponse {
  total_views: number;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/views/:property_id` | Записать просмотр |
| `GET` | `/views?limit=20&offset=0` | История просмотров |
| `GET` | `/views/stats` | Статистика |
| `POST` | `/views/unseen` | Проверить непросмотренные (body: property_ids[]) |
| `DELETE` | `/views` | Очистить историю |

---

## 13. Избранные профессионалы

> 🔒 Требует авторизации

```typescript
interface CreateFavProfRequest {
  contact_id: string;                        // UUID
  professional_type: "agent" | "agency";
}

interface UpdateInteractionsRequest {
  contact_requested?: boolean;
  increment_messages?: boolean;
  notes?: string;
}

interface FavoriteProfessionalResponse {
  id: string;
  user_id: string;
  contact_id: string;
  professional_type: "agent" | "agency";
  notes: string;
  contact_requested_at?: string;
  messages_count: number;
  properties_count: number;
  created_at: string;
  updated_at: string;
}
```

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/favorites/professionals` | Список избранных |
| `POST` | `/favorites/professionals` | Добавить |
| `PATCH` | `/favorites/professionals/:id/interactions` | Обновить взаимодействия |
| `DELETE` | `/favorites/professionals/:id` | Удалить |

---

## 14. Заметки к объектам

> 🔒 Требует авторизации

```typescript
interface CreateNoteRequest {
  property_id: string;
  content: string;
  tags?: string[];
  note_type: "property" | "agency";
  reminder_at?: string;          // ISO 8601
  reminder_message?: string;
}

interface UpdateNoteRequest {
  content?: string;
  tags?: string[];
}

interface PropertyNoteResponse {
  id: string;
  user_id: string;
  property_id: string;
  content: string;
  tags: string[];
  note_type: "property" | "agency";
  is_private: boolean;
  reminder?: ReminderResponse;
  created_at: string;
  updated_at: string;
}

interface ReminderResponse {
  id: string;
  note_id: string;
  remind_at: string;
  completed_at?: string;
  message: string;
  is_notified: boolean;
}
```

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/favorites/notes` | Список заметок |
| `POST` | `/favorites/notes` | Создать |
| `GET` | `/favorites/notes/:id` | Получить |
| `PUT` | `/favorites/notes/:id` | Обновить |
| `DELETE` | `/favorites/notes/:id` | Удалить |
| `POST` | `/favorites/notes/:id/reminder/complete` | Завершить напоминание |

---

## 15. Справочники (Dictionaries)

> ❌ Не требует авторизации

```typescript
interface CategoryWithTranslation {
  id: number;
  slug: string;
  sort_order: number;
  is_active: boolean;
  translated_name?: string;
}

interface SubcategoryWithTranslation {
  id: number;
  category_id: number;
  slug: string;
  sort_order: number;
  is_active: boolean;
  translated_name?: string;
}

interface AttributeWithTranslation {
  id: number;
  category: "amenity" | "characteristic" | "building" | "tenant";
  slug: string;
  name: string;
  attribute_type: "string" | "number" | "boolean" | "select" | "multi_select" | "date" | "range";
  is_filterable: boolean;
  translated_name?: string;
}
```

| Метод | Путь | Query | Описание |
|-------|------|-------|----------|
| `GET` | `/dictionaries/categories` | `?lang=en` | Все категории |
| `GET` | `/dictionaries/categories/:id/subcategories` | `?lang=en` | Подкатегории по категории |
| `GET` | `/dictionaries/attributes` | `?lang=en` | Все атрибуты |
| `GET` | `/dictionaries/attributes/:type` | `?lang=en` | Атрибуты по типу (amenity, characteristic, building, tenant) |

---

## 16. Подписки и Платежи

> 🔒 Требует авторизации

### Типы

```typescript
interface PlanResponse {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: PlanFeatures;
  isActive: boolean;
  sortPosition: number;
}

interface PlanFeatures {
  searchTabs: number;
  aiFilters: number;
  ownerAccess: boolean;
  ownerAccessMultiplier: number;
  durationDays: number;
}

interface SubscriptionResponse {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "canceled" | "expired" | "past_due";
  externalId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChangePlanRequest {
  planId: string;              // required
  paymentMethodId?: string;
}

interface CancelSubscriptionRequest {
  reason?: string;
  cancelAtPeriodEnd?: boolean;
}

interface PaymentMethodResponse {
  id: string;
  userId: string;
  type: "card" | "paypal" | "bank_transfer";
  isDefault: boolean;
  externalId?: string;
  cardData?: Record<string, any>;
  paypalData?: Record<string, any>;
  createdAt: string;
}

interface AddPaymentMethodRequest {
  type: "card" | "paypal" | "bank_transfer";  // required
  isDefault?: boolean;
  cardData?: Record<string, any>;
  paypalData?: Record<string, any>;
}

interface PaymentResponse {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: "succeeded" | "pending" | "failed" | "refunded";
  description?: string;
  planId?: string;
  paymentMethodId?: string;
  externalId?: string;
  invoiceUrl?: string;
  createdAt: string;
}

interface PaymentsListResponse {
  data: PaymentResponse[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/subscription/plans` | Список тарифных планов |
| `GET` | `/subscription/current` | Текущая подписка |
| `POST` | `/subscription/change` | Сменить план |
| `POST` | `/subscription/cancel` | Отменить подписку |
| `GET` | `/payments/history?page=1&perPage=20` | История платежей |
| `GET` | `/payments/methods` | Способы оплаты |
| `POST` | `/payments/methods` | Добавить способ |
| `DELETE` | `/payments/methods/:id` | Удалить способ |

---

## 17. Профиль пользователя

> 🔒 Требует авторизации

### Типы

```typescript
interface UserSettings {
  language?: string;              // "es", "en", "ru", etc.
  notifications_email?: boolean;
  notifications_push?: boolean;
  theme?: string;                 // "light", "dark"
  display_name?: string;
  currency?: string;              // "EUR", "USD"
  timezone?: string;
  notifications?: NotificationSettings;
}

interface NotificationSettings {
  email?: EmailNotifications;
  push?: PushNotifications;
  telegram?: TelegramNotifications;
}

interface EmailNotifications {
  newProperties: boolean;
  priceChanges: boolean;
  savedSearches: boolean;
  promotions: boolean;
  accountUpdates: boolean;
}

interface PushNotifications {
  newProperties: boolean;
  priceChanges: boolean;
  savedSearches: boolean;
  messages: boolean;
}

interface TelegramNotifications {
  enabled: boolean;
  chatId?: string;
  newProperties: boolean;
  priceChanges: boolean;
}

interface UserResponse {
  id: string;
  email: string;
  role: "user" | "admin";
  is_active: boolean;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

interface ExtendedUserResponse extends UserResponse {
  stats?: {
    savedProperties: number;
    savedSearches: number;
    viewedProperties: number;
  };
}

interface UpdateUserRequest {
  email?: string;              // valid email
  settings?: UserSettings;
}

interface UpdateNotificationsRequest {
  email?: EmailNotifications;
  push?: PushNotifications;
  telegram?: TelegramNotifications;
}
```

### Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/users/me` | Профиль текущего пользователя |
| `GET` | `/users/me/extended` | Расширенный профиль со статистикой |
| `PUT` | `/users/me` | Обновить профиль |
| `PUT` | `/users/me/notifications` | Обновить настройки уведомлений |
| `DELETE` | `/users/me` | Удалить аккаунт |
| `GET` | `/users/:id` | Профиль пользователя по ID |
| `GET` | `/users?limit=20&offset=0&role=user&is_active=true` | Список пользователей |

---

## 18. Справочник типов и категорий

### Property Type (`property_type`)

| Значение | Описание |
|----------|----------|
| `sale` | Продажа |
| `rent` | Аренда |

### Property Kind (`property_kind` / `property_kind_ids`)

| ID | Код | Описание |
|----|-----|----------|
| 1 | `residential` | Жилая |
| 2 | `commercial` | Коммерческая |
| 3 | `industrial` | Промышленная |
| 4 | `land` | Земельный участок |
| 5 | `other` | Прочее |

### Categories (`categories`)

| ID | Код | ES | EN | RU |
|----|-----|----|----|-----|
| 1 | `room` | Habitación | Room | Комната |
| 2 | `apartment` | Apartamento | Apartment | Квартира |
| 3 | `house` | Casa | House | Дом |

### Subcategories (`sub_categories`)

| ID | Код | ES | EN | RU |
|----|-----|----|----|-----|
| 1 | `single` | Habitación individual | Single Room | Одноместная |
| 2 | `double` | Habitación doble | Double Room | Двухместная |
| 3 | `shared` | Habitación compartida | Shared Room | Общая |
| 4 | `piso` | Piso | Flat | Квартира |
| 5 | `studio` | Estudio | Studio | Студия |
| 6 | `loft` | Loft | Loft | Лофт |
| 7 | `atico` | Ático | Attic | Мансарда |
| 8 | `penthouse` | Penthouse | Penthouse | Пентхаус |
| 9 | `duplex` | Dúplex | Duplex | Дуплекс |
| 10 | `triplex` | Tríplex | Triplex | Триплекс |
| 11 | `bajo` | Bajo | Ground Floor | Первый этаж |
| 12 | `entresuelo` | Entresuelo | Mezzanine | Антресоль |
| 13 | `chalet` | Chalet | Chalet | Шале |
| 14 | `villa` | Villa | Villa | Вилла |
| 15 | `townhouse` | Casa adosada | Townhouse | Таунхаус |
| 16 | `pareado` | Pareado | Semi-detached | Парный дом |
| 17 | `adosado` | Adosado | Terraced | Смежный дом |
| 18 | `independiente` | Independiente | Detached | Отдельный дом |
| 19 | `rustico` | Rústico | Rustic | Загородный |
| 20 | `finca` | Finca | Country Estate | Усадьба |
| 21 | `cortijo` | Cortijo | Farmhouse | Фермерский дом |
| 22 | `masia` | Masía | Farmstead | Масия |

### Marker Types

| Значение | Описание |
|----------|----------|
| `like` | Нравится |
| `dislike` | Не нравится |
| `saved` | Сохранено |
| `hidden` | Скрыто |
| `to_review` | На проверку |
| `to_think` | Подумать |

### Поддерживаемые языки

| Код | Язык |
|-----|------|
| `es` | Испанский (по умолчанию) |
| `en` | Английский |
| `ru` | Русский |
| `de` | Немецкий |
| `fr` | Французский |
| `it` | Итальянский |
| `pt-PT` | Португальский |
| `uk` | Украинский |
| `en-GB` | Английский (Великобритания) |

---

## 19. Обработка ошибок

### Формат ошибки

```typescript
interface ErrorResponse {
  error: string;       // код ошибки
  message: string;     // человекочитаемое сообщение
}
```

### HTTP коды

| Код | Описание |
|-----|----------|
| `200` | Успех |
| `201` | Создано |
| `204` | Пустой контент (напр. пустой тайл) |
| `400` | Неверный запрос / валидация |
| `401` | Не авторизован |
| `403` | Запрещено (нет прав) |
| `404` | Не найдено |
| `429` | Слишком много запросов (rate limit) |
| `500` | Внутренняя ошибка сервера |

### Примеры ошибок

```json
// 400 - Неверный формат
{ "error": "bad_request", "message": "Invalid property ID format" }

// 401 - Не авторизован
{ "error": "unauthorized", "message": "Invalid user session" }

// 404 - Не найден
{ "error": "not_found", "message": "Property not found" }

// 429 - Rate limit
{ "error": "too_many_requests", "message": "Rate limit exceeded" }
```

---

## Сводная таблица всех эндпоинтов

### Публичные (без авторизации)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/health` | Проверка здоровья |
| `GET` | `/ready` | Readiness check |
| `POST` | `/auth/register` | Регистрация |
| `POST` | `/auth/login` | Вход |
| `POST` | `/auth/refresh` | Обновление токена |
| `GET` | `/auth/google/login` | Google OAuth URL |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `POST` | `/auth/facebook` | Facebook вход |
| `POST` | `/auth/password/reset-request` | Запрос сброса пароля |
| `POST` | `/auth/password/reset` | Сброс пароля |
| `GET` | `/properties/short-listing` | Краткий список *(auth optional)* |
| `GET` | `/properties/enriched-listing` | Обогащённый список *(auth optional)* |
| `GET` | `/properties/count` | Количество |
| `GET` | `/properties/:id` | Детали по ID *(auth optional)* |
| `GET` | `/properties/by-slug/:slug` | Детали по slug *(auth optional)* |
| `POST` | `/properties/:id/similar` | Похожие |
| `GET` | `/properties/tiles/:z/:x/:y.pbf` | MVT тайлы |
| `GET` | `/dictionaries/categories` | Категории |
| `GET` | `/dictionaries/categories/:id/subcategories` | Подкатегории |
| `GET` | `/dictionaries/attributes` | Атрибуты |
| `GET` | `/dictionaries/attributes/:type` | Атрибуты по типу |

### Защищённые (требуют авторизации)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/auth/logout` | Выход |
| `POST` | `/auth/logout-all` | Выход со всех устройств |
| `POST` | `/auth/password/change` | Смена пароля |
| `GET` | `/auth/sessions` | Активные сессии |
| `GET` | `/auth/me` | Текущий пользователь |
| `GET` | `/users/me` | Профиль |
| `GET` | `/users/me/extended` | Расширенный профиль |
| `PUT` | `/users/me` | Обновить профиль |
| `PUT` | `/users/me/notifications` | Обновить уведомления |
| `DELETE` | `/users/me` | Удалить аккаунт |
| `POST` | `/filters` | Создать фильтр |
| `GET` | `/filters` | Список фильтров |
| `GET` | `/filters/paginated` | Фильтры с пагинацией |
| `GET` | `/filters/:id` | Получить фильтр |
| `PUT` | `/filters/:id` | Обновить фильтр |
| `DELETE` | `/filters/:id` | Удалить фильтр |
| `POST` | `/filters/:id/use` | Использовать фильтр |
| `POST` | `/filters/:id/geometry` | Создать геометрию |
| `GET` | `/filters/:id/geometry` | Получить геометрию |
| `PUT` | `/filters/:id/geometry` | Обновить геометрию |
| `DELETE` | `/filters/:id/geometry` | Удалить геометрию |
| `GET` | `/search-tabs` | Список вкладок |
| `POST` | `/search-tabs` | Создать вкладку |
| `GET` | `/search-tabs/:id` | Получить вкладку |
| `PUT` | `/search-tabs/:id` | Обновить вкладку |
| `DELETE` | `/search-tabs/:id` | Удалить вкладку |
| `POST` | `/search-tabs/reorder` | Изменить порядок |
| `POST` | `/search-tabs/:id/usage` | Обновить использование |
| `GET` | `/search-tabs/templates` | Шаблоны |
| `POST` | `/search-tabs/folders` | Создать папку |
| `PUT` | `/search-tabs/folders/:id` | Обновить папку |
| `DELETE` | `/search-tabs/folders/:id` | Удалить папку |
| `POST` | `/autosearch` | Создать автопоиск |
| `GET` | `/autosearch` | Список |
| `GET` | `/autosearch/:id` | По ID |
| `PUT` | `/autosearch/:id` | Обновить |
| `DELETE` | `/autosearch/:id` | Удалить |
| `POST` | `/autosearch/:id/activate` | Активировать |
| `POST` | `/autosearch/:id/deactivate` | Деактивировать |
| `GET` | `/autosearch/:id/stats` | Статистика |
| `POST` | `/markers` | Установить маркер |
| `GET` | `/markers` | Список маркеров |
| `GET` | `/markers/:property_id` | Маркер для объекта |
| `DELETE` | `/markers/:property_id` | Удалить маркер |
| `GET` | `/markers/stats` | Статистика маркеров |
| `GET` | `/markers/property-ids` | ID объектов |
| `DELETE` | `/markers` | Удалить все маркеры |
| `DELETE` | `/markers/type/:marker_type` | Удалить по типу |
| `POST` | `/views/:property_id` | Записать просмотр |
| `GET` | `/views` | История просмотров |
| `GET` | `/views/stats` | Статистика |
| `POST` | `/views/unseen` | Непросмотренные |
| `DELETE` | `/views` | Очистить историю |
| `GET` | `/favorites/professionals` | Избранные профессионалы |
| `POST` | `/favorites/professionals` | Добавить |
| `PATCH` | `/favorites/professionals/:id/interactions` | Обновить |
| `DELETE` | `/favorites/professionals/:id` | Удалить |
| `GET` | `/favorites/notes` | Список заметок |
| `POST` | `/favorites/notes` | Создать |
| `GET` | `/favorites/notes/:id` | Получить |
| `PUT` | `/favorites/notes/:id` | Обновить |
| `DELETE` | `/favorites/notes/:id` | Удалить |
| `POST` | `/favorites/notes/:id/reminder/complete` | Завершить напоминание |
| `GET` | `/subscription/plans` | Планы |
| `GET` | `/subscription/current` | Текущая подписка |
| `POST` | `/subscription/change` | Сменить план |
| `POST` | `/subscription/cancel` | Отменить |
| `GET` | `/payments/history` | История платежей |
| `GET` | `/payments/methods` | Способы оплаты |
| `POST` | `/payments/methods` | Добавить способ |
| `DELETE` | `/payments/methods/:id` | Удалить способ |
