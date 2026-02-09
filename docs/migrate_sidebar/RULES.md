# Правила разработки — Iteration 2

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

## Тосты (уведомления)

### Два типа
1. **SimpleToast** (`shared/ui/toast`) — общие уведомления (success/error/warning/info)
   - `useToast()` → `showToast(message, type, duration)`
2. **PropertyToast** (`shared/ui/property-toast`) — уведомления о недвижимости
   - `useToastStore()` из Zustand

### Позиционирование
- По задаче: тосты **вверху мобильного экрана**
- На десктопе — стандартная позиция

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
