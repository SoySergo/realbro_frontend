# Profile API — Документация для бекенда

## Обзор

Система управления профилем пользователя с поддержкой:
- **Основная информация** — email, имя, статистика
- **Подписки и платежи** — управление тарифами, история платежей
- **Уведомления** — настройка email, push и Telegram уведомлений
- **Безопасность** — смена пароля, управление сессиями
- **Персонализация** — язык, тема, валюта, часовой пояс

---

## Архитектура

### Клиентская часть

**Структура:**
```
src/widgets/profile/
├── profile-widget.tsx              # Основной виджет с табами
└── tabs/
    ├── profile-general-tab.tsx     # Личная информация
    ├── profile-subscription-tab.tsx # Подписки и платежи
    ├── profile-notifications-tab.tsx # Настройки уведомлений
    ├── profile-security-tab.tsx    # Безопасность
    └── profile-appearance-tab.tsx  # Оформление

src/entities/user/
├── model/
│   ├── types.ts                    # TypeScript типы
│   ├── validation.ts               # Zod схемы валидации
│   └── index.ts
└── index.ts

src/shared/api/
├── users.ts                        # API клиент для профиля
└── auth.ts                         # API клиент для аутентификации
```

**Хранение данных:**
- **Backend API** - основное хранилище
- **Zustand** (опционально) - локальное состояние для UI
- **localStorage** - опционально для кеширования

---

## API Endpoints

### 1. Получить профиль текущего пользователя

**Endpoint:** `GET /api/v1/users/me`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "role": "user",
  "is_active": true,
  "settings": {
    "language": "ru",
    "theme": "dark",
    "display_name": "Иван Иванов",
    "notifications_email": true,
    "notifications_push": true
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-11T14:20:00Z"
}
```

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

### 2. Обновить профиль пользователя

**Endpoint:** `PUT /api/v1/users/me`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body:**
```json
{
  "email": "newemail@example.com",
  "settings": {
    "display_name": "Новое имя",
    "language": "en",
    "theme": "light",
    "notifications_email": false
  }
}
```

**Response:** Аналогично GET `/api/v1/users/me`

**Валидация:**
- `email` - валидный email адрес
- `settings.display_name` - 1-50 символов
- `settings.language` - 2-5 символов (ISO 639-1)
- `settings.theme` - только "light", "dark", "system"

**Коды ответа:**
- `200 OK` - успешно обновлено
- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован
- `409 Conflict` - email уже занят
- `500 Internal Server Error` - ошибка сервера

**Пример ошибки валидации:**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Invalid email format"],
    "settings.display_name": ["Must be between 1 and 50 characters"]
  }
}
```

---

### 3. Получить публичный профиль пользователя

**Endpoint:** `GET /api/v1/users/{userId}`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "role": "user",
  "is_active": true,
  "settings": {
    "display_name": "Иван Иванов"
  },
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Примечание:** Возвращает только публичную информацию (без приватных настроек).

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `404 Not Found` - пользователь не найден
- `500 Internal Server Error` - ошибка сервера

---

## Расширенные данные профиля

Для страницы профиля используется расширенная версия данных, включающая подписки, платежи и сессии.

### 4. Получить расширенный профиль

**Endpoint:** `GET /api/v1/users/me/extended`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "role": "user",
  "is_active": true,
  "settings": {
    "language": "ru",
    "theme": "dark",
    "display_name": "Иван Иванов",
    "notifications": {
      "email": {
        "newProperties": true,
        "priceChanges": true,
        "savedSearches": false,
        "promotions": false,
        "accountUpdates": true
      },
      "push": {
        "newProperties": true,
        "priceChanges": false,
        "savedSearches": false,
        "messages": true
      },
      "telegram": {
        "enabled": false,
        "newProperties": false,
        "priceChanges": false
      }
    },
    "currency": "EUR",
    "timezone": "Europe/Madrid"
  },
  "subscription": {
    "id": "sub_123",
    "planId": "standard",
    "status": "active",
    "currentPeriodStart": "2024-02-01T00:00:00Z",
    "currentPeriodEnd": "2024-03-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "createdAt": "2024-02-01T00:00:00Z"
  },
  "stats": {
    "savedProperties": 15,
    "savedSearches": 3,
    "viewedProperties": 127
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-02-11T14:20:00Z"
}
```

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

## Настройки уведомлений

### 5. Обновить настройки уведомлений

**Endpoint:** `PUT /api/v1/users/me/notifications`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body:**
```json
{
  "email": {
    "newProperties": true,
    "priceChanges": false,
    "savedSearches": true,
    "promotions": false,
    "accountUpdates": true
  },
  "push": {
    "newProperties": false,
    "priceChanges": true,
    "savedSearches": false,
    "messages": true
  },
  "telegram": {
    "enabled": true,
    "chatId": "123456789",
    "newProperties": true,
    "priceChanges": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "notifications": {
    "email": { ... },
    "push": { ... },
    "telegram": { ... }
  }
}
```

**Коды ответа:**
- `200 OK` - успешно обновлено
- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

## Управление подпиской

### 6. Получить доступные тарифные планы

**Endpoint:** `GET /api/v1/subscription/plans`

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Бесплатный",
      "price": 0,
      "currency": "EUR",
      "period": "monthly",
      "features": {
        "searchTabs": 1,
        "aiFilters": 0,
        "ownerAccess": false,
        "durationDays": -1
      }
    },
    {
      "id": "standard",
      "name": "Стандарт",
      "price": 9.99,
      "currency": "EUR",
      "period": "monthly",
      "features": {
        "searchTabs": 5,
        "aiFilters": 10,
        "ownerAccess": true,
        "ownerAccessMultiplier": 1.0,
        "durationDays": 30
      }
    },
    {
      "id": "maximum",
      "name": "Максимум",
      "price": 19.99,
      "currency": "EUR",
      "period": "monthly",
      "features": {
        "searchTabs": 999,
        "aiFilters": 999,
        "ownerAccess": true,
        "ownerAccessMultiplier": 1.0,
        "durationDays": 30
      }
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - успешно
- `500 Internal Server Error` - ошибка сервера

---

### 7. Изменить подписку

**Endpoint:** `POST /api/v1/subscription/change`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body:**
```json
{
  "planId": "standard",
  "paymentMethodId": "pm_123456"
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_new_123",
    "planId": "standard",
    "status": "active",
    "currentPeriodStart": "2024-02-11T15:00:00Z",
    "currentPeriodEnd": "2024-03-11T15:00:00Z",
    "cancelAtPeriodEnd": false,
    "createdAt": "2024-02-11T15:00:00Z"
  }
}
```

**Валидация:**
- `planId` - должен быть одним из: "free", "trial", "standard", "maximum"
- `paymentMethodId` - обязателен для платных планов

**Коды ответа:**
- `200 OK` - успешно изменено
- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован
- `402 Payment Required` - ошибка оплаты
- `404 Not Found` - план не найден
- `500 Internal Server Error` - ошибка сервера

---

### 8. Отменить подписку

**Endpoint:** `POST /api/v1/subscription/cancel`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body:**
```json
{
  "reason": "Слишком дорого",
  "cancelAtPeriodEnd": true
}
```

**Response:**
```json
{
  "success": true,
  "subscription": {
    "id": "sub_123",
    "planId": "standard",
    "status": "active",
    "currentPeriodStart": "2024-02-01T00:00:00Z",
    "currentPeriodEnd": "2024-03-01T00:00:00Z",
    "cancelAtPeriodEnd": true,
    "createdAt": "2024-02-01T00:00:00Z"
  }
}
```

**Примечание:** При `cancelAtPeriodEnd: true` подписка останется активной до конца оплаченного периода.

**Коды ответа:**
- `200 OK` - успешно отменено
- `400 Bad Request` - нечего отменять (нет активной подписки)
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

## Платежи

### 9. Получить историю платежей

**Endpoint:** `GET /api/v1/payments/history`

**Query параметры:**
```
?limit=10&page=1
```

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "payments": [
    {
      "id": "pay_123",
      "amount": 9.99,
      "currency": "EUR",
      "status": "succeeded",
      "description": "Подписка Standard (Февраль 2024)",
      "planId": "standard",
      "paymentMethodId": "pm_123",
      "invoiceUrl": "https://example.com/invoice/pay_123.pdf",
      "createdAt": "2024-02-01T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

### 10. Получить способы оплаты

**Endpoint:** `GET /api/v1/payments/methods`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "methods": [
    {
      "id": "pm_123",
      "type": "card",
      "isDefault": true,
      "card": {
        "brand": "visa",
        "last4": "4242",
        "expiryMonth": 12,
        "expiryYear": 2025
      },
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "pm_456",
      "type": "paypal",
      "isDefault": false,
      "paypal": {
        "email": "user@example.com"
      },
      "createdAt": "2024-02-01T15:00:00Z"
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

### 11. Добавить способ оплаты

**Endpoint:** `POST /api/v1/payments/methods`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body (для карты):**
```json
{
  "type": "card",
  "token": "tok_visa_4242",
  "isDefault": true
}
```

**Request body (для PayPal):**
```json
{
  "type": "paypal",
  "token": "ba_paypal_123",
  "isDefault": false
}
```

**Response:**
```json
{
  "success": true,
  "method": {
    "id": "pm_new_123",
    "type": "card",
    "isDefault": true,
    "card": {
      "brand": "visa",
      "last4": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025
    },
    "createdAt": "2024-02-11T15:30:00Z"
  }
}
```

**Коды ответа:**
- `201 Created` - успешно добавлено
- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован
- `402 Payment Required` - ошибка обработки платежного метода
- `500 Internal Server Error` - ошибка сервера

---

### 12. Удалить способ оплаты

**Endpoint:** `DELETE /api/v1/payments/methods/{methodId}`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

**Коды ответа:**
- `200 OK` - успешно удалено
- `400 Bad Request` - нельзя удалить последний способ оплаты
- `401 Unauthorized` - не авторизован
- `404 Not Found` - способ оплаты не найден
- `500 Internal Server Error` - ошибка сервера

---

## Безопасность

### 13. Получить активные сессии

**Endpoint:** `GET /api/v1/auth/sessions`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "active_sessions": 3,
  "sessions": [
    {
      "id": "sess_123",
      "device": "MacBook Pro",
      "browser": "Chrome 120.0",
      "location": "Barcelona, Spain",
      "ip": "192.168.1.1",
      "lastActive": "2024-02-11T15:00:00Z",
      "isCurrent": true,
      "createdAt": "2024-02-10T10:00:00Z"
    },
    {
      "id": "sess_456",
      "device": "iPhone 15",
      "browser": "Safari 17.0",
      "location": "Madrid, Spain",
      "ip": "192.168.1.2",
      "lastActive": "2024-02-11T12:00:00Z",
      "isCurrent": false,
      "createdAt": "2024-02-09T08:00:00Z"
    }
  ]
}
```

**Коды ответа:**
- `200 OK` - успешно
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

### 14. Завершить сессию

**Endpoint:** `DELETE /api/v1/auth/sessions/{sessionId}`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

**Коды ответа:**
- `200 OK` - успешно завершено
- `400 Bad Request` - нельзя завершить текущую сессию
- `401 Unauthorized` - не авторизован
- `404 Not Found` - сессия не найдена
- `500 Internal Server Error` - ошибка сервера

---

### 15. Завершить все сессии кроме текущей

**Endpoint:** `POST /api/v1/auth/sessions/terminate-all`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "message": "All other sessions terminated successfully",
  "terminatedCount": 2
}
```

**Коды ответа:**
- `200 OK` - успешно завершено
- `401 Unauthorized` - не авторизован
- `500 Internal Server Error` - ошибка сервера

---

### 16. Сменить пароль

**Endpoint:** `POST /api/v1/auth/change-password`

**Headers:**
```
Cookie: access_token={JWT_TOKEN}
Content-Type: application/json
```

**Request body:**
```json
{
  "old_password": "OldPassword123",
  "new_password": "NewPassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Валидация:**
- `old_password` - обязательное поле
- `new_password` - минимум 8 символов, должен содержать буквы и цифры

**Коды ответа:**
- `200 OK` - успешно изменено
- `400 Bad Request` - ошибка валидации
- `401 Unauthorized` - не авторизован или неверный старый пароль
- `500 Internal Server Error` - ошибка сервера

---

## Типы данных

### UserResponse

```typescript
interface UserResponse {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  settings: UserSettings;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### UserSettings

```typescript
interface UserSettings {
  language?: string;           // ISO 639-1 (ru, en, es, ca, etc.)
  notifications_email?: boolean;
  notifications_push?: boolean;
  theme?: 'light' | 'dark' | 'system';
  display_name?: string;       // 1-50 символов
}
```

### ExtendedUserProfile

```typescript
interface ExtendedUserProfile {
  id: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  settings: ExtendedUserSettings;
  subscription?: UserSubscription;
  stats?: {
    savedProperties: number;
    savedSearches: number;
    viewedProperties: number;
  };
  created_at: string;
  updated_at: string;
}
```

### ExtendedUserSettings

```typescript
interface ExtendedUserSettings extends UserSettings {
  notifications: NotificationSettings;
  currency?: string;          // ISO 4217 (EUR, USD, GBP)
  timezone?: string;          // IANA timezone (Europe/Madrid)
}
```

### NotificationSettings

```typescript
interface NotificationSettings {
  email: {
    newProperties: boolean;
    priceChanges: boolean;
    savedSearches: boolean;
    promotions: boolean;
    accountUpdates: boolean;
  };
  push: {
    newProperties: boolean;
    priceChanges: boolean;
    savedSearches: boolean;
    messages: boolean;
  };
  telegram: {
    enabled: boolean;
    chatId?: string;
    newProperties: boolean;
    priceChanges: boolean;
  };
}
```

### UserSubscription

```typescript
interface UserSubscription {
  id: string;
  planId: 'free' | 'trial' | 'standard' | 'maximum';
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  currentPeriodStart: string; // ISO 8601
  currentPeriodEnd: string;   // ISO 8601
  cancelAtPeriodEnd: boolean;
  createdAt: string;          // ISO 8601
}
```

### PaymentMethod

```typescript
interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer';
  isDefault: boolean;
  card?: {
    brand: string;           // visa, mastercard, amex
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  };
  paypal?: {
    email: string;
  };
  createdAt: string;         // ISO 8601
}
```

### PaymentHistory

```typescript
interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;           // ISO 4217
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  description: string;
  planId?: 'free' | 'trial' | 'standard' | 'maximum';
  paymentMethodId?: string;
  invoiceUrl?: string;
  createdAt: string;          // ISO 8601
}
```

### UserSession

```typescript
interface UserSession {
  id: string;
  device: string;             // MacBook Pro, iPhone 15, etc.
  browser: string;            // Chrome 120.0, Safari 17.0
  location?: string;          // Barcelona, Spain
  ip?: string;
  lastActive: string;         // ISO 8601
  isCurrent: boolean;
  createdAt: string;          // ISO 8601
}
```

---

## Валидация

Все endpoints используют Zod схемы для валидации на клиенте:

```typescript
import { z } from 'zod';

// Схема настроек пользователя
const userSettingsSchema = z.object({
  language: z.string().min(2).max(5).optional(),
  notifications_email: z.boolean().optional(),
  notifications_push: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  display_name: z.string().min(1).max(50).optional(),
});

// Схема обновления профиля
const updateUserRequestSchema = z.object({
  email: z.string().email().optional(),
  settings: userSettingsSchema.partial().optional(),
});

// Схема смены пароля
const changePasswordRequestSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8).max(100),
});
```

**На бекенде должна быть аналогичная валидация.**

---

## Авторизация

Все endpoints требуют авторизации через JWT токен в cookies:

```
Cookie: access_token={JWT_TOKEN}
```

**Извлечение userId:**
```typescript
const userId = jwt.verify(token).sub;
```

**При ошибке авторизации:**
```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

---

## Обработка ошибок

### Формат ошибок

```typescript
interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>; // Ошибки валидации
}
```

### Примеры ошибок

**Валидация:**
```json
{
  "message": "Validation failed",
  "statusCode": 400,
  "errors": {
    "email": ["Invalid email format"],
    "settings.display_name": ["Must be between 1 and 50 characters"]
  }
}
```

**Конфликт:**
```json
{
  "message": "Email already taken",
  "statusCode": 409
}
```

**Не найдено:**
```json
{
  "message": "User not found",
  "statusCode": 404
}
```

**Внутренняя ошибка:**
```json
{
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Производительность

### Кеширование

Backend должен кешировать:
- GET `/api/v1/users/me` - 5 минут
- GET `/api/v1/users/me/extended` - 5 минут
- GET `/api/v1/subscription/plans` - 1 час

Инвалидация при:
- PUT `/api/v1/users/me`
- PUT `/api/v1/users/me/notifications`
- POST `/api/v1/subscription/change`

### Rate Limiting

- **Profile endpoints**: 60 запросов в минуту
- **Auth endpoints**: 20 запросов в минуту
- **Payment endpoints**: 30 запросов в минуту

---

## Безопасность

### 1. Аутентификация
- JWT токен в httpOnly cookies
- Refresh token rotation
- userId из токена, не из request body

### 2. Авторизация
- Проверка прав доступа к ресурсам
- Пользователь может редактировать только свой профиль

### 3. Валидация
- Санитизация всех входных данных
- Проверка типов и форматов
- Максимальные длины строк

### 4. CORS
```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Credentials: true
```

### 5. HTTPS
- Все запросы только через HTTPS
- Secure cookies

---

## Мониторинг

Рекомендуется отслеживать:

1. **Метрики профиля**
   - Количество обновлений профиля
   - Изменения email
   - Смены пароля

2. **Метрики подписок**
   - Новые подписки
   - Отмены подписок
   - Ошибки оплаты

3. **Метрики сессий**
   - Активные сессии
   - Завершенные сессии
   - Подозрительная активность

4. **Производительность**
   - Время ответа endpoints
   - Количество запросов
   - Частота ошибок

---

## База данных

### Схема таблиц

**users:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**subscriptions:**
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

**payments:**
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    plan_id VARCHAR(50),
    payment_method_id UUID,
    invoice_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);
```

**payment_methods:**
```sql
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    card_data JSONB,
    paypal_data JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
```

**sessions:**
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device VARCHAR(255),
    browser VARCHAR(255),
    location VARCHAR(255),
    ip VARCHAR(45),
    last_active TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_last_active ON sessions(last_active);
```

---

## Тестирование

### Примеры запросов (curl)

**Получить профиль:**
```bash
curl https://api.example.com/api/v1/users/me \
  -H "Cookie: access_token=YOUR_TOKEN"
```

**Обновить профиль:**
```bash
curl -X PUT https://api.example.com/api/v1/users/me \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "display_name": "Новое имя",
      "theme": "dark"
    }
  }'
```

**Сменить пароль:**
```bash
curl -X POST https://api.example.com/api/v1/auth/change-password \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "OldPassword123",
    "new_password": "NewPassword456"
  }'
```

**Получить сессии:**
```bash
curl https://api.example.com/api/v1/auth/sessions \
  -H "Cookie: access_token=YOUR_TOKEN"
```

---

## Changelog

### v1.0.0 (2024-02-11)
- Начальная версия API
- Базовые операции с профилем
- Управление подпиской и платежами
- Настройки уведомлений
- Управление сессиями
- **Удален endpoint для удаления аккаунта** (требование продакшна)
