# Детали объекта недвижимости — Документация для синхронизации с бекендом

## Обзор

Страница детального просмотра объекта недвижимости (`/[locale]/property/[slug]`) загружает данные из нескольких источников:

1. **Основные данные объекта** — получение по slug вместо ID
2. **Контакты владельца/агента** — отдельный защищенный запрос
3. **Объекты на карте** (транспорт, POI) — из сервиса локаций в формате PBF
4. **Карточки nearby places** — ленивая подгрузка по 10 штук при прокрутке
5. **Другие объекты агента** — отдельный запрос
6. **Похожие объекты** — отдельный запрос на основе характеристик
7. **Действия пользователя** — лайк, дизлайк, заметка, жалоба
8. **Навигация по объектам** — next/previous при переходе из листинга с фильтрами

---

## 1. Получение объекта по slug

### Endpoint

```
GET /api/properties/by-slug/:slug
```

### Query параметры

```typescript
interface PropertyBySlugRequest {
  lang?: string; // 'ru', 'en', 'es', 'ca', 'fr', 'it', 'pt', 'de'
}
```

### Response

```typescript
interface PropertyBySlugResponse {
  success: true;
  data: Property;
  meta: {
    timestamp: string;
    requestId: string;
  };
}
```

### Примеры

**Запрос:**
```
GET /api/properties/by-slug/apartment-barcelona-eixample-123?lang=ru
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "prop-123",
    "slug": "apartment-barcelona-eixample-123",
    "title": "Квартира в Эшампле",
    "type": "apartment",
    "price": 1200,
    "rooms": 2,
    "bathrooms": 1,
    "area": 65,
    "coordinates": { "lat": 41.3874, "lng": 2.1686 },
    "address": "Carrer de Provença, 123",
    "city": "Barcelona",
    "district": "Eixample",
    "description": "Светлая квартира в центре...",
    "images": ["url1", "url2"],
    "features": ["parking", "elevator"],
    "author": {
      "id": "agent-456",
      "name": "María García",
      "type": "agent",
      "isVerified": true
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-02-10T14:20:00Z",
    "viewsCount": 245,
    "viewsToday": 12
  }
}
```

### Обработка ошибок

```typescript
// 404 - объект не найден
{
  "success": false,
  "error": {
    "code": "PROPERTY_NOT_FOUND",
    "message": "Property with slug 'apartment-xyz' not found"
  }
}

// 400 - невалидный slug
{
  "success": false,
  "error": {
    "code": "INVALID_SLUG",
    "message": "Slug format is invalid"
  }
}
```

### Фронтенд-реализация

```typescript
// src/shared/api/properties-server.ts
export async function getPropertyBySlugServer(
  slug: string,
  lang?: string
): Promise<Property | null> {
  if (FEATURES.USE_MOCK_PROPERTIES) {
    // Мок: генерируем объект из slug
    return generateMockPropertyFromSlug(slug);
  }

  try {
    const params = new URLSearchParams();
    if (lang) params.set('lang', lang);
    
    const response = await fetch(
      `${API_BASE}/properties/by-slug/${slug}?${params}`,
      { next: { revalidate: 21600 } } // ISR: 6 часов
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error(`[API] Failed to get property by slug ${slug}:`, error);
    return null;
  }
}
```

### Генерация slug на бекенде

**Правила:**
- Формат: `{type}-{city}-{district}-{uniqueId}`
- Транслитерация кириллицы в латиницу
- Замена пробелов на дефисы
- Lowercase
- Удаление специальных символов

**Примеры:**
```
apartment-barcelona-eixample-123
studio-barcelona-gracia-456
house-sitges-center-789
```

---

## 2. Контакты владельца/агента

### Endpoint

```
POST /api/properties/:id/contacts
```

### Request body

```typescript
interface ContactsRequest {
  propertyId: string;
  authorId: string;
  authorType: 'owner' | 'agent' | 'agency';
}
```

### Headers

```
Authorization: Bearer <jwt_token>
```

### Response

```typescript
interface ContactsResponse {
  success: boolean;
  data?: {
    phone: string;
    whatsapp?: string;
    telegram?: string;
    email?: string;
    website?: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
      type: 'owner' | 'agent' | 'agency';
      agencyName?: string;
      isVerified: boolean;
    };
  };
  error?: {
    code: 'AUTH_REQUIRED' | 'LIMIT_EXCEEDED' | 'SUBSCRIPTION_REQUIRED';
    message: string;
    limit?: {
      current: number;
      max: number;
      resetAt: string; // ISO date
    };
  };
}
```

### Логика доступа

**Неавторизованные пользователи:**
- Владельцы: требуется авторизация
- Агентства: до 5 просмотров (localStorage)
- Агенты: требуется авторизация

**Авторизованные (free тариф):**
- Владельцы: 5 просмотров/день
- Агенты: 10 просмотров/день
- Агентства: 20 просмотров/день

**Premium тарифы:**
- Standard: x2 лимит
- Maximum: безлимит

### Примеры

**Успешный запрос:**
```json
{
  "success": true,
  "data": {
    "phone": "+34 612 345 678",
    "whatsapp": "+34 612 345 678",
    "telegram": "@agent_maria",
    "email": "maria@agency.com",
    "author": {
      "id": "agent-456",
      "name": "María García",
      "avatar": "https://...",
      "type": "agent",
      "agencyName": "Barcelona Homes",
      "isVerified": true
    }
  }
}
```

**Лимит исчерпан:**
```json
{
  "success": false,
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Daily contact view limit exceeded",
    "limit": {
      "current": 5,
      "max": 5,
      "resetAt": "2024-02-11T00:00:00Z"
    }
  }
}
```

### Фронтенд-реализация

```typescript
// src/shared/api/contacts.ts
export async function getContactAccess(
  propertyId: string,
  authorId: string,
  authorType: 'owner' | 'agent' | 'agency',
  options: {
    isAuthenticated: boolean;
    userTariff?: 'free' | 'standard' | 'maximum';
  }
): Promise<ContactsResponse> {
  // Проверка кэша в localStorage
  const cached = getContactsFromCache(propertyId);
  if (cached) {
    return { success: true, data: cached };
  }

  try {
    const response = await fetch(`/api/properties/${propertyId}/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ propertyId, authorId, authorType }),
    });

    const result = await response.json();
    
    if (result.success && result.data) {
      // Сохранить в кэш
      saveContactsToCache(propertyId, result.data);
    }
    
    return result;
  } catch (error) {
    console.error('[API] Failed to get contacts:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to load contacts',
      },
    };
  }
}
```

---

## 3. Объекты на карте (транспорт, POI) — PBF формат

### Endpoint

```
GET /api/locations/tiles/:propertyId/{z}/{x}/{y}.pbf
```

### Query параметры

```typescript
interface LocationTilesRequest {
  categories?: string[]; // ['transport', 'schools', 'medical', ...]
  radius?: number;       // радиус поиска в метрах (default: 1000)
  lang?: string;
}
```

### PBF Vector Tiles

**Источник:** Внешний сервис локаций (например, Overture Maps, OSM)

**Слои (layers):**

1. **transport** — станции транспорта
2. **schools** — школы
3. **medical** — медицинские учреждения
4. **groceries** — продуктовые магазины
5. **shopping** — торговые центры
6. **restaurants** — рестораны
7. **sports** — спортивные объекты
8. **parks** — парки
9. **beauty** — салоны красоты
10. **entertainment** — развлечения
11. **attractions** — достопримечательности

### Свойства features в слое `transport`

```typescript
interface TransportFeature {
  id: string;
  name: string;
  type: 'metro' | 'train' | 'bus' | 'tram';
  lines: Array<{
    id: string;
    name: string;
    color: string;
    type: 'metro' | 'train' | 'bus' | 'tram';
  }>;
  distance: number;    // метры от объекта
  walkTime: number;    // минуты пешком
  coordinates: [number, number]; // [lng, lat]
}
```

### Свойства features в слоях POI

```typescript
interface POIFeature {
  id: string;
  name: string;
  type: string;        // подтип (e.g., 'supermarket', 'pharmacy')
  distance: number;
  walkTime: number;
  rating?: number;
  address?: string;
  coordinates: [number, number];
}
```

### Пример запроса

```
GET /api/locations/tiles/prop-123/15/16384/12288.pbf?
  categories=transport,schools,medical&
  radius=1500&
  lang=ru
```

### Фронтенд-реализация (Mapbox GL)

```typescript
// Добавление source для locations tiles
map.addSource('nearby-locations', {
  type: 'vector',
  tiles: [
    `/api/locations/tiles/${propertyId}/{z}/{x}/{y}.pbf?categories=transport,schools,medical&radius=1500`
  ],
  minzoom: 12,
  maxzoom: 18,
});

// Layer для транспорта
map.addLayer({
  id: 'transport-markers',
  type: 'symbol',
  source: 'nearby-locations',
  'source-layer': 'transport',
  layout: {
    'icon-image': [
      'match',
      ['get', 'type'],
      'metro', 'metro-icon',
      'train', 'train-icon',
      'bus', 'bus-icon',
      'tram', 'tram-icon',
      'default-icon'
    ],
    'icon-size': 1,
    'icon-allow-overlap': true,
    'text-field': ['get', 'name'],
    'text-offset': [0, 1.5],
    'text-anchor': 'top',
  },
  paint: {
    'text-color': '#333',
    'text-halo-color': '#fff',
    'text-halo-width': 2,
  },
});

// Popup при клике
map.on('click', 'transport-markers', (e) => {
  const feature = e.features[0];
  const { name, lines, walkTime } = feature.properties;
  
  // Показать popup с информацией о станции
  showTransportPopup({
    name,
    lines: JSON.parse(lines),
    walkTime,
    coordinates: feature.geometry.coordinates,
  });
});
```

### Отображение линий транспорта при ховере

```typescript
// При ховере на станцию
map.on('mouseenter', 'transport-markers', (e) => {
  const feature = e.features[0];
  const lines = JSON.parse(feature.properties.lines);
  
  // Показать линии
  lines.forEach(line => {
    // Добавить layer с линией на карту
    addLineToMap(line.id, line.coordinates, line.color);
  });
  
  // Изменить курсор
  map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'transport-markers', () => {
  // Убрать линии
  removeAllLinesFromMap();
  map.getCanvas().style.cursor = '';
});
```

---

## 4. Карточки nearby places — ленивая подгрузка

### Endpoint

```
GET /api/properties/:id/nearby/:category
```

### Query параметры

```typescript
interface NearbyPlacesRequest {
  category: 
    | 'transport'
    | 'schools'
    | 'medical'
    | 'groceries'
    | 'shopping'
    | 'restaurants'
    | 'sports'
    | 'parks'
    | 'beauty'
    | 'entertainment'
    | 'attractions';
  page?: number;       // default: 1
  limit?: number;      // default: 10, max: 50
  radius?: number;     // метры, default: 1000
  sortBy?: 'distance' | 'rating'; // default: 'distance'
  lang?: string;
}
```

### Response

```typescript
interface NearbyPlacesResponse {
  success: true;
  data: Array<{
    id: string;
    name: string;
    type: string;
    distance: number;      // метры
    walkTime: number;      // минуты
    address?: string;
    rating?: number;
    openingHours?: string;
    phone?: string;
    website?: string;
    priceLevel?: 1 | 2 | 3 | 4;
    cuisine?: string;      // для ресторанов
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}
```

### Примеры

**Запрос:**
```
GET /api/properties/prop-123/nearby/restaurants?
  page=1&
  limit=10&
  radius=1500&
  sortBy=rating&
  lang=ru
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "poi-789",
      "name": "La Paradeta",
      "type": "seafood_restaurant",
      "distance": 320,
      "walkTime": 4,
      "address": "Carrer del Consell de Cent, 287",
      "rating": 4.5,
      "openingHours": "12:00-23:00",
      "phone": "+34 934 12 34 56",
      "priceLevel": 2,
      "cuisine": "Seafood",
      "coordinates": { "lat": 41.3881, "lng": 2.1677 }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "hasNextPage": true
  }
}
```

### Фронтенд-реализация — Infinite Scroll

```typescript
// src/widgets/property-location-section/model/use-nearby-places.ts
import { useInfiniteQuery } from '@tanstack/react-query';

interface UseNearbyPlacesParams {
  propertyId: string;
  category: NearbyPlaceCategory;
  radius?: number;
  enabled: boolean; // загружать только для активной категории
}

export function useNearbyPlaces({
  propertyId,
  category,
  radius = 1500,
  enabled,
}: UseNearbyPlacesParams) {
  return useInfiniteQuery({
    queryKey: ['nearby-places', propertyId, category, radius],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `/api/properties/${propertyId}/nearby/${category}?` +
        `page=${pageParam}&limit=10&radius=${radius}&sortBy=distance`
      );
      return response.json();
    },
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNextPage 
        ? lastPage.pagination.page + 1 
        : undefined,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
```

**Использование в компоненте:**

```tsx
// src/widgets/property-location-section/ui/nearby-category-list.tsx
export function NearbyCategoryList({ propertyId, category }: Props) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useNearbyPlaces({
    propertyId,
    category,
    enabled: true,
  });

  // Все страницы в один массив
  const places = data?.pages.flatMap(page => page.data) ?? [];

  // Intersection Observer для автоподгрузки
  const { ref: loadMoreRef } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  return (
    <div className="space-y-2">
      {places.map(place => (
        <NearbyPlaceCard key={place.id} place={place} />
      ))}
      
      {/* Триггер для подгрузки */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="py-4 text-center">
          {isFetchingNextPage ? (
            <Spinner size="sm" />
          ) : (
            <span className="text-text-secondary">
              Прокрутите для загрузки еще
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

### Оптимизация

- Загружаем только для активной вкладки (enabled)
- Кэш на 5 минут
- Предзагрузка первых 10 элементов вместе с основным запросом
- Виртуализация списка для больших объемов (>50 элементов)

---

## 5. Другие объекты агента

### Endpoint

```
GET /api/agents/:agentId/properties
```

### Query параметры

```typescript
interface AgentPropertiesRequest {
  excludePropertyId?: string; // исключить текущий объект
  limit?: number;             // default: 6, max: 20
  dealType?: 'rent' | 'sale'; // фильтр по типу сделки
  sortBy?: 'createdAt' | 'price'; // default: 'createdAt'
  lang?: string;
}
```

### Response

```typescript
interface AgentPropertiesResponse {
  success: true;
  data: {
    agent: {
      id: string;
      name: string;
      avatar?: string;
      agencyName?: string;
      isVerified: boolean;
      totalProperties: number; // всего объектов у агента
    };
    properties: PropertyCard[]; // упрощенная версия Property
  };
}

interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  price: number;
  rooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  address: string;
  city: string;
  district?: string;
  coordinates: { lat: number; lng: number; };
  images: string[];
  isNew?: boolean;
  isVerified?: boolean;
  createdAt: Date;
}
```

### Пример запроса

```
GET /api/agents/agent-456/properties?
  excludePropertyId=prop-123&
  limit=6&
  dealType=rent&
  sortBy=createdAt&
  lang=ru
```

### Фронтенд-реализация

```typescript
// src/shared/api/agents.ts
export async function getAgentProperties(
  agentId: string,
  excludePropertyId?: string,
  limit: number = 6
): Promise<PropertyCard[]> {
  if (USE_MOCKS) {
    return loadMockAgentProperties();
  }

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      sortBy: 'createdAt',
    });
    
    if (excludePropertyId) {
      params.set('excludePropertyId', excludePropertyId);
    }

    const response = await fetch(
      `${API_BASE}/agents/${agentId}/properties?${params}`,
      { next: { revalidate: 3600 } } // ISR: 1 час
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data.properties;
  } catch (error) {
    console.error('[API] Failed to get agent properties:', error);
    return [];
  }
}
```

---

## 6. Похожие объекты

### Endpoint

```
GET /api/properties/:id/similar
```

### Query параметры

```typescript
interface SimilarPropertiesRequest {
  limit?: number;  // default: 6, max: 20
  lang?: string;
}
```

### Логика подбора похожих объектов

Бекенд подбирает похожие объекты на основе:

1. **Тип недвижимости** (обязательно совпадает)
2. **Район/город** (приоритет: тот же район > тот же город)
3. **Цена** (±30% от текущей)
4. **Количество комнат** (±1 комната)
5. **Площадь** (±20% от текущей)
6. **Рейтинг релевантности** (ML-алгоритм на бекенде)

### Response

Аналогичен `AgentPropertiesResponse`, но вместо информации об агенте:

```typescript
interface SimilarPropertiesResponse {
  success: true;
  data: {
    properties: PropertyCard[];
    matchCriteria: {
      type: boolean;
      location: boolean;
      priceRange: boolean;
      rooms: boolean;
      area: boolean;
    };
  };
}
```

### Пример запроса

```
GET /api/properties/prop-123/similar?limit=6&lang=ru
```

### Фронтенд-реализация

```typescript
// src/shared/api/properties.ts
export async function getSimilarProperties(
  propertyId: string,
  limit: number = 6
): Promise<PropertyCard[]> {
  if (USE_MOCKS) {
    return loadMockSimilarProperties();
  }

  try {
    const params = new URLSearchParams({
      limit: String(limit),
    });

    const response = await fetch(
      `${API_BASE}/properties/${propertyId}/similar?${params}`,
      { next: { revalidate: 3600 } } // ISR: 1 час
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = await response.json();
    return data.properties;
  } catch (error) {
    console.error('[API] Failed to get similar properties:', error);
    return [];
  }
}
```

---

## 7. Действия пользователя

### 7.1 Лайк / Дизлайк

#### Endpoint

```
POST /api/properties/:id/reaction
```

#### Request body

```typescript
interface ReactionRequest {
  reaction: 'like' | 'dislike' | 'none'; // 'none' для удаления реакции
}
```

#### Headers

```
Authorization: Bearer <jwt_token>
```

#### Response

```typescript
interface ReactionResponse {
  success: boolean;
  data?: {
    propertyId: string;
    reaction: 'like' | 'dislike' | 'none';
    updatedAt: string; // ISO date
  };
  error?: {
    code: 'AUTH_REQUIRED' | 'PROPERTY_NOT_FOUND';
    message: string;
  };
}
```

#### Фронтенд-реализация

```typescript
// src/shared/api/reactions.ts
export async function setPropertyReaction(
  propertyId: string,
  reaction: 'like' | 'dislike' | 'none'
): Promise<ReactionResponse> {
  // Оптимистичное обновление localStorage
  updateLocalReaction(propertyId, reaction);

  try {
    const response = await fetch(`/api/properties/${propertyId}/reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ reaction }),
    });

    return await response.json();
  } catch (error) {
    // Откат в localStorage при ошибке
    revertLocalReaction(propertyId);
    console.error('[API] Failed to set reaction:', error);
    return {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to save reaction',
      },
    };
  }
}
```

---

### 7.2 Заметка

#### Endpoint

```
POST /api/properties/:id/note
```

#### Request body

```typescript
interface NoteRequest {
  note: string; // max 500 символов
}
```

#### Response

```typescript
interface NoteResponse {
  success: boolean;
  data?: {
    propertyId: string;
    note: string;
    createdAt: string;
    updatedAt: string;
  };
  error?: {
    code: 'AUTH_REQUIRED' | 'NOTE_TOO_LONG' | 'PROPERTY_NOT_FOUND';
    message: string;
  };
}
```

#### Получение заметки

```
GET /api/properties/:id/note
```

#### Удаление заметки

```
DELETE /api/properties/:id/note
```

---

### 7.3 Жалоба

#### Endpoint

```
POST /api/properties/:id/report
```

#### Request body

```typescript
interface ReportRequest {
  reason: 
    | 'spam'
    | 'fraud'
    | 'incorrect_info'
    | 'offensive_content'
    | 'duplicate'
    | 'other';
  description?: string; // опционально для 'other'
  email?: string;       // для обратной связи
}
```

#### Response

```typescript
interface ReportResponse {
  success: boolean;
  data?: {
    reportId: string;
    status: 'pending' | 'reviewed';
    createdAt: string;
  };
  error?: {
    code: 'RATE_LIMIT_EXCEEDED' | 'INVALID_REASON';
    message: string;
  };
}
```

#### Лимиты

- Неавторизованные: 1 жалоба в день с одного IP
- Авторизованные: 5 жалоб в день

#### Фронтенд-реализация

```typescript
// src/features/report-complaint/model/use-report.ts
export function useReportComplaint() {
  const [isOpen, setIsOpen] = useState(false);

  const submitReport = async (
    propertyId: string,
    reason: ReportReason,
    description?: string
  ) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ reason, description }),
      });

      const result = await response.json();
      
      if (result.success) {
        showToast('Жалоба отправлена. Спасибо!', 'success');
        setIsOpen(false);
      } else {
        showToast(result.error.message, 'error');
      }
      
      return result;
    } catch (error) {
      console.error('[API] Failed to submit report:', error);
      showToast('Не удалось отправить жалобу', 'error');
      return { success: false };
    }
  };

  return { isOpen, setIsOpen, submitReport };
}
```

---

## 8. Навигация по объектам (next/prev)

### Контекст

При переходе на страницу объекта **из листинга с фильтрами**, пользователь должен иметь возможность:
- Переключаться на следующий/предыдущий объект
- Сохранять контекст фильтров
- Видеть позицию в списке (например, "3 из 47")

### URL структура

```
/ru/property/apartment-barcelona-eixample-123?
  from=listing&
  filters=eyJtaW5QcmljZSI6NTAwfQ==&  // base64 encoded filters
  index=2&                             // индекс в списке (0-based)
  total=47                             // общее количество
```

### Получение контекста навигации

#### Endpoint

```
POST /api/properties/navigation-context
```

#### Request body

```typescript
interface NavigationContextRequest {
  currentPropertyId: string;
  filters: SearchFilters;      // фильтры из листинга
  sortBy?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
}
```

#### Response

```typescript
interface NavigationContextResponse {
  success: true;
  data: {
    currentIndex: number;      // 0-based
    totalCount: number;
    previousProperty?: {
      id: string;
      slug: string;
      title: string;
    };
    nextProperty?: {
      id: string;
      slug: string;
      title: string;
    };
  };
}
```

### Примеры

**Запрос:**
```json
{
  "currentPropertyId": "prop-123",
  "filters": {
    "adminLevel8": [123],
    "minPrice": 500,
    "maxPrice": 1500,
    "rooms": [2, 3]
  },
  "sortBy": "price",
  "sortOrder": "asc"
}
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "currentIndex": 2,
    "totalCount": 47,
    "previousProperty": {
      "id": "prop-122",
      "slug": "apartment-barcelona-eixample-122",
      "title": "Квартира 2 комнаты"
    },
    "nextProperty": {
      "id": "prop-124",
      "slug": "apartment-barcelona-eixample-124",
      "title": "Квартира 3 комнаты"
    }
  }
}
```

### Фронтенд-реализация

#### Сохранение контекста в URL

```typescript
// src/features/property-navigation/model/use-navigation-context.ts
import { useSearchParams } from 'next/navigation';

export function useNavigationContext() {
  const searchParams = useSearchParams();
  
  const hasContext = searchParams.get('from') === 'listing';
  const encodedFilters = searchParams.get('filters');
  const index = parseInt(searchParams.get('index') || '0');
  const total = parseInt(searchParams.get('total') || '0');
  
  const filters = encodedFilters 
    ? JSON.parse(atob(encodedFilters))
    : null;
  
  return {
    hasContext,
    filters,
    index,
    total,
  };
}
```

#### Получение previous/next

```typescript
// src/features/property-navigation/model/use-property-navigation.ts
import { useQuery } from '@tanstack/react-query';

export function usePropertyNavigation(
  propertyId: string,
  filters?: SearchFilters
) {
  return useQuery({
    queryKey: ['property-navigation', propertyId, filters],
    queryFn: async () => {
      if (!filters) return null;
      
      const response = await fetch('/api/properties/navigation-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPropertyId: propertyId,
          filters,
        }),
      });
      
      return response.json();
    },
    enabled: !!filters,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
}
```

#### Компонент навигации в хедере

```tsx
// src/widgets/property-detail-header/ui/navigation-controls.tsx
export function NavigationControls({ propertyId }: Props) {
  const router = useRouter();
  const { hasContext, filters, index, total } = useNavigationContext();
  const { data: navData } = usePropertyNavigation(propertyId, filters);
  
  if (!hasContext || !navData?.data) return null;
  
  const { previousProperty, nextProperty, currentIndex, totalCount } = navData.data;
  
  // Формирование URL для навигации
  const buildNavUrl = (slug: string, newIndex: number) => {
    const params = new URLSearchParams({
      from: 'listing',
      filters: btoa(JSON.stringify(filters)),
      index: String(newIndex),
      total: String(totalCount),
    });
    return `/${locale}/property/${slug}?${params}`;
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Предыдущий */}
      <button
        onClick={() => previousProperty && router.push(
          buildNavUrl(previousProperty.slug, currentIndex - 1)
        )}
        disabled={!previousProperty}
        className="p-2 rounded hover:bg-background-secondary disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {/* Позиция */}
      <span className="text-sm text-text-secondary">
        {currentIndex + 1} / {totalCount}
      </span>
      
      {/* Следующий */}
      <button
        onClick={() => nextProperty && router.push(
          buildNavUrl(nextProperty.slug, currentIndex + 1)
        )}
        disabled={!nextProperty}
        className="p-2 rounded hover:bg-background-secondary disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Вернуться к листингу */}
      <button
        onClick={() => {
          const params = new URLSearchParams({
            filters: btoa(JSON.stringify(filters)),
          });
          router.push(`/${locale}/search?${params}`);
        }}
        className="ml-2 text-sm text-brand-primary hover:underline"
      >
        {t('backToList')}
      </button>
    </div>
  );
}
```

### Оптимизация

- **Предзагрузка** следующего объекта при переходе на текущий
- **Кэш** контекста навигации на 5 минут
- **Debounce** при быстром переключении между объектами
- **Keyboard navigation**: стрелки влево/вправо для переключения

```typescript
// Предзагрузка следующего
useEffect(() => {
  if (nextProperty?.slug) {
    router.prefetch(`/${locale}/property/${nextProperty.slug}`);
  }
}, [nextProperty, router, locale]);

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && previousProperty) {
      router.push(buildNavUrl(previousProperty.slug, currentIndex - 1));
    }
    if (e.key === 'ArrowRight' && nextProperty) {
      router.push(buildNavUrl(nextProperty.slug, currentIndex + 1));
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [previousProperty, nextProperty, currentIndex]);
```

---

## 9. Типы данных

### Property (полный тип)

Используется тип из `src/entities/property/model/types.ts`:

```typescript
interface Property {
  id: string;
  slug: string;                // новое поле!
  title: string;
  type: PropertyType;
  price: number;
  rooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  address: string;
  city: string;
  district?: string;
  coordinates: { lat: number; lng: number; };
  description: string;
  features: PropertyFeature[];
  images: string[];
  author?: PropertyAuthor;
  createdAt: Date;
  updatedAt: Date;
  viewsCount?: number;
  viewsToday?: number;
  // ... остальные поля (см. types.ts)
}
```

### PropertyCard (упрощенный)

Для списков (агент, похожие):

```typescript
interface PropertyCard {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  price: number;
  rooms: number;
  bathrooms: number;
  area: number;
  floor?: number;
  totalFloors?: number;
  address: string;
  city: string;
  district?: string;
  coordinates: { lat: number; lng: number; };
  images: string[];
  isNew?: boolean;
  isVerified?: boolean;
  createdAt: Date;
}
```

---

## 10. Обработка ошибок

### Коды ошибок

```typescript
enum PropertyDetailErrorCode {
  // Property
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  INVALID_SLUG = 'INVALID_SLUG',
  
  // Contacts
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  
  // Actions
  REACTION_FAILED = 'REACTION_FAILED',
  NOTE_TOO_LONG = 'NOTE_TOO_LONG',
  REPORT_LIMIT_EXCEEDED = 'REPORT_LIMIT_EXCEEDED',
  
  // Nearby
  LOCATION_SERVICE_UNAVAILABLE = 'LOCATION_SERVICE_UNAVAILABLE',
  
  // General
  SERVER_ERROR = 'SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}
```

### Обработка на фронтенде

```typescript
// src/shared/lib/handle-property-error.ts
export function handlePropertyDetailError(error: ApiError) {
  switch (error.code) {
    case PropertyDetailErrorCode.PROPERTY_NOT_FOUND:
      // Редирект на 404
      router.push('/404');
      break;
      
    case PropertyDetailErrorCode.AUTH_REQUIRED:
      showToast('Требуется авторизация', 'warning');
      // Открыть модалку авторизации
      openAuthModal();
      break;
      
    case PropertyDetailErrorCode.LIMIT_EXCEEDED:
      showToast(
        `Лимит просмотров исчерпан. Обновится ${formatDate(error.details.resetAt)}`,
        'warning'
      );
      break;
      
    case PropertyDetailErrorCode.LOCATION_SERVICE_UNAVAILABLE:
      // Показать заглушку вместо карты
      showLocationServiceError();
      break;
      
    default:
      showToast('Произошла ошибка. Попробуйте позже.', 'error');
      logError(error);
  }
}
```

---

## 11. Переключение между моками и реальным API

### ENV конфигурация

```env
# .env.local

# Использовать моки для property detail
NEXT_PUBLIC_USE_MOCKS=true

# API URLs
NEXT_PUBLIC_API_URL=https://api.realbro.com
NEXT_PUBLIC_LOCATIONS_API_URL=https://locations-api.realbro.com
```

### Условная логика

```typescript
// src/shared/api/config.ts
export const API_CONFIG = {
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === 'true',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  locationsApiUrl: process.env.NEXT_PUBLIC_LOCATIONS_API_URL || 'http://localhost:3002',
};

// src/shared/api/properties-server.ts
export async function getPropertyBySlugServer(slug: string) {
  if (API_CONFIG.useMocks) {
    return generateMockPropertyFromSlug(slug);
  }
  
  // Real API
  const response = await fetch(`${API_CONFIG.apiUrl}/properties/by-slug/${slug}`);
  // ...
}
```

---

## 12. Кеширование и ISR

### Стратегия

| Ресурс | Revalidate | Invalidation |
|--------|------------|--------------|
| Property detail | 6 часов | При обновлении объекта |
| Nearby places (PBF) | 24 часа | При изменении POI |
| Nearby cards | 1 час | При изменении POI |
| Agent properties | 1 час | При добавлении/удалении объектов |
| Similar properties | 1 час | При изменении алгоритма |
| Navigation context | 5 минут | При изменении фильтров |
| Contacts | Нет кэша | - |
| Actions | Нет кэша | - |

### Next.js ISR

```typescript
// В Server Component
export const revalidate = 21600; // 6 часов

// В fetch
fetch(url, {
  next: { revalidate: 3600 } // 1 час
});
```

### Client-side кэш (React Query)

```typescript
// src/shared/api/config.ts
export const QUERY_CONFIG = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 минут
      cacheTime: 10 * 60 * 1000,     // 10 минут
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
};
```

---

## 13. Мониторинг и аналитика

### События для трекинга

```typescript
enum PropertyDetailEvent {
  // Просмотр
  VIEW_PROPERTY = 'property_detail.view',
  VIEW_GALLERY = 'property_detail.view_gallery',
  VIEW_MAP = 'property_detail.view_map',
  VIEW_VIDEO = 'property_detail.view_video',
  VIEW_3D_TOUR = 'property_detail.view_3d_tour',
  
  // Контакты
  REQUEST_CONTACTS = 'property_detail.request_contacts',
  CALL_PHONE = 'property_detail.call_phone',
  OPEN_WHATSAPP = 'property_detail.open_whatsapp',
  
  // Действия
  LIKE = 'property_detail.like',
  DISLIKE = 'property_detail.dislike',
  ADD_NOTE = 'property_detail.add_note',
  SHARE = 'property_detail.share',
  REPORT = 'property_detail.report',
  
  // Навигация
  VIEW_NEARBY_CATEGORY = 'property_detail.view_nearby_category',
  CLICK_TRANSPORT = 'property_detail.click_transport',
  CLICK_POI = 'property_detail.click_poi',
  CLICK_AGENT_PROPERTY = 'property_detail.click_agent_property',
  CLICK_SIMILAR = 'property_detail.click_similar',
  NAVIGATE_NEXT = 'property_detail.navigate_next',
  NAVIGATE_PREV = 'property_detail.navigate_prev',
}
```

### Отправка событий

```typescript
// src/shared/lib/analytics.ts
import { track } from '@/shared/lib/analytics';

track(PropertyDetailEvent.VIEW_PROPERTY, {
  propertyId: property.id,
  slug: property.slug,
  type: property.type,
  price: property.price,
  location: property.district,
  hasContext: !!navigationContext,
});

track(PropertyDetailEvent.REQUEST_CONTACTS, {
  propertyId: property.id,
  authorType: property.author.type,
  success: true,
});
```

---

## 14. Соответствие FSD архитектуре

### Структура файлов

```
src/
├── app/[locale]/property/[slug]/
│   └── page.tsx                      # Server Component с загрузкой данных
│
├── screens/property-detail-page/
│   ├── ui/
│   │   └── property-detail-page.tsx  # Композиция виджетов
│   └── model/
│       └── use-property-detail.ts    # Логика страницы
│
├── widgets/
│   ├── property-detail-header/       # Хедер с навигацией
│   ├── property-gallery/             # Галерея, видео, 3D
│   ├── property-location-section/    # Карта и nearby places
│   ├── property-sidebar-conditions/  # Условия аренды
│   └── property-list-section/        # Агент/похожие объекты
│
├── features/
│   ├── property-actions/             # Лайк, дизлайк, заметка
│   ├── property-contact/             # Модалка контактов
│   ├── property-navigation/          # Next/prev навигация
│   ├── property-note/                # Заметки
│   └── report-complaint/             # Жалобы
│
├── entities/
│   ├── property/
│   │   ├── model/
│   │   │   └── types.ts              # Property, PropertyCard
│   │   └── ui/
│   │       ├── property-card/
│   │       └── property-details/
│   └── nearby-place/                 # Новая сущность
│       ├── model/
│       │   └── types.ts              # NearbyPlace, TransportStation
│       └── ui/
│           └── nearby-place-card/
│
└── shared/
    ├── api/
    │   ├── properties-server.ts      # getPropertyBySlugServer
    │   ├── contacts.ts               # getContactAccess
    │   ├── reactions.ts              # setPropertyReaction
    │   ├── notes.ts                  # property notes API
    │   └── nearby-places.ts          # getNearbyPlaces
    ├── lib/
    │   └── handle-property-error.ts
    └── config/
        └── api-config.ts
```

### Принципы

1. **Server Components** для загрузки данных
2. **Client Components** для интерактивности
3. **Zustand** для клиентского состояния (contacts modal, actions)
4. **React Query** для ленивой подгрузки (nearby places)
5. **Локализация** через `next-intl`
6. **Типизация** строгая, интерфейсы в `model/types.ts`

---

## 15. Миграция на реальный API

### Чеклист готовности

- [ ] Все эндпоинты задокументированы
- [ ] Типы данных согласованы между фронтендом и бекендом
- [ ] Добавлено поле `slug` в модель Property
- [ ] Реализована генерация slug на бекенде
- [ ] Настроен PBF tiles endpoint для locations
- [ ] Реализована пагинация для nearby places
- [ ] Настроены лимиты для контактов/жалоб
- [ ] Реализован алгоритм подбора похожих объектов
- [ ] Реализована навигация с контекстом фильтров
- [ ] Все моки соответствуют реальным эндпоинтам
- [ ] Написаны E2E тесты
- [ ] Настроен мониторинг и аналитика
- [ ] ENV переменные настроены для всех окружений

### Процесс миграции

1. **Подготовка:**
   - Убедиться, что все моки работают корректно
   - Написать E2E тесты на моках

2. **Поэтапное переключение:**
   - Property detail → реальный API
   - Nearby places → реальный API
   - Contacts → реальный API
   - Actions → реальный API
   - Navigation → реальный API

3. **Тестирование:**
   - Запустить E2E тесты на реальном API
   - Проверить производительность
   - Проверить обработку ошибок
   - Load testing для популярных объектов

4. **Развертывание:**
   - Staging → проверка всех функций
   - Production → постепенный rollout (10% → 50% → 100%)

---

## Контакты и поддержка

**Документация:**
- Фильтры: [../filters/README.md](../filters/README.md)
- Объекты (листинг): [../properties/README.md](../properties/README.md)
- Вкладки: [../tabs/README.md](../tabs/README.md)
- Кластеры: [../clusters/README.md](../clusters/README.md)

**API документация (Swagger):**
- Staging: https://api-staging.realbro.com/docs
- Production: https://api.realbro.com/docs

**Вопросы и баги:**
- GitHub Issues: https://github.com/SoySergo/realbro_frontend/issues
- Email: dev@realbro.com
