# WebSocket Соединение — Документация для бекенда

## Обзор

Система WebSocket для real-time уведомлений о новых объектах недвижимости от AI агента.

**Основные возможности:**
- Push-уведомления о новых объектах
- Автоматическая переподключение при разрыве связи
- Fallback на polling simulation для разработки
- Поддержка heartbeat/ping-pong для поддержания соединения

## Архитектура

### Клиентская часть

**Файлы:**
- `src/shared/hooks/use-websocket.ts` - хук для WebSocket соединения
- `src/app/providers/WebSocketProvider.tsx` - провайдер для глобального доступа
- `src/shared/ui/property-toast/` - UI компоненты для тостов
- `src/features/chat-messages/model/toast-store.ts` - store для управления тостами

### Подключение

WebSocket автоматически определяет протокол (ws/wss) на основе текущего URL:

```typescript
const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket`;
```

**Production URL:** `wss://yourdomain.com/api/websocket`
**Development URL:** `ws://localhost:3000/api/websocket`

## Протокол обмена данными

### 1. Установка соединения

**Клиент → Сервер (при подключении):**

```json
{
  "type": "auth",
  "token": "JWT_TOKEN",
  "userId": "user_123"
}
```

**Сервер → Клиент (подтверждение):**

```json
{
  "type": "auth_success",
  "userId": "user_123",
  "sessionId": "session_abc"
}
```

### 2. Heartbeat (Ping/Pong)

Для поддержания соединения клиент отправляет ping каждые 30 секунд:

**Клиент → Сервер:**

```json
{
  "type": "ping",
  "timestamp": 1707620400000
}
```

**Сервер → Клиент:**

```json
{
  "type": "pong",
  "timestamp": 1707620400000
}
```

**Важно:** Если сервер не отвечает на ping в течение 10 секунд, клиент считает соединение разорванным и инициирует переподключение.

### 3. Уведомление о новом объекте

**Сервер → Клиент:**

```json
{
  "type": "property",
  "property": {
    "id": "prop_12345",
    "title": "Квартира в центре Барселоны",
    "price": 1200,
    "rooms": 2,
    "area": 75,
    "floor": 3,
    "totalFloors": 5,
    "address": "Carrer de Balmes, 123",
    "city": "Barcelona",
    "district": "Eixample",
    "coordinates": {
      "lat": 41.3874,
      "lng": 2.1686
    },
    "images": [
      "https://cdn.example.com/images/prop_12345_1.jpg",
      "https://cdn.example.com/images/prop_12345_2.jpg"
    ],
    "type": "apartment",
    "isNew": true,
    "isVerified": true,
    "createdAt": "2024-02-11T10:30:00Z"
  },
  "metadata": {
    "filterName": "Barcelona Center 2BR",
    "filterId": "filter_abc123",
    "matchScore": 0.95
  }
}
```

**Описание полей property:**

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `id` | string | ✅ | Уникальный ID объекта |
| `title` | string | ✅ | Название объекта |
| `price` | number | ✅ | Цена в евро (для аренды - месячная) |
| `rooms` | number | ✅ | Количество комнат (0 для студии) |
| `area` | number | ✅ | Площадь в м² |
| `floor` | number | ❌ | Этаж |
| `totalFloors` | number | ❌ | Всего этажей в здании |
| `address` | string | ✅ | Полный адрес |
| `city` | string | ✅ | Город |
| `district` | string | ❌ | Район |
| `coordinates` | object | ✅ | Координаты `{ lat, lng }` |
| `images` | string[] | ✅ | Массив URL изображений |
| `type` | string | ✅ | Тип: `apartment`, `house`, `studio`, etc. |
| `isNew` | boolean | ❌ | Новый объект (< 7 дней) |
| `isVerified` | boolean | ❌ | Проверен агентством |
| `createdAt` | string | ✅ | ISO 8601 дата создания |

## Требования к бекенду

### 1. Endpoint

**URL:** `/api/websocket`
**Протокол:** WebSocket (RFC 6455)

### 2. Аутентификация

- JWT токен в первом сообщении после подключения
- Сессионный ID для отслеживания соединений
- Timeout: 60 секунд на авторизацию после подключения

### 3. Rate Limiting

- Максимум 100 сообщений в минуту на пользователя
- При превышении: отправить `error` с кодом `RATE_LIMIT_EXCEEDED`

### 4. Ping/Pong

- Клиент отправляет ping каждые 30 секунд
- Сервер должен отвечать pong в течение 5 секунд
- Timeout: 60 секунд без ping → закрыть соединение

## Мониторинг

### Метрики для отслеживания

1. **Активные соединения** - количество WebSocket соединений
2. **Сообщения** - количество и частота уведомлений
3. **Ошибки** - неудачные подключения и разрывы
4. **Performance** - время отклика на ping, throughput

## Fallback Mode (Simulation)

Если WebSocket недоступен, включается режим симуляции для разработки.

См. полную документацию в файле для деталей протокола.
