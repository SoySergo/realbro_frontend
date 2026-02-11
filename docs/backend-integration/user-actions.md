# Действия пользователя — Документация для бекенда

## Обзор

Централизованная система управления действиями пользователя с объектами недвижимости:
- **Лайки** (нравится)
- **Дизлайки** (не нравится)  
- **Заметки** (персональные заметки к объектам)

## Архитектура

### Клиентская часть

**Структура:**
```
src/entities/user-actions/
├── model/
│   ├── types.ts          # TypeScript типы
│   ├── store.ts          # Zustand store (localStorage + state)
│   └── index.ts
├── api/
│   ├── client.ts         # API клиент для синхронизации
│   └── index.ts
├── lib/
│   ├── hooks.ts          # React хуки
│   └── index.ts
└── index.ts
```

**Хранение данных:**
- **localStorage** - локальное хранилище для оффлайн работы
- **Zustand store** - реактивное состояние для UI
- **Backend API** - синхронизация с сервером

## API Endpoints

### 1. Установить реакцию (лайк/дизлайк)

**Endpoint:** `POST /api/properties/:propertyId/reaction`

**Request body:**
```json
{
  "reaction": "like" | "dislike" | null
}
```

**Response:**
```json
{
  "success": true,
  "reaction": "like" | "dislike" | null
}
```

**Логика:**
- `"like"` - добавить лайк (убирает дизлайк если был)
- `"dislike"` - добавить дизлайк (убирает лайк если был)
- `null` - убрать текущую реакцию

**Примеры:**

Добавить лайк:
```bash
POST /api/properties/prop_12345/reaction
Content-Type: application/json

{
  "reaction": "like"
}
```

Убрать реакцию:
```bash
POST /api/properties/prop_12345/reaction
Content-Type: application/json

{
  "reaction": null
}
```

### 2. Установить заметку

**Endpoint:** `POST /api/properties/:propertyId/note`

**Request body:**
```json
{
  "text": "Отличная квартира, нужно посмотреть в субботу"
}
```

**Response:**
```json
{
  "success": true,
  "note": {
    "propertyId": "prop_12345",
    "text": "Отличная квартира, нужно посмотреть в субботу",
    "updatedAt": "2024-02-11T10:30:00Z"
  }
}
```

**Ограничения:**
- Максимальная длина: 500 символов
- Минимальная длина: 1 символ (без пробелов)

### 3. Удалить заметку

**Endpoint:** `DELETE /api/properties/:propertyId/note`

**Response:**
```json
{
  "success": true
}
```

### 4. Получить все реакции пользователя

**Endpoint:** `GET /api/user/reactions`

**Response:**
```json
{
  "prop_12345": {
    "reaction": "like",
    "updatedAt": "2024-02-11T10:30:00Z"
  },
  "prop_67890": {
    "reaction": "dislike",
    "updatedAt": "2024-02-11T09:15:00Z"
  }
}
```

### 5. Получить все заметки пользователя

**Endpoint:** `GET /api/user/notes`

**Response:**
```json
{
  "prop_12345": {
    "text": "Отличная квартира",
    "updatedAt": "2024-02-11T10:30:00Z"
  },
  "prop_99999": {
    "text": "Слишком дорого",
    "updatedAt": "2024-02-11T08:00:00Z"
  }
}
```

### 6. Массовая синхронизация

**Endpoint:** `POST /api/user/actions/sync`

**Request body:**
```json
{
  "reactions": {
    "prop_12345": {
      "reaction": "like",
      "updatedAt": "2024-02-11T10:30:00Z"
    }
  },
  "notes": {
    "prop_12345": {
      "text": "Заметка",
      "updatedAt": "2024-02-11T10:30:00Z"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "syncedReactions": 1,
  "syncedNotes": 1,
  "conflicts": []
}
```

**Когда использовать:**
- При первой авторизации (синхронизация localStorage с сервером)
- После долгого оффлайна
- Периодическая синхронизация (каждые 5 минут)

## Типы данных

### PropertyReaction

```typescript
type PropertyReaction = 'like' | 'dislike' | null;
```

### PropertyReactionState

```typescript
interface PropertyReactionState {
    propertyId: string;
    reaction: PropertyReaction;
    updatedAt: string; // ISO 8601
}
```

### PropertyUserNote

```typescript
interface PropertyUserNote {
    propertyId: string;
    text: string;
    updatedAt: string; // ISO 8601
}
```

## Оптимистичные обновления

Клиент использует **оптимистичные обновления** для мгновенного UI:

1. Пользователь нажимает "Лайк"
2. UI обновляется мгновенно
3. Запрос отправляется на бекенд
4. При ошибке - откат изменений

**Пример кода (клиент):**

```typescript
import { usePropertyActions } from '@/entities/user-actions';

function PropertyCard({ property }) {
  const { isLiked, toggleLike } = usePropertyActions(property.id);
  
  // toggleLike автоматически:
  // 1. Обновляет UI
  // 2. Отправляет запрос
  // 3. Откатывает при ошибке
  
  return (
    <button onClick={toggleLike}>
      {isLiked ? 'Liked ❤️' : 'Like'}
    </button>
  );
}
```

## Конфликты и разрешение

При синхронизации возможны конфликты (разные данные на клиенте и сервере).

**Стратегия разрешения:**
- **Last-Write-Wins** - побеждает более свежая запись (по `updatedAt`)

**Пример конфликта:**

Клиент:
```json
{
  "prop_12345": {
    "reaction": "like",
    "updatedAt": "2024-02-11T10:30:00Z"
  }
}
```

Сервер:
```json
{
  "prop_12345": {
    "reaction": "dislike",
    "updatedAt": "2024-02-11T10:35:00Z"
  }
}
```

**Результат:** Побеждает сервер (более свежий timestamp).

## Авторизация

Все endpoints требуют авторизации:

```
Authorization: Bearer <JWT_TOKEN>
```

**Извлечение userId:**
```typescript
const userId = jwt.verify(token).sub;
```

## Валидация

### Реакция

- Только значения: `"like"`, `"dislike"`, `null`
- Проверка существования объекта

### Заметка

- Длина: 1-500 символов
- Trimmed (без пробелов по краям)
- Проверка существования объекта

## Производительность

### Дебаунсинг

Клиент дебаунсит запросы:
- Реакции: сразу
- Заметки: 500мс после последнего изменения

### Кеширование

Backend должен кешировать:
- GET `/api/user/reactions` - 5 минут
- GET `/api/user/notes` - 5 минут

Инвалидация при:
- POST reaction/note
- DELETE note
- Синхронизации

### Batch операции

Для массовых операций использовать `/api/user/actions/sync`.

## База данных

### Схема таблиц

**user_reactions:**
```sql
CREATE TABLE user_reactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    property_id VARCHAR(255) NOT NULL,
    reaction VARCHAR(10) CHECK (reaction IN ('like', 'dislike')),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_user_reactions_user_id ON user_reactions(user_id);
CREATE INDEX idx_user_reactions_property_id ON user_reactions(property_id);
```

**user_notes:**
```sql
CREATE TABLE user_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    property_id VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX idx_user_notes_property_id ON user_notes(property_id);
```

## Аналитика

Рекомендуется отслеживать:

1. **Лайки/дизлайки по объектам** - для рекомендательной системы
2. **Популярные объекты** - количество лайков
3. **Engagement** - % пользователей с реакциями
4. **Заметки** - как часто используются

## Безопасность

### 1. Авторизация
- Проверка JWT токена
- userId из токена, не из request body

### 2. Rate Limiting
- 100 запросов в минуту на пользователя
- 1000 объектов в batch sync

### 3. Валидация
- Проверка длины текста
- Санитизация HTML (если поддерживается)
- Проверка существования объектов

### 4. CORS
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

## Тестирование

### Примеры запросов (curl)

**Лайк:**
```bash
curl -X POST https://api.example.com/api/properties/prop_12345/reaction \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reaction":"like"}'
```

**Заметка:**
```bash
curl -X POST https://api.example.com/api/properties/prop_12345/note \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great apartment!"}'
```

**Получить реакции:**
```bash
curl https://api.example.com/api/user/reactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Интеграция

### Использование в других частях системы

**Фильтрация объектов по реакциям:**
```
GET /api/properties?markerType=like
GET /api/properties?markerType=dislike
```

**Экспорт в избранное:**
```
POST /api/favorites/import-from-reactions
```

**Рекомендации:**
```
GET /api/recommendations?based_on=reactions
```

## Changelog

### v1.0.0 (2024-02-11)
- Начальная версия API
- Реакции (лайк/дизлайк)
- Заметки
- Массовая синхронизация
- Оптимистичные обновления
