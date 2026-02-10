# Документация синхронизации с бекендом

## Обзор

Эта документация описывает спецификацию API и типов данных для синхронизации фронтенда с бекендом проекта Real Estate Barcelona.

**Основные разделы:**

1. **Фильтры** (`/filters/`) — система фильтрации объектов недвижимости
2. **Объекты** (`/properties/`) — отображение и взаимодействие с объектами
3. **Вкладки** (`/tabs/`) — сохранение и управление поисковыми запросами
4. **Кластеры** (`/clusters/`) — группировка объектов на карте

---

## Архитектура API

### Base URL

```
Продакшн: https://api.realbro.com
Разработка: http://localhost:3001
```

### Аутентификация

```typescript
// JWT токен в заголовке
headers: {
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json',
}
```

### Формат ответов

**Успешный ответ:**

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}
```

**Ошибка:**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid filter parameters",
    "details": { ... }
  }
}
```

---

## Переключение между моками и реальным API

### ENV конфигурация

```env
# .env.local
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_URL=https://api.realbro.com
```

### Условная логика на фронтенде

```typescript
// src/shared/api/config.ts
export const API_CONFIG = {
  useMock: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
};

// src/shared/api/client.ts
export const apiClient = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  if (API_CONFIG.useMock) {
    // Использовать локальные моки
    return fetchMock<T>(endpoint, options);
  }
  
  // Реальный запрос к бекенду
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new ApiError(response);
  }
  
  return response.json();
};
```

---

## Краткая справка по эндпоинтам

### Фильтры

См. подробнее: [filters/README.md](./filters/README.md)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/geometries` | POST | Сохранить полигон |
| `/api/geometries/:id` | GET | Получить полигон |
| `/api/geometries/:id` | DELETE | Удалить полигон |
| `/api/geometries` | GET | Список полигонов пользователя |
| `/api/isochrones` | POST | Сохранить изохрону |
| `/api/isochrones/:id` | GET | Получить изохрону |

### Объекты недвижимости

См. подробнее: [properties/README.md](./properties/README.md)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/properties` | GET | Список объектов (list view) |
| `/api/properties/tiles/{z}/{x}/{y}.pbf` | GET | Vector tiles для карты |
| `/api/properties/viewport` | POST | Объекты в видимой области |
| `/api/properties/cluster` | POST | Объекты кластера |
| `/api/properties/:id` | GET | Детали объекта |
| `/api/properties/count` | POST | Подсчет объектов |
| `/api/properties/:id/reaction` | POST | Лайк/дизлайк |
| `/api/properties/:id/popup` | GET | Данные для попапа |

### Вкладки поиска

См. подробнее: [tabs/README.md](./tabs/README.md)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/search-tabs` | GET | Список вкладок |
| `/api/search-tabs` | POST | Создать вкладку |
| `/api/search-tabs/:id` | PATCH | Обновить вкладку |
| `/api/search-tabs/:id` | DELETE | Удалить вкладку |
| `/api/search-tabs/reorder` | POST | Изменить порядок |
| `/api/search-tabs/folders` | POST | Создать папку |
| `/api/search-tabs/folders/:id` | PATCH | Обновить папку |
| `/api/search-tabs/folders/:id` | DELETE | Удалить папку |
| `/api/search-tabs/:id/usage` | POST | Обновить статистику |
| `/api/search-tabs/export` | GET | Экспорт вкладок |
| `/api/search-tabs/import` | POST | Импорт вкладок |
| `/api/search-tabs/templates` | GET | Шаблоны вкладок |
| `/api/search-tabs/:id/subscribe` | POST | Подписка на уведомления |
| `/api/search-tabs/:id/subscribe` | DELETE | Отписка |

### Кластеры

См. подробнее: [clusters/README.md](./clusters/README.md)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/properties/cluster` | POST | Объекты кластера |
| `/api/properties/cluster/:id/expansion-zoom` | GET | Зум распада кластера |
| `/api/properties/cluster/:id/stats` | GET | Статистика кластера |

---

## Основные типы данных

### SearchFiltersRequest

Полное описание в [filters/README.md](./filters/README.md#полный-формат-запроса-фильтрации)

```typescript
interface SearchFiltersRequest {
  // Location фильтры
  adminLevel2?: number[];
  adminLevel4?: number[];
  adminLevel6?: number[];
  adminLevel7?: number[];
  adminLevel8?: number[];
  adminLevel9?: number[];
  adminLevel10?: number[];
  locationsMeta?: LocationMeta[];
  geometryIds?: number[];
  radiusCenter?: [number, number];
  radiusKm?: number;
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

### Property

Полное описание в [properties/README.md](./properties/README.md#property-основной-тип-объекта-недвижимости)

```typescript
interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  rooms: number;
  bathrooms: number;
  area: number;
  coordinates: { lat: number; lng: number; };
  address: string;
  city: string;
  description: string;
  images: string[];
  features: PropertyFeature[];
  createdAt: Date;
  updatedAt: Date;
  // ... расширенные поля
}
```

### SearchTab

Полное описание в [tabs/README.md](./tabs/README.md#searchtab-вкладка-поиска)

```typescript
interface SearchTab {
  id: string;
  userId: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  filters: SearchFiltersRequest;
  viewMode: 'map' | 'list';
  listingViewMode?: 'grid' | 'list';
  sort?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
  mapState?: MapState;
  isPinned: boolean;
  isDefault: boolean;
  resultsCount?: number;
  lastUsedAt: Date;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cluster

Полное описание в [clusters/README.md](./clusters/README.md#cluster-кластер-на-карте)

```typescript
interface Cluster {
  id: string;
  coordinates: [number, number];
  bbox?: [number, number, number, number];
  pointCount: number;
  propertyIds: string[];
  zoom: number;
  priceRange?: PriceRange;
  categoryDistribution?: CategoryDistribution[];
}
```

---

## Валидация данных

### Zod схемы

Все типы данных должны быть валидированы на фронтенде и бекенде.

**Пример схемы фильтров:**

```typescript
import { z } from 'zod';

export const searchFiltersSchema = z.object({
  // Location
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
  
  // Property
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rooms: z.array(z.number().min(1)).optional(),
  minArea: z.number().min(0).optional(),
  maxArea: z.number().min(0).optional(),
  
  // ... остальные поля
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
```

---

## Обработка ошибок

### Коды ошибок

```typescript
enum ApiErrorCode {
  // Общие
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  
  // Фильтры
  INVALID_FILTERS = 'INVALID_FILTERS',
  TOO_MANY_RESULTS = 'TOO_MANY_RESULTS',
  INVALID_GEOMETRY = 'INVALID_GEOMETRY',
  
  // Вкладки
  TAB_LIMIT_EXCEEDED = 'TAB_LIMIT_EXCEEDED',
  TAB_NOT_FOUND = 'TAB_NOT_FOUND',
  FOLDER_LIMIT_EXCEEDED = 'FOLDER_LIMIT_EXCEEDED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
```

### Обработка на фронтенде

```typescript
class ApiError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Глобальный обработчик
const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case ApiErrorCode.INVALID_FILTERS:
      showToast('Некорректные фильтры', 'error');
      break;
    case ApiErrorCode.TOO_MANY_RESULTS:
      showToast('Слишком много результатов. Уточните фильтры.', 'warning');
      break;
    case ApiErrorCode.RATE_LIMIT_EXCEEDED:
      showToast('Превышен лимит запросов. Попробуйте позже.', 'error');
      break;
    case ApiErrorCode.UNAUTHORIZED:
      redirectToLogin();
      break;
    default:
      showToast('Произошла ошибка. Попробуйте еще раз.', 'error');
  }
  
  // Логирование в Sentry/etc
  logError(error);
};
```

---

## Rate Limiting

### Лимиты

```typescript
interface RateLimits {
  properties: {
    list: '100/minute',
    viewport: '60/minute',
    tiles: '300/minute',
    detail: '120/minute',
  };
  tabs: {
    create: '10/minute',
    update: '30/minute',
    list: '60/minute',
  };
  geometries: {
    create: '20/minute',
    list: '60/minute',
  };
}
```

### Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Кеширование

### Стратегия кеширования

| Ресурс | TTL | Invalidation |
|--------|-----|--------------|
| Список объектов | 5 минут | При изменении фильтров |
| Детали объекта | 10 минут | При обновлении объекта |
| PBF tiles | 10 минут | При изменении фильтров |
| Список вкладок | 1 час | При создании/обновлении/удалении |
| Геометрии | 1 день | При удалении |

### Cache-Control headers

```
Cache-Control: public, max-age=300, s-maxage=600
ETag: "abc123"
```

---

## Версионирование API

### Версия в URL

```
/api/v1/properties
/api/v2/properties
```

### Версия в заголовке (альтернатива)

```
Accept: application/vnd.realbro.v1+json
```

### Совместимость

- Минорные изменения (добавление полей) — обратно совместимы
- Мажорные изменения (удаление/изменение полей) — новая версия API
- Поддержка старых версий минимум 6 месяцев

---

## Мониторинг и логирование

### Метрики

```typescript
interface ApiMetrics {
  // Performance
  responseTime: number;          // Время ответа (мс)
  queryTime: number;             // Время выполнения запроса к БД (мс)
  cacheHitRate: number;          // Процент попаданий в кеш
  
  // Usage
  requestsPerMinute: number;
  activeUsers: number;
  popularFilters: SearchFiltersRequest[];
  
  // Errors
  errorRate: number;
  errorsByType: Record<ApiErrorCode, number>;
}
```

### Логирование запросов

```typescript
interface RequestLog {
  timestamp: string;
  method: string;
  endpoint: string;
  userId?: string;
  filters?: SearchFiltersRequest;
  responseTime: number;
  statusCode: number;
  error?: ApiError;
}
```

---

## Тестирование

### E2E тесты

```typescript
describe('Properties API', () => {
  it('should fetch properties with filters', async () => {
    const filters = {
      adminLevel8: [123],
      minPrice: 500,
      maxPrice: 1500,
      propertyCategory: ['apartment'],
    };
    
    const response = await apiClient.getProperties(filters);
    
    expect(response.properties).toBeDefined();
    expect(response.properties.length).toBeGreaterThan(0);
    expect(response.pagination).toBeDefined();
  });
  
  it('should handle invalid filters', async () => {
    const invalidFilters = {
      minPrice: -100, // Недопустимо
    };
    
    await expect(
      apiClient.getProperties(invalidFilters)
    ).rejects.toThrow(ApiError);
  });
});
```

### Mock данные

```typescript
// src/shared/api/mocks/properties-mock.ts
export const generateMockProperties = (
  count: number,
  filters?: SearchFiltersRequest
): Property[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `prop-${i}`,
    title: `Квартира ${i + 1}`,
    type: 'apartment',
    price: faker.number.int({ min: 500, max: 2000 }),
    // ... остальные поля
  }));
};
```

---

## Миграция с моков на реальный API

### Чеклист

- [ ] Все эндпоинты задокументированы
- [ ] Типы данных совпадают между фронтендом и бекендом
- [ ] Валидация настроена на обеих сторонах
- [ ] Обработка ошибок реализована
- [ ] Rate limiting настроен
- [ ] Кеширование работает
- [ ] Тесты написаны и проходят
- [ ] ENV переменные настроены
- [ ] Мониторинг подключен
- [ ] Логирование настроено

### Процесс миграции

1. **Подготовка:**
   - Убедиться, что все моки соответствуют спецификации
   - Написать тесты для всех эндпоинтов

2. **Интеграция:**
   - Установить `NEXT_PUBLIC_USE_MOCK_API=false`
   - Проверить работоспособность каждого раздела
   - Исправить несоответствия

3. **Тестирование:**
   - Запустить E2E тесты
   - Проверить производительность
   - Проверить обработку ошибок

4. **Развертывание:**
   - Развернуть бекенд на staging
   - Подключить фронтенд к staging
   - Провести финальное тестирование
   - Развернуть на production

---

## Контакты и поддержка

**Документация:**
- Фильтры: [filters/README.md](./filters/README.md)
- Объекты: [properties/README.md](./properties/README.md)
- Вкладки: [tabs/README.md](./tabs/README.md)
- Кластеры: [clusters/README.md](./clusters/README.md)

**API документация (Swagger):**
- Staging: https://api-staging.realbro.com/docs
- Production: https://api.realbro.com/docs

**Вопросы и баги:**
- GitHub Issues: https://github.com/SoySergo/realbro_frontend/issues
- Email: dev@realbro.com
