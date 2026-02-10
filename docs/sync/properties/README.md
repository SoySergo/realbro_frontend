# Объекты недвижимости — Документация для синхронизации с бекендом

## Обзор

Система отображения объектов недвижимости поддерживает два основных режима:
1. **Map View** — отображение на карте с PBF tiles
2. **List View** — отображение списком/сеткой

В обоих режимах поддерживается:
- Фильтрация
- Сортировка
- Пагинация / Infinite scroll
- Взаимодействие с объектами (клик, ховер, лайк, дизлайк)

---

## Типы данных

### Property (Основной тип объекта недвижимости)

```typescript
interface Property {
  // Основная информация
  id: string;
  title: string;
  type: PropertyType;
  
  // Финансовые данные
  price: number;
  pricePerMeter?: number;
  currency?: string; // По умолчанию: EUR
  
  // Характеристики
  rooms: number;
  bathrooms: number;
  area: number;              // Общая площадь
  livingArea?: number;       // Жилая площадь
  kitchenArea?: number;      // Площадь кухни
  floor?: number;
  totalFloors?: number;
  
  // Локация
  address: string;
  country?: string;
  region?: string;
  province?: string;
  city: string;
  district?: string;
  neighborhood?: string;
  street?: string;
  houseNumber?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  
  // Описание и медиа
  description: string;
  descriptionOriginal?: string; // Оригинальное описание на языке публикации
  images: string[];
  video?: PropertyVideo;
  floorPlan?: string;
  tour3d?: PropertyTour3D;
  
  // Характеристики и удобства
  features: PropertyFeature[];
  amenities?: string[];
  
  // Детали здания
  building?: BuildingInfo;
  
  // Детали квартиры
  elevator?: boolean;
  ceilingHeight?: number;
  renovation?: RenovationType;
  bathroomType?: BathroomType;
  balconyCount?: number;
  loggia?: boolean;
  windowView?: WindowViewType;
  
  // Транспорт
  nearbyTransport?: NearbyTransport;
  nearbyTransportList?: NearbyTransport[];
  
  // Условия аренды
  rentalConditions?: RentalConditions;
  
  // Предпочтения по арендаторам
  tenantPreferences?: TenantPreferences;
  
  // Автор объявления
  author?: PropertyAuthor;
  
  // Статусы
  isNew?: boolean;
  isVerified?: boolean;
  noCommission?: boolean;
  exclusive?: boolean;
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  viewsCount?: number;
  viewsToday?: number;
  favoritesCount?: number;
}

type PropertyType = 
  | 'apartment'
  | 'studio'
  | 'room'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'townhouse'
  | 'duplex'
  | 'office'
  | 'retail'
  | 'warehouse'
  | 'restaurant'
  | 'hotel'
  | 'land';

type PropertyFeature =
  | 'parking'
  | 'elevator'
  | 'terrace'
  | 'balcony'
  | 'airConditioning'
  | 'heating'
  | 'furnished'
  | 'petFriendly'
  | 'pool'
  | 'garden';
```

**Вложенные типы:**

```typescript
interface PropertyVideo {
  url: string;
  thumbnail: string;
  duration?: number; // В секундах
}

interface PropertyTour3D {
  url: string;
  thumbnail: string;
  provider?: 'matterport' | 'other';
}

interface BuildingInfo {
  name?: string;
  year?: number;
  type?: 'brick' | 'monolith' | 'panel' | 'block' | 'wood';
  floorsTotal?: number;
  elevatorPassenger?: number;
  elevatorFreight?: number;
  parkingType?: ParkingType;
  closedTerritory?: boolean;
  concierge?: boolean;
  garbageChute?: boolean;
}

interface NearbyTransport {
  type: 'metro' | 'train' | 'bus';
  name: string;
  line?: string;
  color?: string;
  walkMinutes: number;
}

interface RentalConditions {
  deposit?: number;
  commission?: number;
  commissionType?: 'percent' | 'fixed';
  prepaymentMonths?: number;
  minRentalMonths?: number;
  utilitiesIncluded?: boolean;
  utilitiesAmount?: number;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
  smokingAllowed?: boolean;
}

interface TenantPreferences {
  minRentalMonths?: number;
  prepaymentMonths?: number;
  petsAllowed?: boolean;
  childrenAllowed?: boolean;
  ageRange?: [number, number];
  gender?: 'male' | 'female' | 'any';
  occupation?: 'student' | 'worker' | 'any';
  couplesAllowed?: boolean;
  smokingAllowed?: boolean;
}

interface PropertyAuthor {
  id: string;
  name: string;
  avatar?: string;
  type: 'agent' | 'owner' | 'agency';
  agencyName?: string;
  agencyLogo?: string;
  isVerified?: boolean;
  isSuperAgent?: boolean;
  phone?: string;
  yearsOnPlatform?: number;
  objectsCount?: number;
  showOnline?: boolean;
}
```

---

## API Endpoints

### 1. Получение списка объектов (List View)

**Endpoint:** `GET /api/properties`

**Query параметры:**

```typescript
interface PropertiesListRequest {
  // Фильтры (из docs/sync/filters/README.md)
  ...SearchFiltersRequest;
  
  // Пагинация
  page?: number;      // Номер страницы (начиная с 1)
  limit?: number;     // Количество объектов (по умолчанию: 20, максимум: 100)
  
  // Язык
  lang?: string;      // 'ru', 'en', 'es', 'ca', etc.
}
```

**Response:**

```typescript
interface PropertiesListResponse {
  properties: Property[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  meta?: {
    queryTime: number; // Время выполнения запроса (мс)
  };
}
```

**Пример запроса:**

```
GET /api/properties?
  adminLevel8=123&
  propertyCategory=apartment,studio&
  minPrice=500&
  maxPrice=1500&
  rooms=1,2&
  sort=price&
  sortOrder=asc&
  page=1&
  limit=20&
  lang=ru
```

---

### 2. Получение объектов для карты

#### 2.1 PBF Vector Tiles (для отображения маркеров)

**Endpoint:** `GET /api/properties/tiles/{z}/{x}/{y}.pbf`

**Query параметры:**

```typescript
interface TilesRequest {
  ...SearchFiltersRequest; // Все фильтры
}
```

**Формат ответа:** Mapbox Vector Tiles (MVT) в формате PBF

**Слои:**

1. **properties** — точки объектов недвижимости
2. **clusters** — кластеры (опционально, если включена кластеризация)

**Свойства features в слое `properties`:**

```typescript
interface PropertyTileFeature {
  id: string;
  price: number;
  lng: number;
  lat: number;
  category: PropertyType;
  rooms?: number;
  area?: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isNew?: boolean;
  isVerified?: boolean;
  noCommission?: boolean;
}
```

**Свойства features в слое `clusters`:**

```typescript
interface ClusterTileFeature {
  cluster: true;
  cluster_id: string;
  point_count: number;
  lng: number;
  lat: number;
}
```

**Пример запроса:**

```
GET /api/properties/tiles/12/2048/1536.pbf?
  adminLevel8=123&
  minPrice=500&
  maxPrice=1500
```

**Спецификация слоя для Mapbox GL:**

```typescript
// Source
map.addSource('properties', {
  type: 'vector',
  tiles: ['/api/properties/tiles/{z}/{x}/{y}.pbf?filters...'],
  minzoom: 0,
  maxzoom: 18,
});

// Layer для единичных объектов
map.addLayer({
  id: 'properties-markers',
  type: 'circle',
  source: 'properties',
  'source-layer': 'properties',
  filter: ['!', ['has', 'cluster']],
  paint: {
    'circle-radius': 8,
    'circle-color': '#3b82f6',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
});

// Layer для кластеров
map.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'properties',
  'source-layer': 'clusters',
  filter: ['has', 'cluster'],
  paint: {
    'circle-radius': 20,
    'circle-color': '#ef4444',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  },
});
```

#### 2.2 Объекты в видимой области карты (для сайдбара)

**Endpoint:** `POST /api/properties/viewport`

**Request body:**

```typescript
interface ViewportRequest {
  ...SearchFiltersRequest; // Все фильтры
  
  // Видимая область карты
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  
  // Пагинация
  page?: number;
  limit?: number; // По умолчанию: 20
  
  // Язык
  lang?: string;
}
```

**Response:** Аналогично `PropertiesListResponse`

**Пример запроса:**

```json
POST /api/properties/viewport

{
  "bbox": [2.1, 41.35, 2.2, 41.42],
  "adminLevel8": [123],
  "propertyCategory": ["apartment"],
  "minPrice": 500,
  "maxPrice": 1500,
  "page": 1,
  "limit": 20,
  "lang": "ru"
}
```

**Особенности:**

- Используется для отображения списка в сайдбаре при работе с картой
- Автоматически обновляется при изменении видимой области карты (с debounce 300ms)
- Поддерживает infinite scroll

---

### 3. Получение объектов кластера

**Endpoint:** `POST /api/properties/cluster`

**Request body:**

```typescript
interface ClusterRequest {
  ids: string[]; // IDs объектов в кластере
  lang?: string;
}
```

**Response:**

```typescript
interface ClusterResponse {
  properties: Property[];
}
```

**Пример запроса:**

```json
POST /api/properties/cluster

{
  "ids": ["prop-123", "prop-456", "prop-789"],
  "lang": "ru"
}
```

**Использование:**

- Вызывается при клике на кластер на карте
- Объекты отображаются в сайдбаре
- Показывается кнопка "Отменить выборку кластера"
- При клике на кнопку — возврат к обычному отображению всех объектов в области

---

### 4. Получение деталей объекта

**Endpoint:** `GET /api/properties/:id`

**Query параметры:**

```typescript
interface PropertyDetailRequest {
  lang?: string;
}
```

**Response:**

```typescript
interface PropertyDetailResponse {
  property: Property;
}
```

**Пример запроса:**

```
GET /api/properties/prop-123?lang=ru
```

---

### 5. Подсчет количества объектов (для UI)

**Endpoint:** `POST /api/properties/count`

**Request body:**

```typescript
interface CountRequest {
  ...SearchFiltersRequest; // Все фильтры
}
```

**Response:**

```typescript
interface CountResponse {
  count: number;
}
```

**Использование:**

- Отображение количества объектов в UI фильтров
- Обновление счетчика при изменении фильтров (с debounce 500ms)

---

## Взаимодействие с объектами

### Лайки/дизлайки

**Endpoint:** `POST /api/properties/:id/reaction`

**Request body:**

```typescript
interface ReactionRequest {
  reaction: 'like' | 'dislike' | 'none';
}
```

**Response:**

```typescript
interface ReactionResponse {
  success: boolean;
  property: {
    id: string;
    isLiked: boolean;
    isDisliked: boolean;
  };
}
```

**Использование:**

- Лайк/дизлайк на карточке объекта
- Синхронизация состояния с бекендом
- Обновление UI в реальном времени

---

## Отображение на карте

### Стилизация маркеров

**Единичные объекты:**

```typescript
// Компонент маркера с ценой
interface PropertyMarkerProps {
  property: PropertyTileFeature;
  isHovered: boolean;
  isSelected: boolean;
}

// Стили
const markerStyles = {
  base: 'bg-white dark:bg-background-secondary border-2 border-border rounded-lg px-2 py-1',
  hovered: 'border-brand-primary shadow-lg scale-110',
  selected: 'border-brand-primary bg-brand-primary-light',
};
```

**HTML маркер:**

```html
<div class="property-marker">
  <div class="price">€{price}</div>
</div>
```

**Кластеры:**

```typescript
interface ClusterMarkerProps {
  count: number;
  isHovered: boolean;
}

// Размер зависит от количества объектов
const getClusterSize = (count: number) => {
  if (count < 10) return 'small'; // 40px
  if (count < 50) return 'medium'; // 60px
  return 'large'; // 80px
};
```

---

### Попап с информацией

**При клике на маркер:**

```typescript
interface PropertyPopupProps {
  propertyId: string;
}

// Содержимое попапа
interface PopupContent {
  image: string;
  title: string;
  price: number;
  rooms: number;
  area: number;
  address: string;
  features: PropertyFeature[];
}
```

**API для загрузки данных попапа:**

```
GET /api/properties/:id/popup?lang=ru
```

**Response:**

```typescript
interface PopupResponse {
  property: PopupContent;
}
```

---

## Infinite Scroll

**Механизм:**

1. Загружается первая страница (20 объектов)
2. При прокрутке до 80% списка — запрос следующей страницы
3. Новые объекты добавляются к существующим
4. Состояние загрузки показывается внизу списка

**Реализация:**

```typescript
const loadNextPage = async () => {
  if (isLoading || !hasNextPage) return;
  
  setIsLoading(true);
  const nextPage = currentPage + 1;
  
  const response = await getPropertiesList({
    ...filters,
    page: nextPage,
    limit: 20,
  });
  
  setProperties([...properties, ...response.properties]);
  setCurrentPage(nextPage);
  setHasNextPage(response.pagination.hasNextPage);
  setIsLoading(false);
};

// Threshold: 80%
const threshold = 0.8;
```

---

## Сортировка

**Доступные опции:**

```typescript
type SortBy = 'createdAt' | 'price' | 'area';
type SortOrder = 'asc' | 'desc';

interface SortOption {
  value: SortBy;
  label: string; // Локализованная метка
  defaultOrder: SortOrder;
}

const sortOptions: SortOption[] = [
  { value: 'createdAt', label: 'По дате', defaultOrder: 'desc' },
  { value: 'price', label: 'По цене', defaultOrder: 'asc' },
  { value: 'area', label: 'По площади', defaultOrder: 'desc' },
];
```

**UI:**

- Dropdown с выбором поля сортировки
- Кнопка переключения направления (asc/desc)
- Иконки: ArrowUpDown (общая), ChevronUp (asc), ChevronDown (desc)

---

## Кеширование

**Стратегия:**

```typescript
interface CacheConfig {
  // Cache key формируется из фильтров + page + sort
  keyFormat: 'properties:{filters}:{page}:{sort}';
  
  // TTL: 5 минут
  ttl: 300;
  
  // Invalidation при изменении фильтров
  invalidateOn: 'filterChange';
}
```

**Реализация на фронтенде:**

```typescript
// React Query / SWR
const { data, isLoading } = useQuery({
  queryKey: ['properties', filters, page, sort],
  queryFn: () => getPropertiesList({ ...filters, page, sort }),
  staleTime: 5 * 60 * 1000, // 5 минут
  cacheTime: 10 * 60 * 1000, // 10 минут
});
```

---

## Оптимизация производительности

### Виртуализация списка

Используется `react-window` для рендеринга только видимых объектов:

```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={properties.length}
  itemSize={440} // Высота карточки
  width="100%"
>
  {({ index, style }) => (
    <PropertyCard
      property={properties[index]}
      style={style}
    />
  )}
</List>
```

### Debounce для запросов

```typescript
// Изменение фильтров
const debouncedFetchCount = useDebouncedCallback(
  (filters) => fetchPropertiesCount(filters),
  500 // 500ms
);

// Изменение viewport карты
const debouncedFetchViewport = useDebouncedCallback(
  (bbox) => fetchViewportProperties(bbox),
  300 // 300ms
);
```

### Lazy loading изображений

```typescript
import Image from 'next/image';

<Image
  src={property.images[0]}
  alt={property.title}
  width={320}
  height={240}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder.jpg"
/>
```

---

## Обработка ошибок

**Типы ошибок:**

```typescript
interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Коды ошибок
enum ErrorCode {
  INVALID_FILTERS = 'INVALID_FILTERS',
  TOO_MANY_RESULTS = 'TOO_MANY_RESULTS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
}
```

**Обработка на фронтенде:**

```typescript
try {
  const response = await getPropertiesList(filters);
  // ...
} catch (error) {
  if (error.code === ErrorCode.INVALID_FILTERS) {
    showToast('Некорректные фильтры', 'error');
  } else if (error.code === ErrorCode.TOO_MANY_RESULTS) {
    showToast('Слишком много результатов. Уточните фильтры.', 'warning');
  } else {
    showToast('Ошибка загрузки объектов', 'error');
  }
}
```

---

## Мокирование

**Файлы:**

- `src/shared/api/mocks/properties-mock.ts` — генератор данных
- `src/app/api/properties/route.ts` — API route
- `src/app/api/properties/tiles/[z]/[x]/[y]/route.ts` — tiles

**Переключение:**

```typescript
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

const getPropertiesList = async (params: PropertiesListRequest) => {
  if (USE_MOCK_API) {
    return getMockProperties(params);
  }
  
  const response = await fetch('/api/properties', {
    method: 'GET',
    // ...
  });
  
  return response.json();
};
```

---

## Мониторинг и аналитика

**События для трекинга:**

```typescript
enum PropertyEvent {
  VIEW_LIST = 'property.view_list',
  VIEW_MAP = 'property.view_map',
  CLICK_CARD = 'property.click_card',
  CLICK_MARKER = 'property.click_marker',
  HOVER_MARKER = 'property.hover_marker',
  LIKE = 'property.like',
  DISLIKE = 'property.dislike',
  SHARE = 'property.share',
  CONTACT = 'property.contact',
}
```

**Отправка событий:**

```typescript
trackEvent(PropertyEvent.VIEW_LIST, {
  filters: currentFilters,
  resultsCount: properties.length,
  page: currentPage,
});
```
