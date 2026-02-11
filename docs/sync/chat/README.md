# Чат — Документация для синхронизации с бекендом

## Обзор

Система чата поддерживает три типа разговоров:
1. **p2p** — диалоги между пользователями
2. **support** — чаты с поддержкой
3. **ai-agent** — беседы с AI агентом для подбора недвижимости

Все разговоры поддерживают real-time обновления через WebSocket.

---

## Типы данных

### Conversation (Беседа)

```typescript
interface Conversation {
  id: string;                    // Уникальный ID беседы
  type: 'p2p' | 'support' | 'ai-agent';
  title?: string;                // Название беседы (для p2p - имя собеседника)
  avatar?: string;               // URL аватара
  lastMessage?: ChatMessage;     // Последнее сообщение для превью
  unreadCount: number;           // Количество непрочитанных
  isOnline?: boolean;            // Статус онлайн (для p2p/support)
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### ChatMessage (Сообщение)

```typescript
type MessageType = 
  | 'text'           // Текстовое сообщение
  | 'property'       // Объект недвижимости
  | 'property-batch' // Пакет объектов
  | 'system'         // Системное сообщение
  | 'ai-status';     // Статус AI агента

type MessageStatus = 
  | 'sending'   // Отправляется
  | 'sent'      // Отправлено
  | 'delivered' // Доставлено
  | 'read'      // Прочитано
  | 'error';    // Ошибка отправки

interface ChatMessage {
  id: string;                    // Уникальный ID сообщения
  conversationId: string;        // ID беседы
  senderId: string;              // ID отправителя
  type: MessageType;
  content: string;               // Текст сообщения
  properties?: Property[];       // Массив объектов (для type: property/property-batch)
  status: MessageStatus;
  createdAt: string;             // ISO 8601 timestamp
  isRealTime?: boolean;          // Флаг WebSocket сообщения (не отправляется на бекенд)
  metadata?: {
    filterName?: string;         // Название фильтра (для AI агента)
    filterId?: string;           // ID фильтра (для AI агента)
    [key: string]: any;          // Дополнительные мета-данные
  };
}
```

### AIAgentSettings (Настройки AI агента)

```typescript
interface AIAgentSettings {
  notificationStartHour: number;  // Начало периода уведомлений (0-23)
  notificationEndHour: number;    // Конец периода уведомлений (0-23)
  notificationFrequency: number;  // Частота в минутах (0, 15, 30, 60, 120)
  linkedFilterIds: string[];      // IDs привязанных фильтров поиска
}
```

### PropertyBatch (Пакет объектов для AI)

```typescript
interface PropertyBatch {
  id: string;
  filterId: string;
  filterName: string;
  properties: Property[];
  timestamp: string;              // ISO 8601 timestamp
}
```

---

## API Endpoints

### 1. Получение списка бесед

**Endpoint:** `GET /api/chat/conversations`

**Response:**

```typescript
interface ConversationsResponse {
  conversations: Conversation[];
}
```

**Пример:**

```json
{
  "conversations": [
    {
      "id": "conv_ai_1",
      "type": "ai-agent",
      "title": "AI Property Assistant",
      "avatar": "/avatars/ai-agent.png",
      "lastMessage": {
        "id": "msg_123",
        "conversationId": "conv_ai_1",
        "senderId": "ai-agent",
        "type": "property",
        "content": "",
        "properties": [...],
        "status": "delivered",
        "createdAt": "2026-02-11T10:30:00Z",
        "metadata": {
          "filterName": "Barcelona Center",
          "filterId": "filter_1"
        }
      },
      "unreadCount": 5,
      "isOnline": true,
      "createdAt": "2026-02-10T08:00:00Z",
      "updatedAt": "2026-02-11T10:30:00Z"
    },
    {
      "id": "conv_support_1",
      "type": "support",
      "title": "Support Team",
      "avatar": "/avatars/support.png",
      "lastMessage": {...},
      "unreadCount": 0,
      "isOnline": true,
      "createdAt": "2026-02-09T15:00:00Z",
      "updatedAt": "2026-02-10T12:00:00Z"
    }
  ]
}
```

---

### 2. Получение сообщений беседы

**Endpoint:** `GET /api/chat/messages/{conversationId}`

**Query параметры:**

```typescript
interface MessagesRequest {
  page?: number;     // Номер страницы (default: 1)
  limit?: number;    // Количество сообщений (default: 50, max: 100)
}
```

**Response:**

```typescript
interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
```

**Пример:**

```json
{
  "messages": [
    {
      "id": "msg_100",
      "conversationId": "conv_ai_1",
      "senderId": "current_user",
      "type": "text",
      "content": "Show me apartments in Barcelona",
      "status": "read",
      "createdAt": "2026-02-11T09:00:00Z"
    },
    {
      "id": "msg_101",
      "conversationId": "conv_ai_1",
      "senderId": "ai-agent",
      "type": "property",
      "content": "",
      "properties": [{...}],
      "status": "delivered",
      "createdAt": "2026-02-11T09:05:00Z",
      "metadata": {
        "filterName": "Barcelona Center",
        "filterId": "filter_1"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "hasMore": true
  }
}
```

---

### 3. Отправка сообщения

**Endpoint:** `POST /api/chat/messages`

**Request body:**

```typescript
interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;  // По умолчанию: 'text'
}
```

**Response:**

```typescript
interface SendMessageResponse {
  message: ChatMessage;
}
```

**Пример:**

```json
// Request
{
  "conversationId": "conv_support_1",
  "content": "I need help with property viewing"
}

// Response
{
  "message": {
    "id": "msg_new_123",
    "conversationId": "conv_support_1",
    "senderId": "current_user",
    "type": "text",
    "content": "I need help with property viewing",
    "status": "sent",
    "createdAt": "2026-02-11T11:00:00Z"
  }
}
```

---

### 4. Отметить сообщения как прочитанные

**Endpoint:** `POST /api/chat/conversations/{conversationId}/read`

**Request body:**

```typescript
interface ReadRequest {
  messageIds?: string[];  // Опционально: конкретные сообщения. Если не указано - все
}
```

**Response:**

```typescript
interface ReadResponse {
  success: boolean;
  unreadCount: number;    // Новое количество непрочитанных
}
```

---

### 5. Получение объектов от AI агента

**Endpoint:** `GET /api/chat/ai-properties`

**Query параметры:**

```typescript
interface AIPropertiesRequest {
  dayFilter?: 'today' | 'yesterday' | 'this-week' | 'this-month' | 'all';
  filterIds?: string[];   // IDs фильтров для отображения (через запятую)
}
```

**Response:**

```typescript
interface AIPropertiesResponse {
  batches: PropertyBatch[];
  totalProperties: number;
}
```

**Пример:**

```json
// Request: GET /api/chat/ai-properties?dayFilter=today&filterIds=filter_1,filter_2

// Response
{
  "batches": [
    {
      "id": "batch_1",
      "filterId": "filter_1",
      "filterName": "Barcelona Center",
      "properties": [{...}, {...}],
      "timestamp": "2026-02-11T10:00:00Z"
    },
    {
      "id": "batch_2",
      "filterId": "filter_2",
      "filterName": "Gracia Budget",
      "properties": [{...}],
      "timestamp": "2026-02-11T11:30:00Z"
    }
  ],
  "totalProperties": 15
}
```

---

### 6. Получение настроек AI агента

**Endpoint:** `GET /api/chat/ai-settings`

**Response:**

```typescript
interface AISettingsResponse {
  settings: AIAgentSettings;
}
```

**Пример:**

```json
{
  "settings": {
    "notificationStartHour": 7,
    "notificationEndHour": 22,
    "notificationFrequency": 15,
    "linkedFilterIds": ["filter_1", "filter_2"]
  }
}
```

---

### 7. Обновление настроек AI агента

**Endpoint:** `PUT /api/chat/ai-settings`

**Request body:**

```typescript
interface UpdateAISettingsRequest {
  notificationStartHour?: number;
  notificationEndHour?: number;
  notificationFrequency?: number;
  linkedFilterIds?: string[];
}
```

**Response:**

```typescript
interface UpdateAISettingsResponse {
  success: boolean;
  settings: AIAgentSettings;
}
```

**Пример:**

```json
// Request
{
  "notificationStartHour": 8,
  "notificationEndHour": 20,
  "notificationFrequency": 30,
  "linkedFilterIds": ["filter_1", "filter_2", "filter_3"]
}

// Response
{
  "success": true,
  "settings": {
    "notificationStartHour": 8,
    "notificationEndHour": 20,
    "notificationFrequency": 30,
    "linkedFilterIds": ["filter_1", "filter_2", "filter_3"]
  }
}
```

---

## WebSocket События

### Подключение

**URL:** `wss://api.example.com/ws/chat`

**Headers:**

```
Authorization: Bearer {token}
```

### События от сервера → клиент

#### 1. Новое сообщение

```typescript
{
  event: 'message.new',
  data: {
    message: ChatMessage
  }
}
```

#### 2. Статус сообщения изменён

```typescript
{
  event: 'message.status',
  data: {
    messageId: string;
    status: MessageStatus;
    conversationId: string;
  }
}
```

#### 3. Беседа обновлена

```typescript
{
  event: 'conversation.updated',
  data: {
    conversation: Conversation
  }
}
```

#### 4. Пользователь печатает

```typescript
{
  event: 'user.typing',
  data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }
}
```

#### 5. Пользователь онлайн/оффлайн

```typescript
{
  event: 'user.presence',
  data: {
    userId: string;
    isOnline: boolean;
  }
}
```

#### 6. Новый объект от AI агента

```typescript
{
  event: 'ai.property',
  data: {
    conversationId: string;
    property: Property;
    filterId: string;
    filterName: string;
  }
}
```

### События от клиента → сервер

#### 1. Отправка сообщения

```typescript
{
  event: 'message.send',
  data: {
    conversationId: string;
    content: string;
    type?: MessageType;
    tempId?: string;  // ID для оптимистичного обновления
  }
}
```

#### 2. Индикатор печати

```typescript
{
  event: 'typing.start' | 'typing.stop',
  data: {
    conversationId: string;
  }
}
```

#### 3. Прочитано

```typescript
{
  event: 'message.read',
  data: {
    conversationId: string;
    messageIds: string[];
  }
}
```

---

## Оптимистичные обновления

### Отправка сообщения

1. **Клиент создаёт временное сообщение:**

```typescript
const tempMessage: ChatMessage = {
  id: `msg_temp_${Date.now()}`,
  conversationId,
  senderId: currentUserId,
  type: 'text',
  content,
  status: 'sending',
  createdAt: new Date().toISOString(),
};
```

2. **Клиент добавляет в локальное состояние:**

```typescript
// Zustand store
set((state) => ({
  messages: {
    ...state.messages,
    [conversationId]: [...state.messages[conversationId], tempMessage],
  },
}));
```

3. **Клиент отправляет через WebSocket с tempId:**

```typescript
websocket.send({
  event: 'message.send',
  data: {
    conversationId,
    content,
    tempId: tempMessage.id,
  },
});
```

4. **Сервер отвечает с реальным ID:**

```typescript
{
  event: 'message.new',
  data: {
    message: {
      id: 'msg_real_456',
      tempId: 'msg_temp_123',  // Связка с временным ID
      ...
    }
  }
}
```

5. **Клиент заменяет временное сообщение:**

```typescript
set((state) => ({
  messages: {
    ...state.messages,
    [conversationId]: state.messages[conversationId].map((m) =>
      m.id === tempMessage.id ? { ...data.message, status: 'sent' } : m
    ),
  },
}));
```

---

## Пагинация

### Скроллинг вверх (история)

```typescript
// Загрузка предыдущих сообщений
const loadMore = async () => {
  const currentPage = 1; // Текущая страница из стейта
  const data = await getMessages(conversationId, currentPage + 1);
  
  // Добавляем сообщения в начало списка
  set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: [...data.messages, ...state.messages[conversationId]],
    },
  }));
};
```

### Infinite scroll с Intersection Observer

```typescript
const observerRef = useRef<IntersectionObserver>();

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    },
    { threshold: 1.0 }
  );

  const sentinel = document.getElementById('load-more-sentinel');
  if (sentinel) observer.observe(sentinel);

  return () => observer.disconnect();
}, [hasMore]);
```

---

## Производительность

### Виртуализация списка сообщений

Для чатов с большим количеством сообщений используется виртуализация:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: messages.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 80, // Средняя высота сообщения
  overscan: 5,
});
```

### Дебаунсинг индикатора печати

```typescript
import { useDebouncedCallback } from 'use-debounce';

const notifyTyping = useDebouncedCallback(() => {
  websocket.send({
    event: 'typing.start',
    data: { conversationId },
  });
}, 300);
```

### Мемоизация компонентов

```typescript
const MessageBubble = React.memo(({ message, isOwn }) => {
  // ...
});

const PropertyCard = React.memo(({ property }) => {
  // ...
});
```

---

## Обработка ошибок

### Повторная отправка при ошибке

```typescript
const retryMessage = async (messageId: string) => {
  const message = messages[conversationId].find((m) => m.id === messageId);
  if (!message) return;

  // Обновляем статус на "sending"
  set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: state.messages[conversationId].map((m) =>
        m.id === messageId ? { ...m, status: 'sending' } : m
      ),
    },
  }));

  try {
    await sendMessage(conversationId, message.content);
  } catch (error) {
    // Возвращаем статус error
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId].map((m) =>
          m.id === messageId ? { ...m, status: 'error' } : m
        ),
      },
    }));
  }
};
```

### Переподключение WebSocket

```typescript
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

const reconnect = () => {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('Max reconnection attempts reached');
    return;
  }

  const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000); // Exponential backoff
  reconnectAttempts++;

  setTimeout(() => {
    connectWebSocket();
  }, delay);
};

websocket.onclose = () => {
  console.log('WebSocket closed, reconnecting...');
  reconnect();
};

websocket.onerror = (error) => {
  console.error('WebSocket error:', error);
  websocket.close();
};
```

---

## Безопасность

### Валидация на бекенде

- Все входящие сообщения должны валидироваться
- Максимальная длина текстового сообщения: 10,000 символов
- Rate limiting: 10 сообщений в минуту на пользователя

### Санитизация контента

- HTML теги должны быть экранированы
- URL должны быть валидированы
- Изображения должны проходить модерацию

### Авторизация

- JWT токен в WebSocket подключении
- Проверка доступа к беседе перед отправкой сообщений
- Проверка прав на чтение сообщений

---

## Мониторинг и аналитика

### Метрики

- Время доставки сообщения (end-to-end latency)
- Количество сообщений в секунду
- Процент успешных доставок
- Количество активных WebSocket подключений
- Время переподключения при обрыве

### Логирование

```typescript
console.log('[Chat] Message sent', {
  conversationId,
  messageId,
  type: message.type,
  timestamp: Date.now(),
});

console.log('[Chat] Message received', {
  conversationId,
  messageId,
  senderId: message.senderId,
  latency: Date.now() - new Date(message.createdAt).getTime(),
});
```

---

## Тестирование

### Моки для разработки

Текущая реализация использует моки:

- `src/shared/api/chat.ts` — функции с fallback на моки
- `src/shared/api/mocks/chat-mock.ts` — генераторы mock данных

### Переключение на реальный бекенд

```typescript
// .env.local
NEXT_PUBLIC_USE_MOCK_CHAT=false
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com/ws
```

---

## Примеры использования

### Пример 1: Получение и отображение бесед

```typescript
const { conversations, fetchConversations } = useChatStore();

useEffect(() => {
  fetchConversations();
}, []);

return (
  <div>
    {conversations.map((conv) => (
      <ConversationItem key={conv.id} conversation={conv} />
    ))}
  </div>
);
```

### Пример 2: Отправка сообщения

```typescript
const { sendMessage, isSending } = useChatStore();

const handleSend = async (content: string) => {
  await sendMessage(activeConversationId, content);
};
```

### Пример 3: Real-time обновления

```typescript
useEffect(() => {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    const { event: eventName, data } = JSON.parse(event.data);

    switch (eventName) {
      case 'message.new':
        addIncomingMessage(data.message);
        break;
      case 'message.status':
        updateMessageStatus(data.messageId, data.status);
        break;
      // ...
    }
  };

  return () => ws.close();
}, []);
```

---

## Миграция с моков на бекенд

### Чеклист

1. **Настроить переменные окружения:**
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_WS_URL`

2. **Обновить API функции:**
   - Удалить fallback на моки
   - Добавить proper error handling

3. **Настроить WebSocket:**
   - Добавить авторизацию через JWT
   - Реализовать переподключение
   - Добавить heartbeat/ping-pong

4. **Тестирование:**
   - Проверить все типы сообщений
   - Проверить пагинацию
   - Проверить оптимистичные обновления
   - Проверить обработку ошибок

5. **Мониторинг:**
   - Настроить логирование
   - Добавить метрики
   - Настроить алерты

---

## Дополнительные требования

### i18n (Интернационализация)

Все строки в UI должны использовать `next-intl`:

```typescript
const t = useTranslations('chat');
<span>{t('messagePlaceholder')}</span>
```

### Адаптивность

- Мобильная версия: полноэкранный чат
- Десктоп: сайдбар + окно чата
- Планшет: адаптивный layout

### Темы

- Поддержка светлой и тёмной темы
- Цвета через CSS-переменные

### Доступность (A11y)

- Keyboard navigation
- Screen reader support
- ARIA labels для всех интерактивных элементов
