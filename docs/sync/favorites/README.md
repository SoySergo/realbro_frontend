# Избранное — Документация для синхронизации с бекендом

## Обзор

Система избранного состоит из четырех основных функциональных модулей:

1. **Избранные объекты** — сохранение объектов недвижимости с метками лайк/дизлайк
2. **Избранные профессионалы** — сохранение агентов и агентств с отслеживанием взаимодействий
3. **Сохраненные поиски** — сохранение фильтров для повторного использования
4. **Заметки и напоминания** — добавление заметок к объектам/агентствам с напоминаниями

---

## Структуры данных

### 1. Избранные объекты

#### 1.1 TypeScript интерфейсы

```typescript
interface FavoriteProperty {
  id: string;                    // ID записи в избранном
  userId: string;                // ID пользователя
  propertyId: string;            // ID объекта недвижимости
  markType: 'like' | 'dislike';  // Тип метки
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  
  // Вложенные данные объекта (опционально)
  property?: Property;
}

interface FavoritePropertyInput {
  propertyId: string;
  markType: 'like' | 'dislike';
}

interface FavoritePropertyUpdate {
  markType: 'like' | 'dislike';
}
```

#### 1.2 Бизнес-логика

- Один объект может иметь только один тип метки (like или dislike)
- При изменении метки обновляется `updatedAt`
- При удалении объекта из избранного удаляется запись
- При повторном добавлении того же объекта с той же меткой — no-op

---

### 2. Избранные профессионалы

#### 2.1 TypeScript интерфейсы

```typescript
interface FavoriteProfessional {
  id: string;                      // ID записи в избранном
  userId: string;                  // ID пользователя
  professionalId: string;          // ID профессионала (агент/агентство)
  professionalType: 'agent' | 'agency'; // Тип профессионала
  
  // Отслеживание взаимодействий
  viewedAt: string;                // ISO 8601 timestamp первого просмотра
  contactRequestedAt?: string;     // Когда был запрошен контакт
  messagesSent: number;            // Количество отправленных сообщений
  reviewWritten: boolean;          // Написан ли отзыв
  
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
  
  // Вложенные данные (опционально)
  professional?: Agent | Agency;
}

interface FavoriteProfessionalInput {
  professionalId: string;
  professionalType: 'agent' | 'agency';
}

interface FavoriteProfessionalInteractionUpdate {
  contactRequested?: boolean;      // Установить contactRequestedAt в now()
  messagesSent?: number;           // Инкремент количества сообщений
  reviewWritten?: boolean;         // Установить флаг написания отзыва
}
```

#### 2.2 Бизнес-логика

- Один профессионал может быть добавлен только один раз
- `viewedAt` устанавливается автоматически при добавлении
- `contactRequestedAt` устанавливается при первом запросе контакта
- `messagesSent` инкрементируется при каждом отправлении сообщения
- `reviewWritten` устанавливается в `true` после написания отзыва

---

### 3. Сохраненные поиски

#### 3.1 TypeScript интерфейсы

```typescript
interface SavedFilter {
  id: string;                      // ID сохраненного фильтра
  userId: string;                  // ID пользователя
  name: string;                    // Название фильтра (пользовательское)
  description?: string;            // Описание (опционально)
  
  // Фильтры (см. документацию /docs/sync/filters/README.md)
  filters: SearchFiltersRequest;
  
  // Уведомления
  notificationsEnabled: boolean;   // Уведомлять о новых объектах
  notificationFrequency?: 'instant' | 'daily' | 'weekly'; // Частота уведомлений
  
  // Метаданные
  timesUsed: number;               // Количество использований
  lastUsedAt?: string;             // ISO 8601 timestamp последнего использования
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

interface SavedFilterInput {
  name: string;
  description?: string;
  filters: SearchFiltersRequest;
  notificationsEnabled?: boolean;  // По умолчанию: false
  notificationFrequency?: 'instant' | 'daily' | 'weekly'; // По умолчанию: 'daily'
}

interface SavedFilterUpdate {
  name?: string;
  description?: string;
  filters?: SearchFiltersRequest;
  notificationsEnabled?: boolean;
  notificationFrequency?: 'instant' | 'daily' | 'weekly';
}
```

#### 3.2 Бизнес-логика

- Пользователь может сохранить до 20 фильтров
- `timesUsed` инкрементируется при каждом применении фильтра
- `lastUsedAt` обновляется при применении фильтра
- При включенных уведомлениях система отправляет новые объекты по расписанию
- Фильтры сортируются по `lastUsedAt` (недавно использованные в начале)

---

### 4. Заметки и напоминания

#### 4.1 TypeScript интерфейсы

```typescript
interface PropertyNote {
  id: string;                      // ID заметки
  userId: string;                  // ID пользователя
  
  // Связь с сущностью (один из типов)
  propertyId?: string;             // ID объекта недвижимости
  agencyId?: string;               // ID агентства
  type: 'property' | 'agency';     // Тип заметки
  
  // Содержимое
  content: string;                 // Текст заметки
  tags?: string[];                 // Теги для категоризации
  
  // Напоминание
  reminder?: Reminder;             // Напоминание (опционально)
  
  createdAt: string;               // ISO 8601 timestamp
  updatedAt: string;               // ISO 8601 timestamp
}

interface Reminder {
  id: string;                      // ID напоминания
  noteId: string;                  // ID связанной заметки
  reminderAt: string;              // ISO 8601 timestamp когда напомнить
  completed: boolean;              // Выполнено ли напоминание
  completedAt?: string;            // ISO 8601 timestamp когда выполнено
  notificationSent: boolean;       // Отправлено ли уведомление
}

interface PropertyNoteInput {
  propertyId?: string;
  agencyId?: string;
  type: 'property' | 'agency';
  content: string;
  tags?: string[];
  reminder?: ReminderInput;
}

interface ReminderInput {
  reminderAt: string;              // ISO 8601 timestamp
}

interface PropertyNoteUpdate {
  content?: string;
  tags?: string[];
  reminder?: ReminderInput | null; // null для удаления напоминания
}
```

#### 4.2 Бизнес-логика

- Заметка привязывается либо к объекту (`propertyId`), либо к агентству (`agencyId`)
- Тип `type` определяет к чему привязана заметка
- Напоминание опционально, может быть добавлено/удалено/обновлено
- При наступлении времени `reminderAt` отправляется уведомление
- После просмотра уведомления пользователь может отметить напоминание как выполненное
- Теги используются для фильтрации и группировки заметок

---

## API Endpoints

### 1. Избранные объекты

#### 1.1 Получить список избранных объектов

**Endpoint:** `GET /api/favorites/properties`

**Query параметры:**

```typescript
interface GetFavoritePropertiesQuery {
  markType?: 'like' | 'dislike' | 'all';  // Фильтр по типу метки (по умолчанию: 'all')
  sort?: 'createdAt' | 'updatedAt' | 'price'; // Сортировка (по умолчанию: 'createdAt')
  sortOrder?: 'asc' | 'desc';             // Порядок (по умолчанию: 'desc')
  page?: number;                          // Номер страницы (по умолчанию: 1)
  limit?: number;                         // Элементов на странице (по умолчанию: 20)
  includeProperty?: boolean;              // Включить данные объекта (по умолчанию: true)
}
```

**Response:**

```typescript
interface GetFavoritePropertiesResponse {
  favorites: FavoriteProperty[];
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

**Пример curl:**

```bash
curl -X GET "https://api.realbro.es/api/favorites/properties?markType=like&sort=createdAt&sortOrder=desc&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Пример ответа:**

```json
{
  "favorites": [
    {
      "id": "fav_123",
      "userId": "user_456",
      "propertyId": "prop_789",
      "markType": "like",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "property": {
        "id": "prop_789",
        "title": "Современная квартира в Барселоне",
        "price": 1200,
        "area": 75,
        "rooms": 2
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### 1.2 Добавить объект в избранное

**Endpoint:** `POST /api/favorites/properties`

**Request body:**

```typescript
interface AddFavoritePropertyRequest {
  propertyId: string;
  markType: 'like' | 'dislike';
}
```

**Response:**

```typescript
interface AddFavoritePropertyResponse {
  favorite: FavoriteProperty;
}
```

**Пример curl:**

```bash
curl -X POST "https://api.realbro.es/api/favorites/properties" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_789",
    "markType": "like"
  }'
```

**Пример ответа:**

```json
{
  "favorite": {
    "id": "fav_123",
    "userId": "user_456",
    "propertyId": "prop_789",
    "markType": "like",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 1.3 Обновить метку объекта

**Endpoint:** `PATCH /api/favorites/properties/:id`

**Request body:**

```typescript
interface UpdateFavoritePropertyRequest {
  markType: 'like' | 'dislike';
}
```

**Response:**

```typescript
interface UpdateFavoritePropertyResponse {
  favorite: FavoriteProperty;
}
```

**Пример curl:**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/properties/fav_123" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "markType": "dislike"
  }'
```

#### 1.4 Удалить объект из избранного

**Endpoint:** `DELETE /api/favorites/properties/:id`

**Response:**

```typescript
interface DeleteFavoritePropertyResponse {
  success: boolean;
  deletedId: string;
}
```

**Пример curl:**

```bash
curl -X DELETE "https://api.realbro.es/api/favorites/properties/fav_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Пример ответа:**

```json
{
  "success": true,
  "deletedId": "fav_123"
}
```

---

### 2. Избранные профессионалы

#### 2.1 Получить список избранных профессионалов

**Endpoint:** `GET /api/favorites/professionals`

**Query параметры:**

```typescript
interface GetFavoriteProfessionalsQuery {
  professionalType?: 'agent' | 'agency' | 'all'; // Фильтр по типу (по умолчанию: 'all')
  sort?: 'createdAt' | 'viewedAt' | 'messagesSent'; // Сортировка (по умолчанию: 'createdAt')
  sortOrder?: 'asc' | 'desc';                     // Порядок (по умолчанию: 'desc')
  page?: number;                                  // Номер страницы (по умолчанию: 1)
  limit?: number;                                 // Элементов на странице (по умолчанию: 20)
  includeProfessional?: boolean;                  // Включить данные профессионала (по умолчанию: true)
}
```

**Response:**

```typescript
interface GetFavoriteProfessionalsResponse {
  favorites: FavoriteProfessional[];
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

**Пример curl:**

```bash
curl -X GET "https://api.realbro.es/api/favorites/professionals?professionalType=agent&sort=viewedAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Пример ответа:**

```json
{
  "favorites": [
    {
      "id": "fav_prof_123",
      "userId": "user_456",
      "professionalId": "agent_789",
      "professionalType": "agent",
      "viewedAt": "2024-01-15T10:30:00Z",
      "contactRequestedAt": "2024-01-15T11:00:00Z",
      "messagesSent": 3,
      "reviewWritten": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:20:00Z",
      "professional": {
        "id": "agent_789",
        "name": "María García",
        "agency": "Barcelona Real Estate",
        "rating": 4.8
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 35,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### 2.2 Добавить профессионала в избранное

**Endpoint:** `POST /api/favorites/professionals`

**Request body:**

```typescript
interface AddFavoriteProfessionalRequest {
  professionalId: string;
  professionalType: 'agent' | 'agency';
}
```

**Response:**

```typescript
interface AddFavoriteProfessionalResponse {
  favorite: FavoriteProfessional;
}
```

**Пример curl:**

```bash
curl -X POST "https://api.realbro.es/api/favorites/professionals" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "agent_789",
    "professionalType": "agent"
  }'
```

**Пример ответа:**

```json
{
  "favorite": {
    "id": "fav_prof_123",
    "userId": "user_456",
    "professionalId": "agent_789",
    "professionalType": "agent",
    "viewedAt": "2024-01-15T10:30:00Z",
    "messagesSent": 0,
    "reviewWritten": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 2.3 Обновить взаимодействия с профессионалом

**Endpoint:** `PATCH /api/favorites/professionals/:id/interactions`

**Request body:**

```typescript
interface UpdateFavoriteProfessionalInteractionsRequest {
  contactRequested?: boolean;      // true = установить contactRequestedAt
  messagesSent?: number;           // Инкремент количества сообщений
  reviewWritten?: boolean;         // true = установить reviewWritten
}
```

**Response:**

```typescript
interface UpdateFavoriteProfessionalInteractionsResponse {
  favorite: FavoriteProfessional;
}
```

**Пример curl (запрос контакта):**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/professionals/fav_prof_123/interactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contactRequested": true
  }'
```

**Пример curl (отправка сообщения):**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/professionals/fav_prof_123/interactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messagesSent": 1
  }'
```

#### 2.4 Удалить профессионала из избранного

**Endpoint:** `DELETE /api/favorites/professionals/:id`

**Response:**

```typescript
interface DeleteFavoriteProfessionalResponse {
  success: boolean;
  deletedId: string;
}
```

**Пример curl:**

```bash
curl -X DELETE "https://api.realbro.es/api/favorites/professionals/fav_prof_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Сохраненные поиски

#### 3.1 Получить список сохраненных фильтров

**Endpoint:** `GET /api/favorites/filters`

**Query параметры:**

```typescript
interface GetSavedFiltersQuery {
  sort?: 'createdAt' | 'lastUsedAt' | 'timesUsed'; // Сортировка (по умолчанию: 'lastUsedAt')
  sortOrder?: 'asc' | 'desc';                      // Порядок (по умолчанию: 'desc')
  page?: number;                                   // Номер страницы (по умолчанию: 1)
  limit?: number;                                  // Элементов на странице (по умолчанию: 20)
}
```

**Response:**

```typescript
interface GetSavedFiltersResponse {
  filters: SavedFilter[];
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

**Пример curl:**

```bash
curl -X GET "https://api.realbro.es/api/favorites/filters?sort=lastUsedAt&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Пример ответа:**

```json
{
  "filters": [
    {
      "id": "filter_123",
      "userId": "user_456",
      "name": "Квартиры в центре Барселоны",
      "description": "2-3 комнаты, до 1500€",
      "filters": {
        "adminLevel8": [123],
        "propertyCategory": ["apartment"],
        "minPrice": 800,
        "maxPrice": 1500,
        "rooms": [2, 3]
      },
      "notificationsEnabled": true,
      "notificationFrequency": "daily",
      "timesUsed": 15,
      "lastUsedAt": "2024-01-16T09:00:00Z",
      "createdAt": "2024-01-10T14:30:00Z",
      "updatedAt": "2024-01-16T09:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 8,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### 3.2 Сохранить новый фильтр

**Endpoint:** `POST /api/favorites/filters`

**Request body:**

```typescript
interface CreateSavedFilterRequest {
  name: string;
  description?: string;
  filters: SearchFiltersRequest;
  notificationsEnabled?: boolean;
  notificationFrequency?: 'instant' | 'daily' | 'weekly';
}
```

**Response:**

```typescript
interface CreateSavedFilterResponse {
  filter: SavedFilter;
}
```

**Пример curl:**

```bash
curl -X POST "https://api.realbro.es/api/favorites/filters" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Квартиры в Готическом квартале",
    "description": "Студии и 1-комнатные до 1000€",
    "filters": {
      "adminLevel9": [456],
      "propertyCategory": ["studio", "apartment"],
      "rooms": [1],
      "maxPrice": 1000
    },
    "notificationsEnabled": true,
    "notificationFrequency": "daily"
  }'
```

**Пример ответа:**

```json
{
  "filter": {
    "id": "filter_789",
    "userId": "user_456",
    "name": "Квартиры в Готическом квартале",
    "description": "Студии и 1-комнатные до 1000€",
    "filters": {
      "adminLevel9": [456],
      "propertyCategory": ["studio", "apartment"],
      "rooms": [1],
      "maxPrice": 1000
    },
    "notificationsEnabled": true,
    "notificationFrequency": "daily",
    "timesUsed": 0,
    "createdAt": "2024-01-17T10:30:00Z",
    "updatedAt": "2024-01-17T10:30:00Z"
  }
}
```

#### 3.3 Обновить сохраненный фильтр

**Endpoint:** `PATCH /api/favorites/filters/:id`

**Request body:**

```typescript
interface UpdateSavedFilterRequest {
  name?: string;
  description?: string;
  filters?: SearchFiltersRequest;
  notificationsEnabled?: boolean;
  notificationFrequency?: 'instant' | 'daily' | 'weekly';
}
```

**Response:**

```typescript
interface UpdateSavedFilterResponse {
  filter: SavedFilter;
}
```

**Пример curl:**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/filters/filter_789" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Квартиры в центре",
    "notificationFrequency": "weekly"
  }'
```

#### 3.4 Применить сохраненный фильтр

**Endpoint:** `POST /api/favorites/filters/:id/use`

**Description:** Инкрементирует `timesUsed` и обновляет `lastUsedAt`

**Response:**

```typescript
interface UseSavedFilterResponse {
  filter: SavedFilter;
}
```

**Пример curl:**

```bash
curl -X POST "https://api.realbro.es/api/favorites/filters/filter_789/use" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Пример ответа:**

```json
{
  "filter": {
    "id": "filter_789",
    "userId": "user_456",
    "name": "Квартиры в центре",
    "timesUsed": 16,
    "lastUsedAt": "2024-01-17T11:45:00Z",
    "updatedAt": "2024-01-17T11:45:00Z"
  }
}
```

#### 3.5 Удалить сохраненный фильтр

**Endpoint:** `DELETE /api/favorites/filters/:id`

**Response:**

```typescript
interface DeleteSavedFilterResponse {
  success: boolean;
  deletedId: string;
}
```

**Пример curl:**

```bash
curl -X DELETE "https://api.realbro.es/api/favorites/filters/filter_789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Заметки и напоминания

#### 4.1 Получить список заметок

**Endpoint:** `GET /api/favorites/notes`

**Query параметры:**

```typescript
interface GetNotesQuery {
  type?: 'property' | 'agency' | 'all';    // Фильтр по типу (по умолчанию: 'all')
  propertyId?: string;                      // Фильтр по ID объекта
  agencyId?: string;                        // Фильтр по ID агентства
  tags?: string[];                          // Фильтр по тегам
  hasReminder?: boolean;                    // Только с напоминаниями
  reminderCompleted?: boolean;              // Фильтр по статусу напоминания
  sort?: 'createdAt' | 'updatedAt' | 'reminderAt'; // Сортировка (по умолчанию: 'createdAt')
  sortOrder?: 'asc' | 'desc';              // Порядок (по умолчанию: 'desc')
  page?: number;                            // Номер страницы (по умолчанию: 1)
  limit?: number;                           // Элементов на странице (по умолчанию: 20)
}
```

**Response:**

```typescript
interface GetNotesResponse {
  notes: PropertyNote[];
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

**Пример curl:**

```bash
curl -X GET "https://api.realbro.es/api/favorites/notes?type=property&hasReminder=true&reminderCompleted=false" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Пример ответа:**

```json
{
  "notes": [
    {
      "id": "note_123",
      "userId": "user_456",
      "propertyId": "prop_789",
      "type": "property",
      "content": "Позвонить агенту для уточнения условий аренды",
      "tags": ["важное", "контакт"],
      "reminder": {
        "id": "reminder_001",
        "noteId": "note_123",
        "reminderAt": "2024-01-18T10:00:00Z",
        "completed": false,
        "notificationSent": false
      },
      "createdAt": "2024-01-17T14:30:00Z",
      "updatedAt": "2024-01-17T14:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 20,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### 4.2 Создать заметку

**Endpoint:** `POST /api/favorites/notes`

**Request body:**

```typescript
interface CreateNoteRequest {
  propertyId?: string;
  agencyId?: string;
  type: 'property' | 'agency';
  content: string;
  tags?: string[];
  reminder?: {
    reminderAt: string;  // ISO 8601 timestamp
  };
}
```

**Response:**

```typescript
interface CreateNoteResponse {
  note: PropertyNote;
}
```

**Пример curl (заметка к объекту):**

```bash
curl -X POST "https://api.realbro.es/api/favorites/notes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_789",
    "type": "property",
    "content": "Хорошая планировка, но нужна косметика",
    "tags": ["просмотр", "ремонт"]
  }'
```

**Пример curl (заметка к агентству с напоминанием):**

```bash
curl -X POST "https://api.realbro.es/api/favorites/notes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agencyId": "agency_456",
    "type": "agency",
    "content": "Запланирован просмотр квартиры на Rambla",
    "tags": ["просмотр"],
    "reminder": {
      "reminderAt": "2024-01-20T15:00:00Z"
    }
  }'
```

**Пример ответа:**

```json
{
  "note": {
    "id": "note_456",
    "userId": "user_456",
    "agencyId": "agency_456",
    "type": "agency",
    "content": "Запланирован просмотр квартиры на Rambla",
    "tags": ["просмотр"],
    "reminder": {
      "id": "reminder_002",
      "noteId": "note_456",
      "reminderAt": "2024-01-20T15:00:00Z",
      "completed": false,
      "notificationSent": false
    },
    "createdAt": "2024-01-17T16:00:00Z",
    "updatedAt": "2024-01-17T16:00:00Z"
  }
}
```

#### 4.3 Обновить заметку

**Endpoint:** `PATCH /api/favorites/notes/:id`

**Request body:**

```typescript
interface UpdateNoteRequest {
  content?: string;
  tags?: string[];
  reminder?: {
    reminderAt: string;
  } | null;  // null для удаления напоминания
}
```

**Response:**

```typescript
interface UpdateNoteResponse {
  note: PropertyNote;
}
```

**Пример curl (обновление контента):**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/notes/note_456" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Просмотр перенесен на 21 января в 16:00",
    "reminder": {
      "reminderAt": "2024-01-21T15:30:00Z"
    }
  }'
```

**Пример curl (удаление напоминания):**

```bash
curl -X PATCH "https://api.realbro.es/api/favorites/notes/note_456" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reminder": null
  }'
```

#### 4.4 Удалить заметку

**Endpoint:** `DELETE /api/favorites/notes/:id`

**Response:**

```typescript
interface DeleteNoteResponse {
  success: boolean;
  deletedId: string;
}
```

**Пример curl:**

```bash
curl -X DELETE "https://api.realbro.es/api/favorites/notes/note_456" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 4.5 Отметить напоминание как выполненное

**Endpoint:** `POST /api/favorites/notes/:id/reminder/complete`

**Response:**

```typescript
interface CompleteReminderResponse {
  note: PropertyNote;
}
```

**Пример curl:**

```bash
curl -X POST "https://api.realbro.es/api/favorites/notes/note_456/reminder/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Пример ответа:**

```json
{
  "note": {
    "id": "note_456",
    "userId": "user_456",
    "agencyId": "agency_456",
    "type": "agency",
    "content": "Просмотр перенесен на 21 января в 16:00",
    "tags": ["просмотр"],
    "reminder": {
      "id": "reminder_002",
      "noteId": "note_456",
      "reminderAt": "2024-01-21T15:30:00Z",
      "completed": true,
      "completedAt": "2024-01-21T16:30:00Z",
      "notificationSent": true
    },
    "createdAt": "2024-01-17T16:00:00Z",
    "updatedAt": "2024-01-21T16:30:00Z"
  }
}
```

---

## Zod валидация

Схемы валидации для использования на фронтенде и бекенде:

```typescript
import { z } from 'zod';

// Избранные объекты
const favoritePropertyInputSchema = z.object({
  propertyId: z.string().min(1, 'ID объекта обязателен'),
  markType: z.enum(['like', 'dislike'], {
    required_error: 'Тип метки обязателен',
  }),
});

const favoritePropertyUpdateSchema = z.object({
  markType: z.enum(['like', 'dislike'], {
    required_error: 'Тип метки обязателен',
  }),
});

// Избранные профессионалы
const favoriteProfessionalInputSchema = z.object({
  professionalId: z.string().min(1, 'ID профессионала обязателен'),
  professionalType: z.enum(['agent', 'agency'], {
    required_error: 'Тип профессионала обязателен',
  }),
});

const favoriteProfessionalInteractionUpdateSchema = z.object({
  contactRequested: z.boolean().optional(),
  messagesSent: z.number().int().min(0).optional(),
  reviewWritten: z.boolean().optional(),
});

// Сохраненные фильтры
const savedFilterInputSchema = z.object({
  name: z.string().min(1, 'Название обязательно').max(100, 'Максимум 100 символов'),
  description: z.string().max(500, 'Максимум 500 символов').optional(),
  filters: z.record(z.any()), // SearchFiltersRequest
  notificationsEnabled: z.boolean().default(false),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly']).default('daily'),
});

const savedFilterUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  filters: z.record(z.any()).optional(),
  notificationsEnabled: z.boolean().optional(),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly']).optional(),
});

// Заметки
const reminderInputSchema = z.object({
  reminderAt: z.string().datetime({ message: 'Неверный формат даты' }),
});

const propertyNoteInputSchema = z.object({
  propertyId: z.string().optional(),
  agencyId: z.string().optional(),
  type: z.enum(['property', 'agency'], {
    required_error: 'Тип заметки обязателен',
  }),
  content: z.string().min(1, 'Контент обязателен').max(5000, 'Максимум 5000 символов'),
  tags: z.array(z.string().max(50)).max(10, 'Максимум 10 тегов').optional(),
  reminder: reminderInputSchema.optional(),
}).refine(
  (data) => (data.type === 'property' && data.propertyId) || (data.type === 'agency' && data.agencyId),
  {
    message: 'Должен быть указан propertyId или agencyId в зависимости от типа',
  }
);

const propertyNoteUpdateSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  reminder: reminderInputSchema.nullable().optional(),
});

// Query параметры
const getFavoritePropertiesQuerySchema = z.object({
  markType: z.enum(['like', 'dislike', 'all']).default('all'),
  sort: z.enum(['createdAt', 'updatedAt', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  includeProperty: z.coerce.boolean().default(true),
});

const getNotesQuerySchema = z.object({
  type: z.enum(['property', 'agency', 'all']).default('all'),
  propertyId: z.string().optional(),
  agencyId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  hasReminder: z.coerce.boolean().optional(),
  reminderCompleted: z.coerce.boolean().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'reminderAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

---

## Безопасность

### Аутентификация

Все endpoints требуют аутентификации через Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Авторизация

- Пользователь может работать только со своими избранными объектами, профессионалами, фильтрами и заметками
- При попытке доступа к чужим данным возвращается `403 Forbidden`
- ID пользователя берется из JWT токена, а не из параметров запроса

### Rate Limiting

Ограничения на количество запросов:

- **GET endpoints**: 100 запросов в минуту на пользователя
- **POST/PATCH/DELETE endpoints**: 30 запросов в минуту на пользователя
- При превышении лимита возвращается `429 Too Many Requests`

**Response headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705497600
```

### Валидация входных данных

- Все входные данные валидируются через Zod схемы
- При ошибке валидации возвращается `400 Bad Request` с детальным описанием ошибок
- Максимальные размеры:
  - Название фильтра: 100 символов
  - Описание фильтра: 500 символов
  - Содержимое заметки: 5000 символов
  - Количество тегов: 10
  - Длина тега: 50 символов

### Защита от XSS

- Все пользовательские данные (заметки, названия) санитизируются на бекенде
- HTML теги экранируются или удаляются
- Используется Content-Security-Policy header

---

## Performance

### Кэширование

**Стратегия кэширования:**

- Список избранных объектов: кэш 5 минут
- Список избранных профессионалов: кэш 5 минут
- Сохраненные фильтры: кэш 10 минут
- Заметки: кэш 2 минуты (часто обновляются)

**Cache headers:**

```
Cache-Control: private, max-age=300
ETag: "abc123"
```

**Инвалидация кэша:**

- При добавлении/обновлении/удалении записи инвалидируется соответствующий кэш
- Использование ETag для условных запросов (`If-None-Match`)

### Пагинация

- Cursor-based pagination для больших датасетов (>1000 элементов)
- Offset-based pagination для малых и средних датасетов
- Максимум 100 элементов на странице
- По умолчанию 20 элементов

**Cursor-based пример:**

```typescript
interface CursorPaginationResponse {
  items: any[];
  pagination: {
    nextCursor?: string;
    prevCursor?: string;
    hasMore: boolean;
  };
}
```

### Индексы базы данных

Рекомендуемые индексы для оптимизации запросов:

```sql
-- Избранные объекты
CREATE INDEX idx_favorite_properties_user_mark ON favorite_properties(userId, markType, createdAt DESC);
CREATE INDEX idx_favorite_properties_property ON favorite_properties(propertyId);

-- Избранные профессионалы
CREATE INDEX idx_favorite_professionals_user ON favorite_professionals(userId, createdAt DESC);
CREATE INDEX idx_favorite_professionals_type ON favorite_professionals(professionalType);

-- Сохраненные фильтры
CREATE INDEX idx_saved_filters_user_used ON saved_filters(userId, lastUsedAt DESC);
CREATE INDEX idx_saved_filters_notifications ON saved_filters(userId, notificationsEnabled, notificationFrequency);

-- Заметки
CREATE INDEX idx_notes_user_type ON property_notes(userId, type, createdAt DESC);
CREATE INDEX idx_notes_property ON property_notes(propertyId);
CREATE INDEX idx_notes_agency ON property_notes(agencyId);
CREATE INDEX idx_notes_tags ON property_notes USING GIN(tags);

-- Напоминания
CREATE INDEX idx_reminders_due ON reminders(reminderAt, completed, notificationSent) WHERE completed = false;
```

### Оптимизация запросов

- Использование `SELECT` только необходимых полей
- Eager loading для связанных данных (property, professional) при `include=true`
- Lazy loading по умолчанию для снижения нагрузки

**Пример оптимизированного запроса:**

```sql
-- Вместо SELECT *
SELECT id, userId, propertyId, markType, createdAt, updatedAt
FROM favorite_properties
WHERE userId = ? AND markType = ?
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### Background Jobs

Для асинхронных задач:

- **Отправка уведомлений по сохраненным фильтрам**: ежедневно/еженедельно в 09:00 UTC
- **Отправка напоминаний**: каждые 5 минут проверка `reminderAt`
- **Очистка устаревших данных**: еженедельно удаление заметок старше 2 лет (опционально)

---

## Примеры использования

### Пример 1: Добавление объекта в избранное с лайком

```bash
# Добавить объект
curl -X POST "https://api.realbro.es/api/favorites/properties" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_12345",
    "markType": "like"
  }'

# Получить все лайкнутые объекты
curl -X GET "https://api.realbro.es/api/favorites/properties?markType=like" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Пример 2: Работа с профессионалами

```bash
# Добавить агента в избранное
curl -X POST "https://api.realbro.es/api/favorites/professionals" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "agent_789",
    "professionalType": "agent"
  }'

# Отметить запрос контакта
curl -X PATCH "https://api.realbro.es/api/favorites/professionals/fav_prof_123/interactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contactRequested": true}'

# Инкремент отправленных сообщений
curl -X PATCH "https://api.realbro.es/api/favorites/professionals/fav_prof_123/interactions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messagesSent": 1}'
```

### Пример 3: Сохранение и использование фильтра

```bash
# Сохранить фильтр
curl -X POST "https://api.realbro.es/api/favorites/filters" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Мой основной поиск",
    "filters": {
      "adminLevel8": [123],
      "propertyCategory": ["apartment"],
      "minPrice": 800,
      "maxPrice": 1500,
      "rooms": [2, 3]
    },
    "notificationsEnabled": true,
    "notificationFrequency": "daily"
  }'

# Применить фильтр (инкремент timesUsed)
curl -X POST "https://api.realbro.es/api/favorites/filters/filter_123/use" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Получить фильтр и применить к поиску
curl -X GET "https://api.realbro.es/api/favorites/filters/filter_123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Пример 4: Заметки с напоминаниями

```bash
# Создать заметку к объекту с напоминанием
curl -X POST "https://api.realbro.es/api/favorites/notes" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "prop_456",
    "type": "property",
    "content": "Позвонить для уточнения даты просмотра",
    "tags": ["важное", "просмотр"],
    "reminder": {
      "reminderAt": "2024-01-25T10:00:00Z"
    }
  }'

# Получить все заметки с активными напоминаниями
curl -X GET "https://api.realbro.es/api/favorites/notes?hasReminder=true&reminderCompleted=false&sort=reminderAt&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Отметить напоминание как выполненное
curl -X POST "https://api.realbro.es/api/favorites/notes/note_123/reminder/complete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Пример 5: Фильтрация и сортировка

```bash
# Получить все дизлайкнутые объекты, отсортированные по дате обновления
curl -X GET "https://api.realbro.es/api/favorites/properties?markType=dislike&sort=updatedAt&sortOrder=desc&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Получить заметки к конкретному объекту
curl -X GET "https://api.realbro.es/api/favorites/notes?type=property&propertyId=prop_456" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Получить все заметки с тегом "просмотр"
curl -X GET "https://api.realbro.es/api/favorites/notes?tags=просмотр&sort=reminderAt&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Коды ошибок

### HTTP статусы

- `200 OK` — Успешный запрос
- `201 Created` — Ресурс успешно создан
- `400 Bad Request` — Ошибка валидации данных
- `401 Unauthorized` — Отсутствует или невалиден токен аутентификации
- `403 Forbidden` — Нет прав доступа к ресурсу
- `404 Not Found` — Ресурс не найден
- `409 Conflict` — Конфликт данных (например, объект уже в избранном)
- `429 Too Many Requests` — Превышен rate limit
- `500 Internal Server Error` — Ошибка на сервере

### Формат ошибки

```typescript
interface ErrorResponse {
  error: {
    code: string;           // Код ошибки (например, "VALIDATION_ERROR")
    message: string;        // Описание ошибки
    details?: any;          // Дополнительные детали (для валидации)
  };
}
```

**Примеры:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ошибка валидации входных данных",
    "details": [
      {
        "field": "markType",
        "message": "Тип метки обязателен"
      }
    ]
  }
}
```

```json
{
  "error": {
    "code": "ALREADY_EXISTS",
    "message": "Объект уже добавлен в избранное",
    "details": {
      "favoriteId": "fav_123",
      "existingMarkType": "like"
    }
  }
}
```

```json
{
  "error": {
    "code": "LIMIT_EXCEEDED",
    "message": "Превышен лимит сохраненных фильтров (максимум 20)",
    "details": {
      "currentCount": 20,
      "maxCount": 20
    }
  }
}
```

---

## WebSocket уведомления (опционально)

Для real-time уведомлений о новых объектах по сохраненным фильтрам:

**Подключение:**

```javascript
const ws = new WebSocket('wss://api.realbro.es/ws/favorites');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_JWT_TOKEN'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'new_properties') {
    console.log('Новые объекты по фильтру:', message.data);
  }
  
  if (message.type === 'reminder_due') {
    console.log('Напоминание:', message.data);
  }
};
```

**Типы сообщений:**

```typescript
// Новые объекты по сохраненному фильтру
{
  type: 'new_properties',
  data: {
    filterId: 'filter_123',
    filterName: 'Мой основной поиск',
    newCount: 5,
    properties: Property[]
  }
}

// Напоминание
{
  type: 'reminder_due',
  data: {
    noteId: 'note_456',
    reminderId: 'reminder_789',
    content: 'Позвонить для уточнения даты просмотра',
    reminderAt: '2024-01-25T10:00:00Z'
  }
}
```

---

## Миграция и версионирование

### Версионирование API

Используется версионирование через URL:

```
https://api.realbro.es/v1/api/favorites/properties
https://api.realbro.es/v2/api/favorites/properties
```

Текущая версия: **v1**

### Backward compatibility

При изменении структуры данных:

1. Сохранять обратную совместимость минимум 6 месяцев
2. Deprecated поля помечать в документации
3. Использовать новый endpoint для breaking changes
4. Предупреждать клиентов через response headers:

```
X-API-Deprecation-Warning: This endpoint is deprecated and will be removed on 2024-06-01
X-API-Migration-Guide: https://docs.realbro.es/migration/v1-to-v2
```

### Миграция данных

При изменении схемы данных:

- Автоматическая миграция при первом запросе пользователя
- Background job для массовой миграции
- Логирование ошибок миграции для анализа

---

## Дополнительная документация

- [Фильтры — структура и API](/docs/sync/filters/README.md)
- [Аутентификация и авторизация](/docs/auth/README.md)
- [WebSocket API](/docs/websocket/README.md)
- [Rate Limiting](/docs/rate-limiting/README.md)
- [Мониторинг и логирование](/docs/monitoring/README.md)

---

## Changelog

### v1.0.0 (2024-01-17)

- Начальная версия документации
- Поддержка избранных объектов с метками like/dislike
- Поддержка избранных профессионалов с отслеживанием взаимодействий
- Сохранение фильтров с уведомлениями
- Заметки и напоминания для объектов и агентств
