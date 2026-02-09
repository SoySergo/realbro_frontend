# План имплементации — Миграция на Сайдбар v7 (Gradient Accent)

> **Источник**: `my-app/src/widgets/sidebar-demos/ui/variant-7/ui.tsx`
> **Цель**: `my-app/src/widgets/sidebar/`
> **Правила**: `docs/bag_fix/iterations/iterations_6/RULES.md`

---

## Этап 1. Подготовка — Типы, стор, новые API-моки

### 1.1 Расширение типов сайдбара
- [ ] Обновить `src/widgets/sidebar/model/types.ts`:
  - Добавить `SearchQueryType` enum: `'search' | 'residential_rooms' | 'residential_apartments' | 'residential_houses' | 'commercial' | 'agent'`
  - Добавить `queryType: SearchQueryType` в `SearchQuery` — для динамической иконки вкладки
  - Добавить `hasAiAgent: boolean` — привязан ли ИИ-агент к вкладке
  - Добавить `aiAgentStatus: 'idle' | 'searching' | 'found'` — статус агента
  - Добавить `maxTabs: number` в отдельный тип `UserSubscription`

**Ссылки на код:**
- [types.ts](my-app/src/widgets/sidebar/model/types.ts)
- [store.ts](my-app/src/widgets/sidebar/model/store.ts)

### 1.2 Новые API-моки (легко заменяемые на бекенд)
- [ ] `src/app/api/subscription/route.ts` — GET текущий тариф, POST активация
  - Возвращает: `{ plan: 'free'|'basic'|'pro', maxTabs: 1|5|20, aiAgentEnabled: boolean, expiresAt }`
  - Мок: in-memory Map, паттерн `generateMock*`, поддержка `locale`
- [ ] `src/app/api/subscription/check/route.ts` — GET проверка лимита вкладок
  - Возвращает: `{ allowed: boolean, currentCount, maxCount, plan }`
- [ ] `src/app/api/ai-agent/activate/route.ts` — POST активация агента для вкладки
  - Принимает: `{ queryId, settings: { notifyFrom, notifyTo, frequency, offlineNotify } }`
  - Проверяет тариф (мок), возвращает `{ success, agentId }` или `{ error: 'no_subscription' }`
- [ ] `src/app/api/payment/route.ts` — POST мок оплаты
  - Принимает: `{ planId }`, возвращает `{ success, transactionId }` после задержки 1.5с

**Паттерн моков:** аналогичен существующим (`src/app/api/search-queries/route.ts`, `src/app/api/properties/route.ts`) — in-memory storage, NextResponse.json, легко заменяемый на реальный fetch.

### 1.3 Обновление стора сайдбара
- [ ] В `src/widgets/sidebar/model/store.ts`:
  - Интегрировать `queryType` при создании вкладки
  - Добавить action `setAiAgent(queryId, status)` для обновления статуса агента
  - Добавить selector для подсчёта вкладок
  - Убрать `variant` (больше не нужен — используем только v7)

**Ссылки на код:**
- [store.ts](my-app/src/widgets/sidebar/model/store.ts)
- [search-queries/route.ts](my-app/src/app/api/search-queries/route.ts)

---

## Этап 2. Desktop-сайдбар — Визуал v7 + логика

### 2.1 Переписать `desktop-sidebar/ui.tsx` в стиле Variant7
- [ ] Применить градиентные акценты из v7:
  - Логотип: `bg-gradient-to-r from-brand-primary/10 to-transparent`
  - Разделители: `bg-gradient-to-r from-brand-primary/30 via-brand-primary/10 to-transparent`
  - Активный элемент: `bg-gradient-to-r from-brand-primary/15 to-transparent`
  - Badge "new": `bg-gradient-to-r from-brand-primary to-brand-primary/70`
- [ ] Заменить hover-expand на кнопку toggle (как в v7 — `absolute top-5 -right-3`)
- [ ] Сохранить всю существующую логику из текущего desktop-sidebar:
  - Синхронизацию с `useFilterStore`
  - Имитацию загрузки при создании вкладки
  - Scroll-контейнер с fade-градиентами
  - Навигацию (Search, Compare, Chat, Profile, Settings) с badges
  - ThemeSwitcher и LanguageSwitcher
  - Auth-aware навигацию (LogIn вместо Profile)

**Ссылки на код:**
- [desktop-sidebar/ui.tsx](my-app/src/widgets/sidebar/ui/desktop-sidebar/ui.tsx) — текущая реализация
- [variant-7/ui.tsx](my-app/src/widgets/sidebar-demos/ui/variant-7/ui.tsx) — целевой визуал

### 2.2 Динамические иконки вкладок
- [ ] Обновить `desktop-query-item/ui.tsx`:
  - Вместо статичной иконки `Search` — маппинг по `queryType`:
    - `search` → `Search`
    - `residential_rooms` → `BedDouble`
    - `residential_apartments` → `Building2`
    - `residential_houses` → `Home`
    - `commercial` → `Store`
    - `agent` → `Users`
  - Первая (дефолтная) вкладка всегда с иконкой `Search`

**Ссылки на код:**
- [desktop-query-item/ui.tsx](my-app/src/widgets/sidebar/ui/desktop-query-item/ui.tsx)

### 2.3 Auth-guard на создание вкладок
- [ ] При нажатии "+" проверять `isAuthenticated`:
  - **Не авторизован** → показать модал `auth-modals` (уже есть: `?modal=login`)
  - **Авторизован** → проверить лимит через `GET /api/subscription/check`
    - **Лимит превышен** → показать toast + предложить расширить тариф (→ `/pricing`)
    - **ОК** → создать вкладку, redirect на `/search`, открыть фильтры

**Ссылки на код:**
- [auth/model/store.ts](my-app/src/features/auth/model/store.ts) — `useAuth()`
- [auth-modals/ui.tsx](my-app/src/widgets/auth-modals/ui.tsx) — модалки авторизации

---

## Этап 3. Маршруты пользователя — Полный флоу

### 3.1 Маршрут 1: Авторизованный → Создание вкладки → ИИ-агент
- [ ] **Кнопка "+"** → `handleAddQuery()`:
  1. Проверка auth → проверка лимита (`/api/subscription/check`)
  2. Создание вкладки → redirect на `/search` с открытыми фильтрами
  3. В панели фильтров: кнопки **Очистить**, **Сохранить**, **Дать задание ИИ-агенту**
- [ ] **Кнопка "Дать задание ИИ"**:
  1. `POST /api/ai-agent/activate` — проверка тарифа
  2. Если `error: 'no_subscription'` → Попап выбора тарифа (Dialog или параллельный роут `@pricing`)
  3. Выбор тарифа → `POST /api/payment` (мок оплаты, 1.5с задержка) → success toast
  4. Попап настроек ИИ-агента (переиспользовать `features/chat-settings/ui/notification-settings`)
  5. После сохранения настроек → предложить: "Перейти в чат с агентом" или "Продолжить поиск"
  6. Показать информацию: "Агент подбирает объекты... уведомления с {startHour} до {endHour}"

**Ссылки на код:**
- [chat-settings/model/store.ts](my-app/src/features/chat-settings/model/store.ts) — настройки агента
- [notification-settings/ui.tsx](my-app/src/features/chat-settings/ui/notification-settings/ui.tsx)
- [pricing/page.tsx](my-app/src/app/[locale]/pricing/page.tsx)

### 3.2 Маршрут 2: Авторизованный → Просмотр результатов агента
- [ ] На вкладке с активным агентом показывать `newResultsCount` badge
- [ ] Нажатие на вкладку → загрузка объектов, найденных агентом
- [ ] «Разбор объектов» — like/dislike/save из списка (существующий функционал)

### 3.3 Маршрут 3: Неавторизованный → Поиск → Попытка сохранить
- [ ] В панели фильтров кнопка **"Сохранить фильтр"**:
  - Проверка `isAuthenticated`
  - Если нет → toast: "Для сохранения фильтров необходима авторизация" (SimpleToast, type: 'warning')
  - Кнопка в toast → `?modal=login`

**Ссылки на код:**
- [shared/ui/toast](my-app/src/shared/ui/toast/) — SimpleToast

### 3.4 Маршрут 4: Лимит вкладок
- [ ] При нажатии "+" когда лимит исчерпан:
  - Dialog: "Вы достигли максимума ({current}/{max}). Расширьте тариф или отредактируйте существующую вкладку"
  - Кнопка "Выбрать тариф" → `/pricing`
  - Кнопка "Редактировать вкладку" → закрыть dialog

---

## Этап 4. Фильтры — URL-параметры, геометрия, локация

### 4.1 Синхронизация фильтров с URL
- [ ] При изменении фильтров → обновлять `searchParams`:
  - `?minPrice=800&maxPrice=2000&rooms=2,3&category=apartment&area_min=60`
  - Использовать `useSearchParams` + `router.replace` с shallow
- [ ] При загрузке страницы → парсить URL → установить фильтры в стор
- [ ] При сохранении вкладки → фильтры из URL записываются в `SearchQuery.filters`

**Ссылки на код:**
- [search-filters-bar/model/store.ts](my-app/src/widgets/search-filters-bar/model/store.ts)

### 4.2 Отправка геометрии отдельным запросом
- [ ] Геометрия (polygon/radius/isochrone/boundaries) → `POST /api/geometries`
- [ ] Бекенд возвращает массив `propertyIds` попадающих в геометрию
- [ ] Эти `ids` подставляются в запрос `GET /api/properties?geometryIds=...`
- [ ] При сохранении вкладки → геометрия привязывается к `queryId`

**Ссылки на код:**
- [api/geometries/route.ts](my-app/src/app/api/geometries/route.ts)
- [location-filter/model/types.ts](my-app/src/features/location-filter/model/types.ts)

### 4.3 Улучшение UI выбора режима локации (Desktop)
- [ ] Заменить выпадающий список (`Select`/`DropdownMenu`) на кнопку
- [ ] При нажатии → табы в верхнем левом углу карты (над панелью инструментов):
  - **Поиск** (административные границы)
  - **Рисование** (полигон)
  - **Радиус**
  - **Расстояние до точки** (бывшие "изохроны" — переименовать)
- [ ] По окончании выбора → на кнопке показывать:
  - Количество выбранных элементов (например "3 полигона", "2 города")
  - Название режима

**Ссылки на код:**
- [location-search-mode/](my-app/src/features/location-search-mode/)
- [location-draw-mode/](my-app/src/features/location-draw-mode/)
- [location-radius-mode/](my-app/src/features/location-radius-mode/)
- [location-isochrone-mode/](my-app/src/features/location-isochrone-mode/)

### 4.4 Все типы геометрии должны сохраняться и прикрепляться
- [ ] Каждый тип (polygon, radius, isochrone, boundaries) → сохранение в `SearchQuery`
- [ ] При переключении вкладки → восстановление геометрии на карте
- [ ] Все 4 типа должны корректно отображаться после перезагрузки

---

## Этап 5. Мобильная версия

### 5.1 Обновить стиль `bottom-navigation` под v7
- [ ] Градиентные акценты для active state:
  - Активная иконка: градиентный фон `from-brand-primary/15 to-transparent`
  - Или подчёркивание с градиентом
- [ ] Сохранить всё существующее поведение:
  - Скрытие на property detail, при drawing mode, при открытом чате
  - Chat notification badge с анимацией
  - Safe area inset

**Ссылки на код:**
- [bottom-navigation/ui.tsx](my-app/src/widgets/sidebar/ui/bottom-navigation/ui.tsx)

### 5.2 Мобильный менеджер вкладок
- [ ] Обновить `queries-select/ui.tsx` (полноэкранный оверлей) стилем v7
- [ ] Кнопка в header мобильного поиска → открыть менеджер вкладок
- [ ] Те же проверки auth и лимитов при создании вкладки
- [ ] Динамические иконки вкладок как на desktop

**Ссылки на код:**
- [queries-select/ui.tsx](my-app/src/widgets/sidebar/ui/queries-select/ui.tsx)
- [mobile-query-item/ui.tsx](my-app/src/widgets/sidebar/ui/mobile-query-item/ui.tsx)

### 5.3 Мобильные маршруты (аналог desktop)
- [ ] Маршрут 1 (мобильный): создание → фильтры → ИИ-агент → полноэкранные dialog/sheet
- [ ] Маршрут 3 (мобильный): сохранение фильтров → toast сверху экрана
- [ ] Маршрут 4 (мобильный): лимит → Sheet снизу с информацией и CTA

---

## Этап 6. Локализация

### 6.1 Новые ключи переводов
- [ ] Добавить во все 6 файлов (`messages/{ru,en,fr,es,ca,it}.json`):
  ```json
  "sidebar": {
    "tabLimit": "Tab limit reached",
    "tabLimitDescription": "You've reached the maximum of {max} tabs. Upgrade your plan or edit existing tabs.",
    "upgradePlan": "Upgrade plan",
    "editTab": "Edit tab",
    "saveFilters": "Save filters",
    "clearFilters": "Clear filters",
    "assignAiAgent": "Assign AI agent",
    "agentSearching": "Agent is searching...",
    "agentNotifications": "You'll receive notifications from {startHour} to {endHour}",
    "goToChat": "Go to chat with agent",
    "continueSearch": "Continue searching",
    "distanceToPoint": "Distance to point"
  },
  "subscription": {
    "choosePlan": "Choose a plan",
    "free": "Free",
    "basic": "Basic",
    "pro": "Pro",
    "paymentSuccess": "Payment successful",
    "noSubscription": "Active subscription required"
  }
  ```

**Ссылки на код:**
- [messages/en.json](my-app/messages/en.json)
- [messages/ru.json](my-app/messages/ru.json)

---

## Этап 7. Тестирование и финализация

### 7.1 Проверка всех маршрутов
- [ ] Маршрут 1: Авторизация → создание → фильтры → ИИ-агент → тариф → оплата → настройки → чат/поиск
- [ ] Маршрут 2: Вкладка с результатами агента → просмотр → разбор
- [ ] Маршрут 3: Без auth → поиск → сохранить → toast → авторизация
- [ ] Маршрут 4: Лимит вкладок → dialog → тариф → оплата

### 7.2 Кросс-проверки
- [ ] Desktop: light/dark тема на всех breakpoints
- [ ] Mobile: light/dark тема, safe area
- [ ] Все 4 типа геометрии: сохранение, восстановление, отображение
- [ ] URL-параметры: прямая ссылка с фильтрами работает
- [ ] Переключение вкладок: фильтры и геометрия корректно синхронизируются
- [ ] Локализация: все 6 языков, все новые ключи

### 7.3 Очистка
- [ ] Удалить `SidebarVariant` тип и связанную логику (variant switcher)
- [ ] Убедиться что `sidebar-demos` не ломается (остаётся для демо)
- [ ] Удалить неиспользуемый код

---

## Порядок выполнения

```
Этап 1 (Типы, моки, стор)
    ↓
Этап 2 (Desktop визуал v7 + логика)
    ↓
Этап 3 (Маршруты — auth, лимиты, ИИ-агент)
    ↓
Этап 4 (Фильтры — URL, геометрия, локация UI)
    ↓
Этап 5 (Мобильная версия)
    ↓
Этап 6 (Локализация)
    ↓
Этап 7 (Тестирование)
```

---

## Ключевые файлы проекта (для справки)

| Файл | Роль |
|---|---|
| `src/widgets/sidebar/model/store.ts` | Zustand стор сайдбара |
| `src/widgets/sidebar/model/types.ts` | Типы SearchQuery, NavigationItem |
| `src/widgets/sidebar/ui/desktop-sidebar/ui.tsx` | Desktop сайдбар |
| `src/widgets/sidebar/ui/bottom-navigation/ui.tsx` | Mobile bottom nav |
| `src/widgets/sidebar/ui/sidebar-wrapper/ui.tsx` | Responsive wrapper |
| `src/widgets/sidebar/ui/desktop-query-item/ui.tsx` | Карточка вкладки (desktop) |
| `src/widgets/sidebar/ui/mobile-query-item/ui.tsx` | Карточка вкладки (mobile) |
| `src/widgets/sidebar/ui/queries-select/ui.tsx` | Fullscreen мобильный выбор вкладки |
| `src/widgets/search-filters-bar/model/store.ts` | Стор фильтров |
| `src/features/auth/model/store.ts` | Auth стор |
| `src/features/chat-settings/model/store.ts` | Настройки ИИ-агента |
| `src/widgets/sidebar-demos/ui/variant-7/ui.tsx` | Эталонный визуал |
| `src/app/api/search-queries/route.ts` | API мок вкладок |
| `src/app/api/geometries/route.ts` | API мок геометрий |
| `messages/*.json` | Файлы переводов (6 языков) |
