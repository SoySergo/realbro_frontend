# Правила разработки 

## Архитектура — FSD (Feature-Sliced Design)

```
app/          — провайдеры, layout, роутинг ([locale])
screens/      — композиция виджетов для страниц
widgets/      — крупные UI-блоки (sidebar, chat, search-filters-bar и т.д.)
features/     — пользовательские взаимодействия (фильтры, actions, формы)
entities/     — бизнес-сущности (property, agency, chat, user, favorites)
shared/       — ui, api, lib, hooks, config, types, icons
```

**Импорты строго сверху вниз по слоям.** Нижний слой не импортирует из верхнего.

---

## Стек

| Технология | Версия | Заметки |
|---|---|---|
| Next.js | 16+ | App Router, RSC |
| React | 19 | |
| TypeScript | 5 | strict mode |
| Tailwind CSS | 4 | `@theme inline` в globals.css, **без tailwind.config.js** |
| shadcn/ui | new-york | Стиль `new-york`, base color `neutral` |
| lucide-react | 0.553+ | Единственная библиотека иконок |
| next-intl | 4.5+ | i18n через `useTranslations` |
| next-themes | 0.4+ | `data-theme` атрибут |
| Zustand | 5 | Сторы в `features/*/model/store.ts` |
| mapbox-gl | 3.16+ | react-map-gl обёртка |
| pnpm | 10+ | Пакетный менеджер |

---

## Стилизация

### Цвета — только через CSS-переменные
```
НЕТ:  className="bg-blue-500 text-white"
ДА:   className="bg-brand-primary text-text-primary"
```

### Ключевые токены
- `--brand-primary` / `--brand-primary-hover` / `--brand-primary-light` — основной бренд-цвет
- `--background` / `--background-secondary` / `--background-tertiary` — фоны
- `--text-primary` / `--text-secondary` — текст
- `--border` — границы
- `--success` / `--warning` / `--error` / `--info` — статусы

### Темы
- Light: `:root { ... }`
- Dark: `[data-theme="dark"] { ... }`
- **Любой новый цвет** → добавить переменную в оба блока в `globals.css` и в `@theme inline`

### Утилита `cn()`
```ts
import { cn } from '@/shared/lib/utils';
cn('base-class', condition && 'conditional-class')
```

---

## Адаптивность

- Mobile-first подход
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl` (стандарт Tailwind)
- Все компоненты **обязаны** корректно работать на мобильных и десктопе
- Тестировать в обеих темах (light/dark) на каждом breakpoint

---

## Локализация (i18n)

```
НЕТ:  <span>Поделиться</span>
ДА:   <span>{t('actions.share')}</span>
```

- Файлы переводов: `messages/{locale}.json` (ru, en, fr, es, ca, it)
- Использовать `useTranslations('namespace')` из `next-intl`
- Новые ключи добавлять **во все 6 файлов** переводов
- Структура: `namespace.section.key`

---

## Моки (API)

### Паттерн
1. API роут в `src/app/api/{resource}/route.ts`
2. Мок-генератор в `src/shared/api/mocks/`
3. Клиентский fetch через стандартный `fetch('/api/{resource}')`

### Существующие моки
- `properties-mock.ts` — генерация объектов недвижимости
- `favorites-mock.ts` — избранное
- `agencies/` — агентства
- `property-detail/` — детали объекта
- `user-profile/` — профиль пользователя

### При создании нового мока
- Следовать `generateMock*` паттерну
- Поддерживать `locale` в конфигурации
- Данные реалистичные (Барселона, реальные районы/улицы)
- Легко заменяемо на реальный бекенд (просто сменить `route.ts`)

---


## Компоненты

- Использовать `shadcn/ui` как основу
- Кастомные компоненты — в `shared/ui/`
- Иконки — только `lucide-react`
- Стили через `className` + Tailwind, **не inline styles**
- Variants через `class-variance-authority` (cva)

---

## Общие правила

1. **Не хардкодить**: цвета, строки, размеры breakpoint-зависимые
2. **TypeScript**: строгая типизация, интерфейсы в `model/types.ts`
3. **Алиас**: `@/*` → `./src/*`
4. **Стор**: Zustand, файл `features/*/model/store.ts`
5. **Формы**: react-hook-form + zod валидация
6. **Анимации**: CSS-анимации в `globals.css`, не JS-based
7. **Изображения**: `next/image` с remote patterns (unsplash, pravatar)
8. **Не создавать лишних файлов** — редактировать существующие где возможно

---

## Интеграция с бекендом

> Связанные документы: `BACKEND_API_DOCS.md` · `INTEGRATION_PLAN.md` · `BACKEND_REQUESTS.md`

### Источник правды — бекенд
- **Все типы данных** на фронтенде должны соответствовать ответам бекенда
- Если поля нет на бекенде, но оно нужно фронту → записать в `BACKEND_REQUESTS.md` и продолжать разработку **как будто бекенд уже отдаёт** это поле
- Никогда не выдумывать структуру данных — сверяться с `BACKEND_API_DOCS.md`

### snake_case everywhere
- **Все данные** хранятся и используются в snake_case — как приходят с бекенда
- Никаких рекурсивных трансформеров `snake → camel` или `camel → snake`
- Типы, интерфейсы, поля в сторах, props компонентов — всё snake_case для данных с API
- Исключение: внутренние UI-переменные (не связанные с API) могут быть camelCase

### Пагинация — cursor everywhere
- Все списки (объекты, маркеры, чаты, история) используют cursor-based пагинацию
- Тип `CursorPaginatedResponse<T>` из `shared/api/types.ts`
- Хук `use-cursor-pagination` для infinite scroll
- Первый запрос (SSR): увеличенный `limit` для SEO, далее подгрузка по cursor

### Виртуализация
- Все длинные списки (листинг, sidebar, чаты) — через виртуальное окно
- `react-window` / `@tanstack/react-virtual` для производительности
- Infinite scroll + виртуализация = не глючит при большом количестве элементов

### Feature-флаги (помодульное переключение)
- Каждый модуль (properties, auth, tabs, markers и т.д.) переключается на реальный API независимо
- Флаги в `shared/config/features.ts`: `USE_REAL_PROPERTIES`, `USE_REAL_AUTH`, и т.д.
- При `false` → работают моки, при `true` → реальный бекенд

### API-client
- Единый HTTP-клиент в `shared/api/lib/api-client.ts`
- `Authorization: Bearer {token}`, авто-refresh при 401
- Данные проходят as-is (без конвертаций)
- Обработка ошибок по `ErrorResponse` (`{ error, message }`)

### Маппинг admin_level → location fields (единственная версия)
- **Одна** функция `adminLevelToLocationField()` в `entities/boundary/lib/boundary-utils.ts`
- Никаких дублей в других файлах — только импорт из `@/entities/boundary`
- Маппинг: `2→country_ids`, `4→region_ids`, `6→province_ids`, `7/8→city_ids`, `9→district_ids`, `10→neighborhood_ids`

### Naming convention (из бекенда)
- `property_type` = `sale` | `rent` (тип сделки)
- `property_kind_ids` = `1`=residential, `2`=commercial, `3`=industrial, `4`=land, `5`=other
- `categories` = `1`=room, `2`=apartment, `3`=house
- `sub_categories` = `4`=piso, `5`=studio, `6`=loft, `7`=atico, `8`=penthouse, ...

### Иконки атрибутов
- Бекенд присылает `icon_type: string` в `AttributeDTO`
- Фронтенд рендерит через `<DynamicIcon name={icon_type} />` из `shared/ui/dynamic-icon/`
- Маппинг string → LucideIcon в `icon-map.ts`, fallback при неизвестном ключе

### Геометрии
- Привязаны к фильтру: `POST /api/v1/filters/:filter_id/geometry`
- Неавторизованные → `filter_id = "0"` (временная, с очисткой)
- Авторизованные → `filter_id` = ID фильтра текущего таба

### Если чего-то не хватает
- **Всегда** записывать в `BACKEND_REQUESTS.md` с описанием, приоритетом и статусом
- Продолжать разработку, не блокируясь — фронтенд работает на моках / заглушках
- Периодически сверять `BACKEND_REQUESTS.md` с бекенд-командой

