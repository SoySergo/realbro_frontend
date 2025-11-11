# AGENT.md - Руководство для AI агентов

## 🎯 Основные принципы

### Языковая политика
- **Комментарии в коде**: Русский язык
- **Общение в чате**: Русский язык
- **Логирование/console**: Английский язык
- **Git commits**: Английский (conventional commits)

### Пакетный менеджер
- pnpm

### Текстовый контент
❌ **НЕ ХАРДКОДИТЬ ТЕКСТ** - весь UI текст только через локализации:

// ✅ ПРАВИЛЬНО
<button>{t('search')}</button>
<h1>{t('propertyList')}</h1>
```

## 📝 Документация функциональности

### При создании нового компонента/фичи

1. **Краткое описание** - 2-3 предложения максимум
2. **Место**: `docs/functionality/` с удобной структурой
3. **Обновить индекс**: `docs/functionality/index.md`

#### Формат описания
```markdown
# Название компонента/фичи

**Что делает**: Краткое описание в 1-2 предложения.

**Ключевые особенности**:
- Пропсы: основные пропсы и их назначение
- Стейт: какое состояние управляет
- API: какие эндпоинты использует (если есть)

**Файл**: путь к файлу
```

### Структура docs/functionality

```
docs/functionality/
├── index.md              # Главный индекс со ссылками
├── features/
│   ├── map/
│   │   └── PropertyMap.md
│   ├── search/
│   │   ├── SearchBar.md
│   │   └── FilterPanel.md
│   └── property/
│       └── PropertyCard.md
├── api/
│   └── properties.md
└── stores/
    └── filterStore.md
```

#### Пример index.md
```markdown
# Функциональность проекта

### Компоненты карты
- [PropertyMap](features/map/PropertyMap.md) - Интерактивная карта с маркерами
- [MapControls](features/map/MapControls.md) - Управление картой

### Поиск и фильтры
- [SearchBar](features/search/SearchBar.md) - Строка поиска
- [FilterPanel](features/search/FilterPanel.md) - Панель фильтров

### API
- [Properties API](api/properties.md) - Работа с недвижимостью
```

## � Дизайн-система

### ВАЖНО: Цвета ТОЛЬКО через CSS переменные
```typescript
// ✅ ПРАВИЛЬНО
<div className="bg-background text-text-primary border-border">
<button className="bg-brand-primary hover:bg-brand-primary-hover">

// ❌ НЕПРАВИЛЬНО - хардкод запрещён
<div className="bg-white text-black">
<button className="bg-blue-500">
```

### Доступные цвета Tailwind
- **Фирменные**: `brand-primary`, `brand-primary-hover`, `brand-primary-light`
- **Фоны**: `background`, `background-secondary`, `background-tertiary`
- **Текст**: `text-primary`, `text-secondary`, `text-tertiary`
- **Границы**: `border`, `border-hover`
- **Состояния**: `success`, `warning`, `error`, `info`
- **Семантика**: `price` (для цен)

### Шрифты
- **Основной**: Inter (автоматом через body)
- **Моно** (цены, ID): `font-mono`

### Темы
- Светлая и тёмная темы настроены автоматически
- Все цвета адаптируются через CSS переменные
- Компонент переключателя: `ThemeSwitcher` (из `next-themes`)

📚 **Подробное руководство**: `/docs/DESIGN_GUIDE.md`

---

## �🏗️ Архитектурные паттерны

### Server Components First
```typescript
// ✅ По умолчанию - Server Component
async function PropertyPage({ params }: Props) {
  const property = await fetchProperty(params.id);
  return <PropertyDetails property={property} />;
}

// ✅ Client только если нужна интерактивность
'use client';
import { useState } from 'react';

function InteractiveMap() {
  const [viewport, setViewport] = useState(/*...*/);
  // ...
}
```

### Не дублировать логику
```typescript
// ✅ Создай переиспользуемую утилиту
// lib/formatters.ts
export function formatPrice(price: number, currency = '€') {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ' + currency;
}

// ❌ Не копируй одинаковый код в разные компоненты
```

### Типизация
```typescript
// ✅ Используй существующие типы из types/
import type { Property } from '@/types/property';
import type { FilterState } from '@/types/filter';

// ✅ Создавай новые типы при необходимости
// types/map.ts
export type MapViewport = {
  latitude: number;
  longitude: number;
  zoom: number;
};
```

### Импорты
```typescript
// ✅ Группируй и упорядочивай
// 1. React/Next
import { FC, useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libs
import { useStore } from 'zustand';
import { z } from 'zod';

// 3. Internal components
import { PropertyCard } from '@/components/features/property';
import { Button } from '@/components/ui/button';

// 4. Types
import type { Property } from '@/types/property';

// 5. Utils/Styles
import { cn } from '@/lib/utils';
```

## 🔧 Практические правила

### Работа с стейтом
- **Zustand** - только для UI состояния (фильтры, открытые панели)
- **URL state** - параметры поиска (`nuqs` библиотека)
- **Server Components** - для данных с сервера

### API Routes
```typescript
// app/api/properties/route.ts
// ✅ Валидация через Zod
const filtersSchema = z.object({
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  // ...
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = filtersSchema.parse(Object.fromEntries(searchParams));
  
  console.log('Fetching properties with filters', filters);
  // Логирование на английском
  
  // ...
}
```

### Компоненты
```typescript
// ✅ Props с типами и defaults
type PropertyCardProps = {
  property: Property;
  variant?: 'default' | 'compact';
  showMap?: boolean;
};

// ✅ Краткие комментарии для сложной логики
export function PropertyCard({ 
  property, 
  variant = 'default',
  showMap = false 
}: PropertyCardProps) {
  // Форматируем цену для отображения
  const formattedPrice = formatPrice(property.price);
  
  // Проверяем доступность изображений
  const hasImages = property.images.length > 0;
  
  return (/* ... */);
}
```

## 📋 Checklist перед коммитом

- [ ] Нет хардкода текста (все через локали)
- [ ] Комментарии на русском, логи на английском
- [ ] Обновлена документация в `docs/functionality/`
- [ ] Обновлен `docs/functionality/index.md` (если новая фича)
- [ ] Типы импортированы из `types/`
- [ ] Нет дублирования логики
- [ ] Server Component где возможно

## 🚀 Быстрый старт для новой фичи

1. **Создай компонент** в `src/components/features/[feature]/`
2. **Добавь типы** в `src/types/` (если нужны)
3. **Создай стор** в `src/store/` (если нужен клиентский стейт)
4. **Документируй** в `docs/functionality/features/[feature]/`
5. **Обнови индекс** в `docs/functionality/index.md`
6. **Добавь локали** для всего текста в UI

---

**Помни**: Качественный код > быстрый код. Следуй паттернам проекта.


