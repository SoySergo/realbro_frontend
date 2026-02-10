# Фильтры — Документация для синхронизации с бекендом

## Обзор

Система фильтрации разделена на две основные категории:
1. **Location фильтры** — географическая фильтрация (полигоны, радиус, изохроны, административные единицы)
2. **Property фильтры** — характеристики недвижимости (цена, площадь, комнаты, категория и т.д.)

## Структура фильтров

### 1. Location Filters (Географические фильтры)

#### 1.1 Административные единицы (OSM Admin Levels)

Используется система OSM admin_level для иерархии локаций:

- `admin_level=2` — Страны (country)
- `admin_level=4` — Регионы (region)
- `admin_level=6` — Провинции (province)
- `admin_level=7` — Крупные города (major city)
- `admin_level=8` — Города (city)
- `admin_level=9` — Районы (district)
- `admin_level=10` — Кварталы/микрорайоны (neighborhood)

**Формат данных для отправки:**

```typescript
interface LocationAdminFilter {
  adminLevel2?: number[];  // IDs стран
  adminLevel4?: number[];  // IDs регионов
  adminLevel6?: number[];  // IDs провинций
  adminLevel7?: number[];  // IDs крупных городов
  adminLevel8?: number[];  // IDs городов
  adminLevel9?: number[];  // IDs районов
  adminLevel10?: number[]; // IDs кварталов
  
  // Мета-информация для восстановления границ на карте
  locationsMeta?: LocationMeta[];
}

interface LocationMeta {
  id: number;           // ID в базе данных
  wikidata?: string;    // Wikidata ID (например, "Q1492" для Барселоны)
  adminLevel?: number;  // Уровень административной единицы
  osmId?: number;       // OSM ID (опционально)
}
```

**Пример запроса:**

```json
{
  "adminLevel8": [123, 456],
  "adminLevel9": [789],
  "locationsMeta": [
    { "id": 123, "wikidata": "Q1492", "adminLevel": 8 },
    { "id": 456, "wikidata": "Q8717", "adminLevel": 8 },
    { "id": 789, "wikidata": "Q15682", "adminLevel": 9 }
  ]
}
```

#### 1.2 Полигоны (Draw Mode)

Пользователь рисует произвольные области на карте. Полигоны сохраняются в БД и возвращается ID.

**Формат данных для сохранения:**

```typescript
interface SavePolygonRequest {
  name?: string;              // Название полигона (опционально)
  geometry: {
    type: "Polygon";
    coordinates: number[][][]; // GeoJSON coordinates [[[lng, lat], ...]]
  };
}

interface SavePolygonResponse {
  id: number;                 // ID сохраненного полигона
  name?: string;
  geometry: GeoJSON;
}
```

**Формат данных для фильтрации:**

```typescript
interface PolygonFilter {
  geometryIds: number[];      // IDs сохраненных полигонов
}
```

**API Endpoints:**

- `POST /api/geometries` — Сохранить новый полигон
- `GET /api/geometries/:id` — Получить полигон по ID
- `DELETE /api/geometries/:id` — Удалить полигон
- `GET /api/geometries` — Получить список сохраненных полигонов пользователя

#### 1.3 Радиус (Radius Mode)

Поиск в радиусе от заданной точки.

**Формат данных:**

```typescript
interface RadiusFilter {
  radiusCenter: [number, number]; // [lng, lat]
  radiusKm: number;               // Радиус в километрах
}
```

**Пример:**

```json
{
  "radiusCenter": [2.1734, 41.3851],
  "radiusKm": 5
}
```

#### 1.4 Изохроны (Isochrone Mode)

Поиск в зоне досягаемости за определенное время.

**Формат данных для сохранения:**

```typescript
interface SaveIsochroneRequest {
  name?: string;
  center: [number, number];     // [lng, lat]
  minutes: number;              // 5, 10, 15, 20, 30, 45, 60
  profile: 'walking' | 'cycling' | 'driving';
}

interface SaveIsochroneResponse {
  id: number;
  geometry: GeoJSON;            // Polygon из Mapbox Isochrone API
}
```

**Формат данных для фильтрации:**

```typescript
interface IsochroneFilter {
  isochroneCenter: [number, number];
  isochroneMinutes: number;
  isochroneProfile: 'walking' | 'cycling' | 'driving';
}
```

**Или использование сохраненной изохроны:**

```typescript
interface IsochroneFilter {
  geometryIds: number[];  // ID сохраненной изохроны (как полигон)
}
```

**API Endpoints:**

- `POST /api/isochrones` — Сохранить изохрону (генерируется через Mapbox API)
- `GET /api/isochrones/:id` — Получить изохрону по ID

---

### 2. Property Filters (Фильтры характеристик недвижимости)

#### 2.1 Основные фильтры

**Формат данных:**

```typescript
interface PropertyFilters {
  // Тип поиска
  searchType: 'properties' | 'professionals';  // По умолчанию: 'properties'
  
  // Тип сделки
  dealType?: 'rent' | 'sale';                  // По умолчанию: 'rent'
  
  // Класс недвижимости
  propertyClass?: 'residential' | 'commercial'; // По умолчанию: 'residential'
  
  // Категории (для жилой недвижимости)
  propertyCategory?: PropertyCategory[];
  categoryIds?: number[];  // Альтернативный формат через IDs
  
  // Цена
  minPrice?: number;
  maxPrice?: number;
  
  // Комнаты
  rooms?: number[];  // Например: [1, 2, 3] или [4] для "4+"
  
  // Площадь (м²)
  minArea?: number;
  maxArea?: number;
  
  // Тип маркеров на карте (для фильтрации по лайкам/дизлайкам)
  markerType?: 'all' | 'view' | 'no_view' | 'like' | 'dislike';
  
  // Сортировка
  sort?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  
  // Язык (берется из локали)
  lang?: string;  // 'ru', 'en', 'es', 'ca', etc.
}

type PropertyCategory = 
  // Жилая недвижимость
  | 'apartment'
  | 'room'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'townhouse'
  | 'studio'
  // Коммерческая недвижимость
  | 'office'
  | 'retail'
  | 'warehouse'
  | 'restaurant'
  | 'hotel'
  | 'land';
```

**Значения по умолчанию (не отображаются в UI на начальном этапе):**

- `searchType: 'properties'`
- `dealType: 'rent'`
- `propertyClass: 'residential'`

**Отображаемые фильтры:**

- Категория (`propertyCategory`) — квартиры, дома, комнаты
- Цена (`minPrice`, `maxPrice`)
- Комнаты (`rooms`)
- Площадь (`minArea`, `maxArea`)

---

### 3. Полный формат запроса фильтрации

**Объединение location и property фильтров:**

```typescript
interface SearchFiltersRequest {
  // Location фильтры (выбирается один из режимов)
  
  // Режим 1: Административные единицы
  adminLevel2?: number[];
  adminLevel4?: number[];
  adminLevel6?: number[];
  adminLevel7?: number[];
  adminLevel8?: number[];
  adminLevel9?: number[];
  adminLevel10?: number[];
  locationsMeta?: LocationMeta[];
  
  // Режим 2: Полигоны
  geometryIds?: number[];
  
  // Режим 3: Радиус
  radiusCenter?: [number, number];
  radiusKm?: number;
  
  // Режим 4: Изохрона
  isochroneCenter?: [number, number];
  isochroneMinutes?: number;
  isochroneProfile?: 'walking' | 'cycling' | 'driving';
  
  // Property фильтры
  searchType?: 'properties' | 'professionals';
  dealType?: 'rent' | 'sale';
  propertyClass?: 'residential' | 'commercial';
  propertyCategory?: PropertyCategory[];
  categoryIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  rooms?: number[];
  minArea?: number;
  maxArea?: number;
  markerType?: 'all' | 'view' | 'no_view' | 'like' | 'dislike';
  sort?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  lang?: string;
}
```

---

## API Endpoints

### Фильтрация объектов

#### 1. Получение списка объектов (List View)

**Endpoint:** `GET /api/properties`

**Query параметры:** Все параметры из `SearchFiltersRequest` + пагинация

**Дополнительные параметры:**

```typescript
interface ListRequest extends SearchFiltersRequest {
  page?: number;     // Номер страницы (начиная с 1)
  limit?: number;    // Количество объектов на странице (по умолчанию: 20)
}
```

**Response:**

```typescript
interface ListResponse {
  properties: Property[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

#### 2. Получение объектов для карты (Map View)

##### 2.1 PBF Tiles (для отображения маркеров)

**Endpoint:** `GET /api/properties/tiles/{z}/{x}/{y}.pbf`

**Query параметры:** Все параметры из `SearchFiltersRequest`

**Формат ответа:** Vector tiles в формате PBF (Mapbox Vector Tiles)

**Слои в тайле:**

- `properties` — точки объектов недвижимости
- `clusters` — кластеры объектов (опционально)

**Свойства feature в слое `properties`:**

```typescript
interface PropertyFeatureProperties {
  id: string;          // ID объекта
  price: number;       // Цена для отображения
  lng: number;         // Долгота
  lat: number;         // Широта
  category: string;    // Категория (для стилизации маркера)
  isLiked?: boolean;   // Лайкнут ли объект
  isDisliked?: boolean; // Дизлайкнут ли объект
}
```

**Свойства feature в слое `clusters`:**

```typescript
interface ClusterFeatureProperties {
  cluster: true;
  cluster_id: string;  // ID кластера
  point_count: number; // Количество объектов в кластере
  lng: number;
  lat: number;
}
```

##### 2.2 Объекты в видимой области (для сайдбара)

**Endpoint:** `POST /api/properties/viewport`

**Request body:**

```typescript
interface ViewportRequest extends SearchFiltersRequest {
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  page?: number;
  limit?: number;  // По умолчанию: 20
}
```

**Response:** Аналогично `ListResponse`

#### 3. Получение объектов кластера

**Endpoint:** `POST /api/properties/cluster`

**Request body:**

```typescript
interface ClusterRequest {
  ids: string[];  // IDs объектов в кластере
}
```

**Response:**

```typescript
interface ClusterResponse {
  properties: Property[];
}
```

---

## Сохранение и восстановление фильтров

### URL State

Фильтры синхронизируются с URL для возможности шаринга:

**Пример URL:**

```
/ru/search?
  adminLevel8=123,456&
  minPrice=500&
  maxPrice=2000&
  rooms=2,3&
  propertyCategory=apartment,house&
  sort=price&
  sortOrder=asc
```

**Кодирование:**

- Массивы: через запятую (`rooms=1,2,3`)
- Координаты: через запятую (`radiusCenter=2.1734,41.3851`)
- locationsMeta: JSON.stringify + encodeURIComponent

### LocalStorage

Используется для:

1. Сохранения нарисованных полигонов (`savedPolygons`)
2. Сохранения локальных состояний режимов location фильтров

**Ключи:**

- `filter-store` — основное состояние Zustand store
- `local-location-states` — локальные состояния режимов location фильтров

---

## Приоритет режимов location фильтров

Если указано несколько режимов одновременно, используется следующий приоритет:

1. `geometryIds` (полигоны/изохроны)
2. `radiusCenter` + `radiusKm`
3. `isochroneCenter` + `isochroneMinutes` + `isochroneProfile`
4. `adminLevel*` (административные единицы)

На фронтенде UI позволяет выбрать только один режим за раз.

---

## Мокирование на фронтенде

Для работы без бекенда используются моки:

**Файлы:**

- `src/shared/api/mocks/properties-mock.ts` — генерация объектов
- `src/app/api/properties/route.ts` — API route с моками

**Переключение:**

Через ENV переменную: `NEXT_PUBLIC_USE_MOCK_API=true`

Когда `false` — все запросы уходят на реальный бекенд.

---

## Валидация на фронтенде

Используется Zod для валидации:

**Схемы:**

```typescript
import { z } from 'zod';

const locationAdminFilterSchema = z.object({
  adminLevel2: z.array(z.number()).optional(),
  adminLevel4: z.array(z.number()).optional(),
  adminLevel6: z.array(z.number()).optional(),
  adminLevel7: z.array(z.number()).optional(),
  adminLevel8: z.array(z.number()).optional(),
  adminLevel9: z.array(z.number()).optional(),
  adminLevel10: z.array(z.number()).optional(),
  locationsMeta: z.array(z.object({
    id: z.number(),
    wikidata: z.string().optional(),
    adminLevel: z.number().optional(),
  })).optional(),
});

const propertyFiltersSchema = z.object({
  searchType: z.enum(['properties', 'professionals']).optional(),
  dealType: z.enum(['rent', 'sale']).optional(),
  propertyClass: z.enum(['residential', 'commercial']).optional(),
  propertyCategory: z.array(z.string()).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rooms: z.array(z.number().min(1)).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  markerType: z.enum(['all', 'view', 'no_view', 'like', 'dislike']).optional(),
  sort: z.enum(['createdAt', 'price', 'area']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
```

---

## Примеры использования

### Пример 1: Поиск квартир в Барселоне с ценой 500-1500€

**Request:**

```json
{
  "adminLevel8": [123],
  "locationsMeta": [
    { "id": 123, "wikidata": "Q1492", "adminLevel": 8 }
  ],
  "dealType": "rent",
  "propertyClass": "residential",
  "propertyCategory": ["apartment"],
  "minPrice": 500,
  "maxPrice": 1500,
  "rooms": [1, 2],
  "page": 1,
  "limit": 20
}
```

### Пример 2: Поиск в радиусе 3км от точки

**Request:**

```json
{
  "radiusCenter": [2.1734, 41.3851],
  "radiusKm": 3,
  "propertyCategory": ["apartment", "studio"],
  "minPrice": 400,
  "maxPrice": 1000
}
```

### Пример 3: Поиск в нарисованном полигоне

**Request:**

```json
{
  "geometryIds": [456, 789],
  "propertyCategory": ["house", "villa"],
  "minArea": 100,
  "maxArea": 300
}
```

---

## Дополнительные требования

### Performance

- Запросы к API должны быть дебаунснуты (300ms)
- Результаты кешируются на 5 минут
- Infinite scroll использует cursor-based pagination для больших датасетов

### Безопасность

- Все параметры должны валидироваться на бекенде
- Геометрии должны быть привязаны к пользователю
- Rate limiting: 100 запросов в минуту на пользователя

### Monitoring

- Логировать все поисковые запросы для аналитики
- Отслеживать популярные фильтры и локации
- Мониторить время ответа API

---

## Обновления и миграция

При изменении структуры фильтров:

1. Сохранять обратную совместимость
2. Deprecated поля помечать в документации
3. Поддерживать старые URL параметры минимум 6 месяцев
4. Автоматическая миграция старых сохраненных фильтров
