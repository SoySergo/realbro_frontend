# Property Detail Page - Отчёт о нарушениях

> Дата анализа: 2026-02-01
> Страница: `/screens/property-detail-page/`

---

## Оглавление

1. [Хардкод строк (локализация)](#1-хардкод-строк-локализация)
2. [Хардкод цветов](#2-хардкод-цветов)
3. [Проблемы ISR и Client/Server компонентов](#3-проблемы-isr-и-clientserver-компонентов)
4. [Нарушения FSD](#4-нарушения-fsd)
5. [Другие проблемы](#5-другие-проблемы)
6. [Структура API и моков](#6-структура-api-и-моков)

---

## 1. Хардкод строк (локализация)

### 1.1 Критичные - русский текст в коде

| Файл | Строка | Хардкод | Нужно заменить на |
|------|--------|---------|-------------------|
| `entities/property/ui/property-gallery/ui.tsx` | 179 | `'Видео презентация'` | `t('propertyDetail.video')` |
| `entities/property/ui/property-gallery/ui.tsx` | 180 | `'Mock Video Player'` | Удалить (debug текст) |
| `entities/property/ui/property-gallery/ui.tsx` | 201 | `'3D Тур'` | `t('propertyDetail.tour3d')` |
| `entities/property/ui/property-gallery/ui.tsx` | 202 | `'Mock 3D Viewer'` | Удалить (debug текст) |
| `entities/property/ui/property-gallery/media-section.tsx` | 22-25 | `label: 'Фото', 'Видео', '3D-тур', 'Планировка'` | Использовать ключи из `propertyDetail` |
| `entities/property/ui/property-gallery/media-section.tsx` | 80-81 | `'Видео презентация'`, `'Mock Video Player'` | То же |
| `entities/property/ui/property-gallery/media-section.tsx` | 98-99 | `'3D Тур'`, `'Mock 3D Viewer'` | То же |

### 1.2 Категории локаций (все хардкод)

| Файл | Строки | Проблема |
|------|--------|----------|
| `entities/property/ui/property-location-section/ui.tsx` | 60-70 | 11 категорий локаций на русском |

**Список:**
- `'Транспорт'` → `t('propertyDetail.locationSection.categories.transport')`
- `'Школы и сады'` → `t('propertyDetail.locationSection.categories.schools')`
- `'Медицина'` → `t('propertyDetail.locationSection.categories.medical')`
- `'Продукты'` → `t('propertyDetail.locationSection.categories.groceries')`
- `'Шопинг'` → `t('propertyDetail.locationSection.categories.shopping')`
- `'Бары и рестораны'` → `t('propertyDetail.locationSection.categories.restaurants')`
- `'Спорт'` → `t('propertyDetail.locationSection.categories.sports')`
- `'Культура и отдых'` → `t('propertyDetail.locationSection.categories.entertainment')`
- `'Парки скверы'` → `t('propertyDetail.locationSection.categories.parks')`
- `'Бьюти и уход'` → `t('propertyDetail.locationSection.categories.beauty')`
- `'Достопримечательности'` → `t('propertyDetail.locationSection.categories.attractions')`

### 1.3 Мок-данные в header

| Файл | Строки | Хардкод |
|------|--------|---------|
| `entities/property/ui/property-header/ui.tsx` | 32 | `'сегодня, 19:39'` (мок timestamp) |
| `entities/property/ui/property-header/ui.tsx` | 33 | `${stats.viewsCount} просмотров, ${stats.viewsToday} за сегодня` |
| `entities/property/ui/property-header/ui.tsx` | 39 | `'Обновлено:'` |
| `entities/property/ui/property-header/ui.tsx` | 59-63 | Локации: `Испания`, `Каталония`, `Барселона`, `Эшампле` |

### 1.4 Суффиксы и префиксы

| Файл | Строка | Хардкод | Решение |
|------|--------|---------|---------|
| `entities/property/ui/property-sidebar-conditions/ui.tsx` | 57 | `/мес.` | `t('common.perMonth')` |
| `entities/property/ui/property-mobile-main-info/ui.tsx` | 123 | `/мес` | `t('common.perMonth')` |
| `entities/property/ui/property-list-section/ui.tsx` | 28 | `viewAllText = "Смотреть все"` | `t('propertyDetail.showAll')` |

---

## 2. Хардкод цветов

### 2.1 Primary/Brand цвета (синий)

Нужно заменить на `bg-brand-primary`, `text-brand-primary`, `hover:bg-brand-primary-hover`

| Файл | Строки | Текущий класс | Замена |
|------|--------|---------------|--------|
| `widgets/property-detail-header/ui.tsx` | 106 | `text-blue-600` | `text-brand-primary` |
| `widgets/property-detail-header/ui.tsx` | 122 | `bg-blue-600 text-white` | `bg-brand-primary text-white` |
| `widgets/property-detail-header/ui.tsx` | 163 | `text-blue-600` | `text-brand-primary` |
| `widgets/property-detail-header/ui.tsx` | 189, 196 | `text-blue-600`, `hover:bg-blue-50` | `text-brand-primary`, `hover:bg-brand-primary-light` |
| `widgets/property-detail-header/ui.tsx` | 204 | `text-blue-600` | `text-brand-primary` |
| `entities/property/ui/property-sidebar-conditions/ui.tsx` | 102 | `bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950` | Переменные |
| `entities/property/ui/property-sidebar-conditions/ui.tsx` | 145 | `bg-blue-600 hover:bg-blue-700 text-white` | `bg-brand-primary hover:bg-brand-primary-hover` |
| `entities/property/ui/property-sidebar-conditions/ui.tsx` | 154 | `bg-blue-50 text-blue-700 hover:bg-blue-100` | Переменные |
| `entities/property/ui/property-agent-block/ui.tsx` | 109, 116 | `bg-blue-600`, `bg-blue-50 text-blue-700` | Переменные |
| `entities/property/ui/property-agent-sidebar-card/ui.tsx` | 108 | `text-blue-500 fill-current` | Переменная |
| `features/property-contact/ui.tsx` | 54, 92 | `bg-blue-600 hover:bg-blue-700` | `bg-brand-primary` |
| `features/property-contact/ui.tsx` | 99 | `border-blue-600 text-blue-600 hover:bg-blue-50` | Переменные |
| `entities/property/ui/property-description-section/ui.tsx` | 58-59 | `bg-blue-50 text-blue-600`, `bg-gray-100 text-gray-600` | Переменные |
| `entities/property/ui/property-mobile-main-info/ui.tsx` | 151 | `bg-blue-100 hover:bg-blue-200 text-blue-600` | Переменные |

### 2.2 Gray цвета (нейтральные)

Нужно заменить на `bg-background-secondary`, `text-text-secondary`, etc.

| Файл | Строки | Текущий класс | Замена |
|------|--------|---------------|--------|
| `entities/property/ui/property-gallery/ui.tsx` | 165 | `bg-gray-400` | `bg-text-tertiary` |
| `entities/property/ui/property-gallery/ui.tsx` | 251, 266, 282, 298 | `bg-gray-100 text-black hover:bg-gray-200` | `bg-secondary text-foreground hover:bg-muted` |
| `entities/property/ui/property-mobile-main-info/ui.tsx` | 127-128 | `bg-gray-100`, `text-gray-600` | `bg-secondary`, `text-text-secondary` |
| `entities/property/ui/property-mobile-main-info/ui.tsx` | 146 | `border-gray-200 placeholder:text-gray-400` | `border-border placeholder:text-text-tertiary` |
| `entities/property/ui/property-address-transport/transport-stations.tsx` | 174 | `bg-white border border-border` | `bg-background border-border` |

### 2.3 Статусные цвета

| Файл | Строки | Текущий класс | Замена |
|------|--------|---------------|--------|
| `entities/property/ui/property-sidebar-conditions/ui.tsx` | 164 | `bg-green-500 animate-pulse` | `bg-success` |
| `entities/property/ui/property-tenant-info/ui.tsx` | 56, 63, 70, 77 | `text-green-500`, `text-red-500` | `text-success`, `text-error` |

### 2.4 Фиксированные цвета (lightbox, overlay)

| Файл | Строки | Текущий класс | Примечание |
|------|--------|---------------|------------|
| `entities/property/ui/property-gallery/ui.tsx` | 395 | `bg-black` | Lightbox - возможно допустимо |
| `entities/property/ui/property-gallery/ui.tsx` | 176, 198 | `bg-white/20` | Overlay badges |
| `entities/property/ui/property-gallery/ui.tsx` | 177, 269 | `fill-white`, `stroke-white` | Icon colors on images |
| `entities/property/ui/property-gallery/ui.tsx` | 216 | `bg-white` | Floor plan background |

### 2.5 Цвет на карте (Mapbox)

| Файл | Строка | Значение | Решение |
|------|--------|----------|---------|
| `entities/property/ui/property-location-section/ui.tsx` | 84 | `'#3b82f6'` (blue-500) | Использовать CSS variable через JS |

---

## 3. Проблемы ISR и Client/Server компонентов

### 3.1 Компоненты без `'use client'` но с хуками/handlers

| Файл | Проблема | Решение |
|------|----------|---------|
| `entities/property/ui/property-agent-block/ui.tsx` | Имеет `onClick` handlers но нет `'use client'` | Добавить `'use client'`, передавать labels через props |

### 3.2 КРИТИЧНО: Проблема SEO с useTranslations

> **ПРОБЛЕМА:** Компоненты используют `useTranslations()` хук.
> Если добавить `'use client'` - переводы НЕ попадут в HTML и не будут индексироваться!

| Компонент | Использует | SEO-контент | Решение |
|-----------|------------|-------------|---------|
| `property-characteristics/ui.tsx` | `useTranslations()` | Да (характеристики) | **Убрать хук, передавать переводы через props** |
| `property-main-info/ui.tsx` | `useTranslations()` | Да (цена, площадь) | **Убрать хук, передавать переводы через props** |
| `property-header/ui.tsx` | `useTranslations()` | Да (breadcrumbs) | **Убрать хук, передавать переводы через props** |
| `property-mobile-main-info/ui.tsx` | `useTranslations()` | Да (цена, инфо) | **Убрать хук, передавать переводы через props** |
| `property-tenant-info/ui.tsx` | `useTranslations()` | Да (условия) | **Убрать хук, передавать переводы через props** |

**Правильный подход:**
```tsx
// page.tsx (Server Component)
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('propertyDetail');
  return <PropertyCharacteristics labels={{ rooms: t('rooms'), ... }} />;
}

// PropertyCharacteristics.tsx (Server Component - БЕЗ 'use client')
export function PropertyCharacteristics({ labels, data }) {
  return <div>{labels.rooms}: {data.rooms}</div>; // В HTML для SEO!
}
```

### 3.3 Оптимизация для ISR + SEO

**Текущее состояние:** Вся страница - client component (`'use client'` в `screens/property-detail-page/ui.tsx`)

**КРИТИЧНАЯ проблема:** Переводы рендерятся на клиенте → не индексируются поисковиками!

**Рекомендация:**
1. `app/[locale]/property/[id]/page.tsx` - использовать `getTranslations()` (server)
2. `screens/property-detail-page/ui.tsx` - убрать `'use client'`, сделать server component
3. Передавать переводы через props во все дочерние компоненты
4. Клиентскими оставить только интерактивные части (не SEO-критичные):
   - `property-gallery` (слайдер, lightbox)
   - `property-location-section` (Mapbox карта)
   - `property-sidebar-conditions` (accordion)
   - `property-detail-header` (sticky scroll)
   - `property-actions`, `property-contact` (кнопки)

### 3.4 Компоненты которые ДОЛЖНЫ быть Server Components (SEO)

| Компонент | SEO-контент | Почему важно |
|-----------|-------------|--------------|
| `property-characteristics` | Характеристики объекта | Индексация параметров |
| `property-main-info` | Цена, площадь, комнаты | Индексация ключевых данных |
| `property-header` | Breadcrumbs, заголовок | Структура страницы |
| `property-tenant-info` | Условия проживания | Индексация условий |
| `property-description-section` | Описание объекта | Основной контент |
| `property-amenities-grid` | Список удобств | Индексация features |

---

## 4. Нарушения FSD

### 4.1 Структурные проблемы

| Проблема | Файл/Место | Описание |
|----------|------------|----------|
| Мок-данные в entity | `property-header/ui.tsx:59-63` | Хардкод локаций (Испания, Барселона) |
| Мок-данные в entity | `property-location-section/mock-data.ts` | Файл mock-data не должен быть в entities |
| Экспорт моков | `transport-stations.tsx` | `mockBarcelonaStations` экспортируется из entity |
| Толстый widget | `property-detail/ui.tsx` | Импортирует 23+ entity компонента |

### 4.2 Неправильные импорты

| Проблема | Место | Правильное решение |
|----------|-------|-------------------|
| Widget знает о деталях entity | `property-detail-header` импортирует много entities | Использовать composition |
| Смешение слоёв | `property-detail` widget содержит бизнес-логику | Вынести в features |

### 4.3 Размещение компонентов

| Компонент | Текущее место | Рекомендация |
|-----------|---------------|--------------|
| `property-address-transport` | entities/property/ui | Может быть shared/ui (если generic) |
| `transport-stations` | Вложенный в entity | Отдельный entity или shared |

### 4.4 Console.log в продакшн коде

| Файл | Строки | Содержимое |
|------|--------|------------|
| `widgets/property-detail/ui.tsx` | 59 | `console.log('Open message')` |
| `widgets/property-detail/ui.tsx` | 63 | `console.log('Toggle favorite:', id)` |
| `widgets/property-detail/ui.tsx` | 67 | `console.log('Share:', id)` |
| `widgets/property-detail/ui.tsx` | 71 | `console.log('Like', property.id)` |
| `widgets/property-detail/ui.tsx` | 75 | `console.log('Dislike', property.id)` |
| `widgets/property-detail/ui.tsx` | 79 | `console.log('More options', property.id)` |
| `widgets/property-detail/ui.tsx` | 242 | `console.log('View all other offers')` |
| `widgets/property-detail/ui.tsx` | 251 | `console.log('View all similar')` |

---

## 5. Другие проблемы

### 5.1 Magic numbers/strings

| Файл | Строка | Значение | Описание |
|------|--------|----------|----------|
| `widgets/property-detail-header/ui.tsx` | 47 | `50` | Scroll threshold |
| `widgets/property-detail-header/ui.tsx` | 56 | `300` | Intersection offset |
| `widgets/property-detail-header/ui.tsx` | 71 | `60` | Header height |
| `widgets/property-detail/ui.tsx` | 88 | `'ru-RU'` | Хардкод локали для форматирования |

### 5.2 Accessibility проблемы

| Проблема | Место |
|----------|-------|
| Отсутствуют `aria-label` | Icon-only кнопки в gallery, header |
| Keyboard navigation | Не все интерактивные элементы доступны с клавиатуры |

### 5.3 Тёмная тема - несоответствия

Некоторые компоненты имеют `dark:` варианты, другие - нет:

| Есть dark mode | Нет dark mode |
|----------------|---------------|
| `property-sidebar-conditions` (частично) | `property-gallery` (много хардкода) |
| `.dark` в globals.css | `property-mobile-main-info` |
| | `property-description-section` |

### 5.4 Типизация

| Проблема | Место |
|----------|-------|
| Нет валидации структуры `nearbyTransport` | `property-location-section/ui.tsx:84+` |

---

## 6. Структура API и моков

### 6.1 Текущие проблемы с данными

Сейчас данные захардкожены прямо в компонентах. Нужно:
1. Вынести в отдельные JSON-файлы для разработки
2. Создать хелперы для переключения между моками и реальным API
3. Типизировать структуры данных

### 6.2 Архитектура запросов (с бекенда)

Страница property-detail использует **4 отдельных запроса**:

| Запрос | Endpoint | Описание |
|--------|----------|----------|
| **Основной объект** | `GET /api/properties/{id}` | Все данные объекта недвижимости |
| **Инфраструктура** | `GET /api/properties/{id}/nearby` | Транспорт, аптеки, магазины и т.д. |
| **Объекты агента** | `GET /api/agents/{agentId}/properties` | Другие объекты этого агента |
| **Рекомендации** | `GET /api/properties/{id}/similar` | Похожие объекты |

### 6.3 Структура основного объекта (`property.json`)

```typescript
interface PropertyDetail {
  id: string;

  // Заголовок и описание
  title: string;
  description: {
    original: string;
    translated?: string;
    language: string;
  };

  // Цена и условия
  price: number;
  currency: 'EUR' | 'USD' | 'RUB';
  pricePerMeter: number;
  deposit: number;
  commission: number | null;  // null = без комиссии
  utilitiesIncluded: boolean;
  minRentalPeriod: number;    // в месяцах

  // Локация
  location: {
    country: string;
    region: string;
    province: string;
    city: string;
    district: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };

  // Характеристики
  characteristics: {
    propertyType: 'apartment' | 'studio' | 'penthouse' | 'duplex';
    totalArea: number;
    livingArea: number;
    kitchenArea: number;
    rooms: number;
    bedrooms: number;
    bathrooms: number;
    floor: number;
    totalFloors: number;
    ceilingHeight: number;
    balcony: boolean;
    renovation: 'cosmetic' | 'euro' | 'designer' | 'requires-repair' | 'none';
    windowView: 'street' | 'yard' | 'both';
    buildingYear: number;
    buildingType: 'brick' | 'monolith' | 'panel' | 'block';
    elevator: boolean;
    parking: 'underground' | 'ground' | 'street' | 'none';
  };

  // Удобства
  amenities: string[];  // ['wifi', 'airConditioning', 'washingMachine', ...]

  // Медиа
  media: {
    images: Array<{ url: string; thumbnail: string; alt?: string }>;
    video?: { url: string; thumbnail: string };
    tour3d?: { url: string; thumbnail: string };
    floorPlan?: { url: string };
  };

  // Условия проживания
  livingRules: {
    petsAllowed: boolean;
    childrenAllowed: boolean;
    smokingAllowed: boolean;
    couplesAllowed: boolean;
    studentsAllowed: boolean;
  };

  // Информация о соседях (для комнат)
  roommates?: {
    total: number;
    gender: 'male' | 'female' | 'mixed';
    ageRange: string;
    occupation: string;
    atmosphere: 'quiet' | 'friendly' | 'party';
  };

  // Агент
  agent: {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    type: 'agent' | 'owner' | 'agency';
    agencyName?: string;
    rating: number;
    reviewsCount: number;
    yearsOnPlatform: number;
    propertiesCount: number;
    isOnline: boolean;
    isSuperAgent: boolean;
    isVerified: boolean;
  };

  // Статистика
  stats: {
    viewsCount: number;
    viewsToday: number;
    favoritesCount: number;
    publishedAt: string;   // ISO date
    updatedAt: string;     // ISO date
  };

  // Статусы
  status: 'active' | 'reserved' | 'rented';
  isNew: boolean;
  isTop: boolean;
  isVerified: boolean;
}
```

### 6.4 Структура инфраструктуры (`nearby-places.json`)

```typescript
interface NearbyPlaces {
  transport: Array<{
    name: string;
    type: 'metro' | 'train' | 'bus' | 'tram';
    line?: string;
    color?: string;
    distance: number;      // в метрах
    walkTime: number;      // в минутах
    coordinates: { lat: number; lng: number };
  }>;

  schools: Array<NearbyPlace>;
  medical: Array<NearbyPlace>;
  groceries: Array<NearbyPlace>;
  shopping: Array<NearbyPlace>;
  restaurants: Array<NearbyPlace>;
  sports: Array<NearbyPlace>;
  parks: Array<NearbyPlace>;
  beauty: Array<NearbyPlace>;
  entertainment: Array<NearbyPlace>;
  attractions: Array<NearbyPlace>;
}

interface NearbyPlace {
  name: string;
  type: string;
  distance: number;
  walkTime: number;
  rating?: number;
  coordinates: { lat: number; lng: number };
}
```

### 6.5 Структура объектов агента (`agent-properties.json`)

```typescript
interface AgentProperty {
  id: string;
  title: string;
  price: number;
  currency: string;
  address: string;
  rooms: number;
  area: number;
  floor: number;
  totalFloors: number;
  image: string;
  isNew: boolean;
}

type AgentProperties = AgentProperty[];
```

### 6.6 Структура рекомендаций (`similar-properties.json`)

```typescript
// Такая же структура как AgentProperty
type SimilarProperties = AgentProperty[];
```

### 6.7 Где сейчас хардкод данных

| Компонент | Данные | Откуда должны приходить |
|-----------|--------|------------------------|
| `property-header/ui.tsx:59-63` | Локации (Испания, Барселона) | `property.location` |
| `property-header/ui.tsx:32-33` | Статистика просмотров | `property.stats` |
| `property-location-section/mock-data.ts` | Инфраструктура | `nearby-places.json` |
| `transport-stations.tsx` | `mockBarcelonaStations` | `nearby-places.transport` |
| `property-list-section` | Похожие объекты | `similar-properties.json` |

---

## Сводная статистика

| Категория | Количество | Критичность |
|-----------|------------|-------------|
| Хардкод русских строк | ~32 | ВЫСОКАЯ |
| Хардкод цветов | ~35+ | СРЕДНЯЯ |
| Отсутствие 'use client' | 6 | СРЕДНЯЯ |
| Console.log | 8 | НИЗКАЯ |
| Нарушения FSD | 5 | СРЕДНЯЯ |
| Мок-данные в коде | 5 | СРЕДНЯЯ |
| Проблемы тёмной темы | 10+ | СРЕДНЯЯ |
| Accessibility | 3+ | НИЗКАЯ |

**Всего найдено: ~100+ проблем**
