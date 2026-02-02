# Property Detail Page - TODO Checklist

> Чеклист задач для рефакторинга страницы property-detail
> Статус: `[ ]` - не начато, `[~]` - в процессе, `[x]` - завершено
> После выполнения шага нужно отметить в этом файле

## Дополнительные исправления (выполнено)

- [x] Исправлен тип `property.bedrooms` -> `property.rooms` в 9 файлах:
  - `src/widgets/map-sidebar/ui/ui.tsx`
  - `src/widgets/ai-agent-stories/ui/ui.tsx`
  - `src/entities/chat/ui/property-open-card/ui.tsx`
  - `src/entities/chat/ui/property-expanded-card/ui.tsx`
  - `src/entities/chat/ui/property-batch-card/ui.tsx`
  - `src/entities/property/ui/property-card-horizontal/ui.tsx`
  - `src/entities/property/ui/property-card/ui.tsx`
  - `src/entities/property/ui/property-card-grid/ui.tsx`
  - `src/entities/property/ui/property-details/ui.tsx`
  - `src/shared/api/chat.ts`
  - `src/shared/api/properties.ts`

---

## Фаза 1: Подготовка и локализация

### 1.1 Добавить недостающие локали в messages

- [x] **ru.json** - добавить/проверить ключи:
  - [x] `propertyDetail.videoPresentation` = "Видео презентация"
  - [x] `propertyDetail.mockVideoPlayer` = удалить (debug) - удалено из кода
  - [x] `propertyDetail.mockViewer` = удалить (debug) - удалено из кода
  - [x] `propertyDetail.updated` = "Обновлено"
  - [x] `propertyDetail.views` = "{count} просмотров"
  - [x] `propertyDetail.viewsToday` = "{count} за сегодня"

- [x] **en.json** - синхронизировать те же ключи
- [x] **fr.json** - синхронизировать те же ключи (footer, propertyDetail, characteristics, amenities, common)

### 1.2 Убрать хардкод строк в компонентах

#### property-gallery
- [x] `ui.tsx:179` - заменить `'Видео презентация'` на `t('videoPresentation')`
- [x] `ui.tsx:180` - удалить `'Mock Video Player'`
- [x] `ui.tsx:201` - заменить `'3D Тур'` на `t('tour3d')`
- [x] `ui.tsx:202` - удалить `'Mock 3D Viewer'`
- [x] Добавить `'use client'` если отсутствует - уже есть
- [x] Добавить импорт `useTranslations` - уже есть

#### property-gallery/media-section
- [x] `media-section.tsx:22-25` - использовать ключи локализации для tab labels:
  ```tsx
  { id: 'photos', label: t('navPhotos') }
  { id: 'video', label: t('video') }
  { id: 'tour3d', label: t('tour3d') }
  { id: 'plan', label: t('plan') }
  ```
- [x] `media-section.tsx:80-81` - то же для video section
- [x] `media-section.tsx:98-99` - то же для 3D section

#### property-location-section
- [x] `ui.tsx:60-70` - заменить хардкод категорий на:
  ```tsx
  { key: 'transport', icon: Bus, label: t('categories.transport') }
  // и так далее для всех 11 категорий
  ```

#### property-header
- [x] `ui.tsx:32` - убрать мок `'сегодня, 19:39'`, использовать реальные данные или форматтер
- [x] `ui.tsx:33` - использовать translations через props
- [x] `ui.tsx:39` - заменить `'Обновлено:'` на translations.updated
- [x] `ui.tsx:59-63` - убрать хардкод локаций - данные теперь приходят через props (location)

#### property-sidebar-conditions
- [ ] `ui.tsx:57` - заменить `/мес.` на `t('common.perMonth')`

#### property-mobile-main-info
- [ ] `ui.tsx:123` - заменить `/мес` на `t('common.perMonth')`

#### property-list-section
- [ ] `ui.tsx:28` - заменить default `"Смотреть все"` на `t('propertyDetail.showAll')`

---

## Фаза 2: Цветовая система (Tailwind v4 variables)

### 2.1 Обновить globals.css (если нужно)

- [ ] Проверить наличие всех нужных CSS переменных:
  - [ ] `--brand-primary` ✓
  - [ ] `--brand-primary-hover` ✓
  - [ ] `--brand-primary-light` ✓
  - [ ] `--success`, `--error`, `--warning` ✓
  - [ ] `--background-secondary`, `--background-tertiary` ✓
  - [ ] `--text-secondary`, `--text-tertiary` ✓

### 2.2 Заменить хардкод цветов

#### widgets/property-detail-header
- [ ] `ui.tsx:106` - `text-blue-600` → `text-brand-primary`
- [ ] `ui.tsx:122` - `bg-blue-600 text-white shadow-sm` → `bg-brand-primary text-white shadow-sm`
- [ ] `ui.tsx:163` - `text-blue-600` → `text-brand-primary`
- [ ] `ui.tsx:189` - `text-blue-600 hover:bg-blue-50` → `text-brand-primary hover:bg-brand-primary-light`
- [ ] `ui.tsx:196` - то же
- [ ] `ui.tsx:204` - `text-blue-600` → `text-brand-primary`

#### entities/property/ui/property-sidebar-conditions
- [ ] `ui.tsx:102` - `bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400` → использовать переменные
- [ ] `ui.tsx:145` - `bg-blue-600 hover:bg-blue-700 text-white` → `bg-brand-primary hover:bg-brand-primary-hover text-white`
- [ ] `ui.tsx:154` - `bg-blue-50 text-blue-700 hover:bg-blue-100` → переменные
- [ ] `ui.tsx:164` - `bg-green-500` → `bg-success`

#### entities/property/ui/property-agent-block
- [ ] `ui.tsx:109` - `bg-blue-600 hover:bg-blue-700 text-white` → `bg-brand-primary hover:bg-brand-primary-hover text-white`
- [ ] `ui.tsx:116` - `bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20` → переменные

#### entities/property/ui/property-agent-sidebar-card
- [ ] `ui.tsx:108` - `text-blue-500 fill-current` → `text-brand-primary`

#### entities/property/ui/property-gallery
- [ ] `ui.tsx:165` - `bg-gray-400` → `bg-text-tertiary`
- [ ] `ui.tsx:251, 266, 282, 298` - `bg-gray-100 text-black hover:bg-gray-200` → `bg-secondary text-foreground hover:bg-muted`
- [ ] `ui.tsx:254, 269, 285, 301` - `stroke-white/stroke-black` → использовать переменные или оставить (на изображениях)
- [ ] `ui.tsx:216` - `bg-white` → `bg-background`
- [ ] `ui.tsx:395` - `bg-black` → допустимо для lightbox

#### entities/property/ui/property-description-section
- [ ] `ui.tsx:58-59` - заменить хардкод цветов кнопок на переменные

#### entities/property/ui/property-mobile-main-info
- [ ] `ui.tsx:127` - `bg-gray-100` → `bg-secondary`
- [ ] `ui.tsx:128` - `text-gray-600` → `text-text-secondary`
- [ ] `ui.tsx:129` - `bg-white` → `bg-background`
- [ ] `ui.tsx:146` - `border-gray-200 placeholder:text-gray-400` → `border-border placeholder:text-text-tertiary`
- [ ] `ui.tsx:151` - `bg-blue-100 hover:bg-blue-200 text-blue-600` → переменные

#### features/property-contact
- [ ] `ui.tsx:54, 92` - `bg-blue-600 hover:bg-blue-700 text-white` → `bg-brand-primary hover:bg-brand-primary-hover text-white`
- [ ] `ui.tsx:99` - `border-blue-600 bg-background text-blue-600 hover:bg-blue-50` → переменные

#### entities/property/ui/property-tenant-info
- [ ] `ui.tsx:56, 63, 70, 77` - `text-green-500`/`text-red-500` → `text-success`/`text-error`

#### entities/property/ui/property-address-transport/transport-stations
- [ ] `transport-stations.tsx:174` - `bg-white` → `bg-background`

#### entities/property/ui/property-location-section
- [ ] `ui.tsx:84` - Mapbox цвет `'#3b82f6'` → получать из CSS variable через getComputedStyle или config

---

## Фаза 3: ISR, SEO и Server/Client архитектура

> **ВАЖНО для SEO:** Все переводы должны рендериться на сервере и попадать в HTML для индексации.
> Нельзя использовать `'use client'` для компонентов с переводами - они не попадут в выдачу!

### 3.1 Стратегия локализации для SEO

**Проблема:** `useTranslations()` из next-intl - это хук, требует `'use client'`.
**Решение:** Использовать `getTranslations()` на сервере и передавать переводы через props.

```tsx
// ❌ ПЛОХО для SEO - переводы не в HTML
'use client'
export function Component() {
  const t = useTranslations('propertyDetail');
  return <h1>{t('title')}</h1>; // Не индексируется!
}

// ✅ ХОРОШО для SEO - переводы в HTML
// page.tsx (Server Component)
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('propertyDetail');
  return <Component title={t('title')} />; // Индексируется!
}
```

### 3.2 Рефакторинг компонентов для SEO

#### 3.2.1 Компоненты которые ДОЛЖНЫ быть Server Components (с переводами)

Эти компоненты содержат контент важный для SEO:

| Компонент | Что индексируется | Действие |
|-----------|-------------------|----------|
| `property-header` | Breadcrumbs, заголовок | Убрать useTranslations, принимать через props |
| `property-main-info` | Цена, площадь, комнаты | Убрать useTranslations, принимать через props |
| `property-characteristics` | Все характеристики | Убрать useTranslations, принимать через props |
| `property-description-section` | Описание объекта | Статичная часть - server, кнопка "показать больше" - client |
| `property-tenant-info` | Условия проживания | Убрать useTranslations, принимать через props |
| `property-amenities-grid` | Список удобств | Статичная часть - server |

**Задачи:**
- [ ] `property-header/ui.tsx` - убрать `useTranslations`, добавить props для переводов
- [ ] `property-main-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов
- [ ] `property-characteristics/ui.tsx` - убрать `useTranslations`, добавить props для переводов
- [ ] `property-tenant-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов
- [ ] `property-mobile-main-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов

#### 3.2.2 Компоненты которые могут быть Client Components (интерактивные)

Эти компоненты не содержат SEO-критичный контент:

| Компонент | Причина client | Переводы |
|-----------|----------------|----------|
| `property-gallery` | useState, слайдер, lightbox | Минимум (alt для img) - через props |
| `property-location-section` | Mapbox, интерактивная карта | Категории - через props |
| `property-sidebar-conditions` | Accordion, state | Лейблы - через props |
| `property-detail-header` | Sticky scroll, navigation | Навигация - через props |
| `property-actions` | onClick handlers | Tooltip labels - через props |
| `property-contact` | onClick handlers | Button labels - через props |
| `property-agent-block` | onClick handlers | Labels - через props |

**Задачи:**
- [x] `property-gallery/ui.tsx` - оставить `'use client'`, использует useTranslations
- [x] `property-location-section/ui.tsx` - оставить `'use client'`, категории локализованы через useTranslations
- [ ] `property-sidebar-conditions/ui.tsx` - оставить `'use client'`, передавать лейблы через props
- [x] `property-detail-header/ui.tsx` - оставить `'use client'`, передавать nav items через props
- [ ] `property-actions/ui.tsx` - оставить `'use client'`, передавать labels через props
- [ ] `property-contact/ui.tsx` - оставить `'use client'`, передавать labels через props
- [ ] `property-agent-block/ui.tsx` - добавить `'use client'`, передавать labels через props

### 3.3 Рефакторинг страницы для ISR

#### 3.3.1 Структура page.tsx (Server Component)

```tsx
// app/[locale]/property/[id]/page.tsx
import { getTranslations } from 'next-intl/server';
import { PropertyDetailPage } from '@/screens/property-detail-page';
import { getPropertyDetail, getNearbyPlaces } from '@/shared/api';

export const revalidate = 3600; // ISR: обновлять каждый час

export async function generateMetadata({ params }) {
  const property = await getPropertyDetail(params.id);
  const t = await getTranslations('propertyDetail');

  return {
    title: `${property.title} - ${t('rooms', { count: property.rooms })}`,
    description: property.description.translated || property.description.original,
  };
}

export default async function Page({ params }) {
  const t = await getTranslations('propertyDetail');
  const tCommon = await getTranslations('common');
  const tAmenities = await getTranslations('amenities');
  const tCharacteristics = await getTranslations('characteristics');

  const property = await getPropertyDetail(params.id);
  const nearbyPlaces = await getNearbyPlaces(params.id);

  // Подготовить все переводы для передачи в компоненты
  const translations = {
    propertyDetail: { /* все нужные ключи */ },
    common: { /* все нужные ключи */ },
    amenities: { /* все нужные ключи */ },
    characteristics: { /* все нужные ключи */ },
  };

  return (
    <PropertyDetailPage
      property={property}
      nearbyPlaces={nearbyPlaces}
      translations={translations}
    />
  );
}
```

**Задачи:**
- [x] Обновить `app/[locale]/property/[id]/page.tsx`:
  - [x] Добавить `export const revalidate = 21600` для ISR (6 часов)
  - [x] Использовать `getTranslations()` через хелпер `getPropertyPageTranslations()`
  - [x] Собрать все переводы в объект
  - [x] Передать в `PropertyDetailPage`
  - [x] Добавить `generateMetadata` для SEO

#### 3.3.2 Обновить screens/property-detail-page

- [x] `screens/property-detail-page/ui.tsx`:
  - [~] Убрать `'use client'` - оставлен для интерактивности, но переводы передаются через props
  - [x] Принимать `property`, `translations`, `locale` через props
  - [x] Передавать нужные переводы в дочерние компоненты

#### 3.3.3 Паттерн для компонентов с интерактивностью

Для компонентов где часть - статика (SEO), часть - интерактив:

```tsx
// property-description-section/ui.tsx (Server Component - без 'use client')
import { ExpandButton } from './expand-button'; // Client Component

interface Props {
  description: string;
  labels: {
    showMore: string;
    showLess: string;
  };
}

export function PropertyDescriptionSection({ description, labels }: Props) {
  return (
    <section>
      <p>{description}</p> {/* SEO - в HTML */}
      <ExpandButton labels={labels} /> {/* Интерактив - client */}
    </section>
  );
}

// property-description-section/expand-button.tsx
'use client'
export function ExpandButton({ labels }) {
  const [expanded, setExpanded] = useState(false);
  return <button onClick={() => setExpanded(!expanded)}>
    {expanded ? labels.showLess : labels.showMore}
  </button>;
}
```

**Задачи:**
- [ ] `property-description-section` - разделить на server (текст) + client (кнопка)
- [ ] `property-amenities-grid` - разделить на server (список) + client (expand)

### 3.4 Создать хелпер для сбора переводов

- [x] Создать `src/shared/lib/get-property-translations.ts`:
  ```typescript
  import { getTranslations } from 'next-intl/server';

  export async function getPropertyPageTranslations() {
    const t = await getTranslations('propertyDetail');
    const tCommon = await getTranslations('common');
    // ...

    return {
      header: {
        back: tCommon('back'),
        // ...
      },
      gallery: {
        photos: t('navPhotos'),
        video: t('video'),
        // ...
      },
      // ... остальные секции
    };
  }
  ```

### 3.5 Чеклист SEO-проверки

После рефакторинга проверить:
- [ ] View Source страницы содержит все переводы в HTML
- [ ] Описание объекта видно в HTML (не загружается JS)
- [ ] Характеристики видны в HTML
- [ ] Цена видна в HTML
- [ ] Meta title и description корректны
- [ ] Breadcrumbs в HTML

---

## Фаза 4: Тёмная тема

### 4.1 Проверить все компоненты на dark mode

- [ ] `property-gallery/ui.tsx` - добавить dark: варианты
- [ ] `property-mobile-main-info/ui.tsx` - добавить dark: варианты
- [ ] `property-description-section/ui.tsx` - добавить dark: варианты
- [ ] `transport-stations.tsx` - добавить dark: варианты

### 4.2 Тестирование тёмной темы

- [ ] Проверить все кнопки в dark mode
- [ ] Проверить все карточки в dark mode
- [ ] Проверить галерею в dark mode
- [ ] Проверить карту в dark mode (Mapbox имеет свои темы)

---

## Фаза 5: FSD рефакторинг

### 5.1 Удалить console.log

- [ ] `widgets/property-detail/ui.tsx:59` - удалить/заменить на logger
- [ ] `widgets/property-detail/ui.tsx:63` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:67` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:71` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:75` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:79` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:242` - удалить/заменить
- [ ] `widgets/property-detail/ui.tsx:251` - удалить/заменить

### 5.2 Организация мок-данных для разработки

**Структура:** Создать JSON-файлы имитирующие ответы бекенда для тестирования вёрстки.

#### Создать директорию и файлы моков:
```
src/shared/api/mocks/property-detail/
├── property.json           # Основные данные объекта (1 запрос)
├── nearby-places.json      # Инфраструктура: транспорт, аптеки, и т.д. (отдельный запрос)
├── agent-properties.json   # Другие объекты агента (отдельный запрос)
└── similar-properties.json # Рекомендации/похожие объекты (отдельный запрос)
```

#### 5.2.1 Создать `property.json` - основной объект
- [ ] Создать файл `src/shared/api/mocks/property-detail/property.json`
- [ ] Включить все данные объекта:
  - id, title, description (оригинал + перевод)
  - price, deposit, commission, utilities
  - location (country, region, city, district, address, coordinates)
  - характеристики (area, rooms, floor, etc.)
  - amenities (массив удобств)
  - images, video, tour3d, floorPlan
  - agent info (id, name, phone, avatar, rating, isOnline)
  - stats (views, viewsToday, updatedAt)
  - tenant preferences (если аренда комнаты)

#### 5.2.2 Создать `nearby-places.json` - инфраструктура
- [ ] Создать файл `src/shared/api/mocks/property-detail/nearby-places.json`
- [ ] Структура по категориям:
  ```json
  {
    "transport": [{ "name": "Passeig de Gràcia", "type": "metro", "line": "L3", "distance": 250, "walkTime": 3 }],
    "schools": [...],
    "medical": [...],
    "groceries": [...],
    "shopping": [...],
    "restaurants": [...],
    "sports": [...],
    "parks": [...],
    "beauty": [...],
    "entertainment": [...],
    "attractions": [...]
  }
  ```

#### 5.2.3 Создать `agent-properties.json` - объекты агента
- [ ] Создать файл `src/shared/api/mocks/property-detail/agent-properties.json`
- [ ] Массив карточек объектов агента (упрощённая версия property)

#### 5.2.4 Создать `similar-properties.json` - рекомендации
- [ ] Создать файл `src/shared/api/mocks/property-detail/similar-properties.json`
- [ ] Массив похожих объектов

#### 5.2.5 Создать хелпер для загрузки моков
- [ ] Создать `src/shared/api/mocks/property-detail/index.ts`:
  ```typescript
  // Флаг для переключения между моками и реальным API
  const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

  export async function getPropertyDetail(id: string) {
    if (USE_MOCKS) {
      const data = await import('./property.json');
      return data.default;
    }
    return fetch(`/api/properties/${id}`).then(r => r.json());
  }

  export async function getNearbyPlaces(propertyId: string) {
    if (USE_MOCKS) {
      const data = await import('./nearby-places.json');
      return data.default;
    }
    return fetch(`/api/properties/${propertyId}/nearby`).then(r => r.json());
  }

  // ... аналогично для остальных
  ```

#### 5.2.6 Удалить старые моки из entities
- [ ] Удалить `property-location-section/mock-data.ts`
- [ ] Удалить `mockBarcelonaStations` из `transport-stations.tsx`
- [ ] Убрать хардкод локаций из `property-header/ui.tsx`
- [ ] Обновить компоненты чтобы получали данные через props

#### 5.2.7 Добавить переменную окружения
- [ ] Добавить в `.env.local`: `NEXT_PUBLIC_USE_MOCKS=true`
- [ ] Добавить в `.env.example`: `NEXT_PUBLIC_USE_MOCKS=false`

### 5.3 Убрать magic numbers

- [ ] `widgets/property-detail-header/ui.tsx:47` - вынести `50` в константу `SCROLL_THRESHOLD`
- [ ] `widgets/property-detail-header/ui.tsx:56` - вынести `300` в константу `INTERSECTION_OFFSET`
- [ ] `widgets/property-detail-header/ui.tsx:71` - вынести `60` в константу `HEADER_HEIGHT`
- [ ] `widgets/property-detail/ui.tsx:88` - `'ru-RU'` → использовать текущую локаль из контекста

### 5.4 Рефакторинг widget (optional)

- [ ] Разбить `property-detail` widget на более мелкие виджеты:
  - [ ] `PropertyContentWidget` - основной контент
  - [ ] `PropertySidebarWidget` - боковая панель
  - [ ] `PropertyRelatedWidget` - похожие объекты
- [ ] Или использовать composition pattern для уменьшения связности

---

## Фаза 6: Accessibility (optional)

### 6.1 Добавить aria-labels

- [ ] Кнопки навигации в gallery
- [ ] Icon-only кнопки в header
- [ ] Кнопки действий (like, share, favorite)

### 6.2 Keyboard navigation

- [ ] Проверить tab order в gallery
- [ ] Проверить keyboard accessible modals

---

## Чеклист ревью

После завершения всех фаз:

- [ ] Все строки локализованы (нет русского текста в JSX)
- [ ] Все цвета используют CSS переменные (нет `blue-600`, `gray-100` и т.д.)
- [ ] Страница работает с ISR (серверный рендеринг статики)
- [ ] **SEO: View Source содержит все переводы в HTML**
- [ ] **SEO: Meta tags корректны (title, description)**
- [ ] Тёмная тема работает корректно
- [ ] Нет console.log в production коде
- [ ] Нет мок-данных в entities
- [ ] Client components только там где нужна интерактивность
- [ ] Моки легко переключаются на реальный API

---

## Приоритеты

1. **КРИТИЧНЫЙ** - Фаза 3 (ISR + SEO) - переводы должны быть в HTML для индексации
2. **ВЫСОКИЙ** - Фаза 1 (локализация) - влияет на пользователей
3. **ВЫСОКИЙ** - Фаза 2 (цвета) - влияет на брендинг и темы
4. **СРЕДНИЙ** - Фаза 5 (FSD + моки) - maintainability, подготовка к бекенду
5. **СРЕДНИЙ** - Фаза 4 (тёмная тема) - UX
6. **НИЗКИЙ** - Фаза 6 (accessibility) - a11y compliance

> **Порядок выполнения:**
> Фаза 3 должна идти первой или параллельно с Фазой 1, т.к. она меняет архитектуру
> передачи переводов (props вместо useTranslations).

---

## Оценка объёма

| Фаза | Файлов затронуто | Сложность | SEO-критично |
|------|------------------|-----------|--------------|
| Фаза 1 | ~10 | Простая | Да |
| Фаза 2 | ~15 | Средняя | Нет |
| Фаза 3 | ~15 | Сложная | **ДА** |
| Фаза 4 | ~8 | Средняя | Нет |
| Фаза 5 | ~8 | Средняя | Нет |
| Фаза 6 | ~10 | Простая | Частично |

**Всего: ~50 файлов требуют изменений**

---

## Рекомендуемый порядок работы

```
1. Фаза 3.3 (page.tsx) → настроить ISR и getTranslations
   ↓
2. Фаза 3.2.1 → рефакторинг server components (убрать useTranslations)
   ↓
3. Фаза 1 → добавить недостающие локали
   ↓
4. Фаза 3.2.2 → рефакторинг client components (props для переводов)
   ↓
5. Фаза 5.2 → настроить моки
   ↓
6. Фаза 2 → заменить хардкод цветов
   ↓
7. Фаза 4 → тёмная тема
   ↓
8. Фаза 5.1, 5.3 → cleanup (console.log, magic numbers)
   ↓
9. Фаза 6 → accessibility
```
