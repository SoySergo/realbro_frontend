# AGENT.md - Руководство для AI агентов

## 📚 Быстрые ссылки на документацию

- **[UI Components Guide](/docs/UI_COMPONENTS_GUIDE.md)** - 🎨 ОБЯЗАТЕЛЬНО при создании UI компонентов
- **[Design Guide](/docs/DESIGN_GUIDE.md)** - Полное руководство по дизайн-системе
- **[Functionality Index](/docs/functionality/index.md)** - Навигация по документации функциональности

### 🗺️ Режимы работы с локацией
- [LocationSearchMode](/docs/functionality/features/search/LocationSearchMode.md) - Поиск через Mapbox Geocoding
- [LocationDrawMode](/docs/functionality/features/search/LocationDrawMode.md) - Рисование области
- [LocationIsochroneMode](/docs/functionality/features/search/LocationIsochroneMode.md) - Изохрон (время в пути)
- [LocationRadiusMode](/docs/functionality/features/search/LocationRadiusMode.md) - Радиус от точки

---

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

## 🎨 Дизайн-система

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

📚 **Подробные руководства**: 
- `/docs/DESIGN_GUIDE.md` - дизайн-система проекта
- `/docs/UI_COMPONENTS_GUIDE.md` - **ОБЯЗАТЕЛЬНО при создании UI компонентов** - паттерны стилизации кнопок, инпутов, панелей

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
- [ ] **При создании UI**: использованы паттерны из `/docs/UI_COMPONENTS_GUIDE.md`

## 🚀 Быстрый старт для новой фичи

1. **Создай компонент** в `src/components/features/[feature]/`
2. **Добавь типы** в `src/types/` (если нужны)
3. **Создай стор** в `src/store/` (если нужен клиентский стейт)
4. **Документируй** в `docs/functionality/features/[feature]/`
5. **Обнови индекс** в `docs/functionality/index.md`
6. **Добавь локали** для всего текста в UI

## 🗺️ Интеграция с Mapbox

### Доступные сервисы

#### Mapbox Geocoding API
**Файл**: `src/services/mapbox-geocoding.ts`

Поиск мест (города, районы, страны):
```typescript
import { searchLocations } from '@/services/mapbox-geocoding';

const results = await searchLocations({
    query: 'Barcelona',
    language: 'en',
    limit: 10,
});
```

#### Mapbox Isochrone API
**Файл**: `src/services/mapbox-isochrone.ts`

Построение изохронов (область доступности за время):
```typescript
import { getIsochrone, getProfileColor } from '@/services/mapbox-isochrone';

const polygon = await getIsochrone({
    coordinates: [2.1734, 41.3851], // [lng, lat]
    profile: 'walking',
    minutes: 15,
});

const color = getProfileColor('walking'); // #28A745
```

### Профили изохронов
- `walking` - Пешком (зелёный #28A745)
- `cycling` - Велосипед (жёлтый #FFC107)
- `driving` - Машина (синий #198BFF)

### Режимы фильтра локации

Все режимы используют **двухслойную систему**:
- **Локальный слой** (localStorage): временные изменения до применения
- **Глобальный слой** (store): применённые фильтры

#### 1. Search Mode (Поиск)
- Mapbox Geocoding API для автокомплита
- Синхронизация по Wikidata ID с OSM полигонами
- Множественный выбор локаций
- Теги с удалением + popover при большом количестве

#### 2. Draw Mode (Рисование)
- Произвольный полигон на карте
- Редактируемое название области
- Визуализация GeoJSON полигона
- Сохранение координат для бекенда

#### 3. Isochrone Mode (Время в пути)
- Mapbox Isochrone API
- Профили: walking/cycling/driving
- Время: 5, 10, 15, 30, 45, 60 минут
- Автоматический расчёт при выборе точки
- Цвет полигона по профилю

#### 4. Radius Mode (Радиус)
- Круг заданного радиуса от точки
- Радиусы: 1, 3, 5, 10, 15, 20 км
- Динамическое обновление при изменении
- Рисование через Turf.js или нативный Mapbox

### Общие паттерны для режимов

```typescript
// Коллбэки для интеграции с картой
type LocationModeProps = {
    // Для Draw
    onActivateDrawing?: () => void;
    drawnPolygon?: DrawPolygon | null;
    
    // Для Isochrone/Radius
    onSelectPoint?: () => void;
    selectedCoordinates?: [number, number] | null;
    onShowIsochrone?: (polygon: number[][][], color: string) => void;
    onShowRadius?: (center: [number, number], radiusKm: number) => void;
    
    // Для удаления
    onDeletePolygon?: (id: string) => void;
    onClearIsochrone?: () => void;
    onClearRadius?: () => void;
};
```

### LocationModeActions
Универсальный компонент кнопок управления для всех режимов:
- **Очистить**: удаляет локальное состояние текущего режима
- **Сохранить**: применяет в store (с алертом если есть данные в других режимах)
- **X (Выход)**: закрывает панель (с алертом если есть несохранённые данные)

---

**Помни**: Качественный код > быстрый код. Следуй паттернам проекта.


