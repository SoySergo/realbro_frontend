# Shared Layer

## Назначение

Слой Shared содержит переиспользуемый код без бизнес-логики.

## Структура

### `ui/` - UI компоненты
Переиспользуемые UI компоненты (shadcn/ui, кастомные).

```
shared/ui/
├── button/
│   ├── ui.tsx
│   └── index.ts
└── input/
    ├── ui.tsx
    └── index.ts
```

### `lib/` - Утилиты
Вспомогательные функции, хелперы.

```
shared/lib/
├── utils/
│   └── index.ts
├── constants/
│   └── index.ts
└── mapbox/
    └── index.ts
```

### `api/` - API клиенты
Сервисы для работы с внешними API.

```
shared/api/
├── mapbox/
│   ├── geocoding.ts
│   ├── isochrone.ts
│   └── index.ts
└── types.ts
```

### `config/` - Конфигурация
Конфигурационные файлы.

```
shared/config/
├── env/
│   └── index.ts
├── i18n/
│   ├── routing.ts
│   └── types.ts
└── seo/
    └── index.ts
```

### `types/` - Типы
Общие TypeScript типы.

```
shared/types/
├── css.d.ts
└── common.ts
```

### `hooks/` - Хуки
Общие React хуки.

```
shared/hooks/
├── use-debounce/
│   └── index.ts
└── use-media-query/
    └── index.ts
```

## Правила

1. **Нет бизнес-логики** - только технические решения
2. **Полная переиспользуемость** - можно использовать где угодно
3. **Минимум зависимостей** - только внешние библиотеки
4. **Public API** - экспорт через index.ts
