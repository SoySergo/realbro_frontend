# Pages Layer

## Описание

Pages слой в архитектуре Feature-Sliced Design (FSD) - это **композиция виджетов** для создания полных страниц приложения. 

> **Важно:** Pages НЕ должны содержать логику роутинга - это задача Next.js App Router (`app/` директории).

## Принципы

1. **Только композиция** - pages импортируют и компонуют widgets
2. **Без бизнес-логики** - вся логика находится в features/entities
3. **Прозрачность для роутера** - pages экспортируют компоненты, которые импортируются в `app/[locale]/`
4. **Минимум логики** - только композиция и передача пропсов

## Структура

```
pages/
├── home-page/          # Главная страница
│   ├── ui/
│   │   ├── ui.tsx      # HomePage компонент
│   │   └── index.ts
│   └── index.ts
└── search-page/        # Страница поиска
    ├── ui/
    │   ├── ui.tsx      # SearchPage компонент
    │   └── index.ts
    └── index.ts
```

## Связь с App Router

Next.js App Router остается в `app/[locale]/`, но теперь он **только импортирует** компоненты из pages:

```tsx
// app/[locale]/page.tsx
import { HomePage } from '@/pages/home-page';

export default HomePage;
```

```tsx
// app/[locale]/search/page.tsx
import { SearchPage } from '@/pages/search-page';

export default SearchPage;
```

## Текущие pages

### HomePage

Главная страница приложения. Серверный компонент с переводами через next-intl.

**TODO:** Добавить реальный контент и виджеты (Hero, Features, etc.)

**Технологии:**
- Server Component
- next-intl для переводов
- Tailwind CSS для стилей

### SearchPage

Страница поиска недвижимости. Композиция виджетов для полнофункционального поиска.

**Виджеты:**
- `Sidebar` - управление запросами, навигация
- `SearchFiltersBar` - панель фильтров поиска
- `SearchMap` - карта с недвижимостью и режимами локации
- `PropertyList` - список недвижимости (TODO)

**Особенности:**
- Client Component (использует хуки и состояние)
- Responsive layout (mobile + desktop)
- Переключение режима просмотра (карта/список)
- Синхронизация фильтров с URL
- Инициализация фильтров из активного запроса

## Правила

### ✅ Разрешено

- Импортировать widgets
- Импортировать shared (ui, lib, config)
- Компоновать layout страницы
- Использовать хуки из features (через props drilling)
- Использовать Server Components / Client Components

### ❌ Запрещено

- Импортировать features напрямую (только через widgets)
- Импортировать entities напрямую (только через widgets)
- Добавлять бизнес-логику (это задача features)
- Добавлять логику роутинга (это задача app/)

## Зависимости

```
pages
  ↓ импорты
widgets, shared
```

**НЕТ прямых импортов:** features, entities

## Пример использования

```tsx
// src/app/[locale]/search/page.tsx
import { SearchPage } from '@/pages/search-page'

export default SearchPage
```

```tsx
// src/pages/search-page/ui/ui.tsx
'use client'
import { Sidebar } from '@/widgets/sidebar'
import { SearchFiltersBar } from '@/widgets/search-filters-bar'
import { SearchMap } from '@/features/map'

export function SearchPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        <SearchFiltersBar />
        <SearchMap />
      </main>
    </div>
  )
}
```

## TODO

- [x] HomePage - создана структура
- [x] SearchPage - создана с полной композицией виджетов
- [ ] Добавить PropertyList widget и интегрировать в SearchPage
- [ ] Реализовать полноценную HomePage с Hero, Features, etc.
- [ ] Добавить страницу Property Details (property-detail-page)
- [ ] Добавить страницу User Profile (profile-page)
- [ ] Добавить страницу Favorites (favorites-page)

---

**Последнее обновление:** 26 ноября 2025 г. - ЭТАП 6 завершен (search-page + home-page мигрированы)
