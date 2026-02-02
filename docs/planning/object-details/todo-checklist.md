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
- [x] `ui.tsx:57` - заменить `/мес.` на `t('common.perMonth')` - выполнено

#### property-mobile-main-info
- [x] `ui.tsx:123` - заменить `/мес` на `t('common.perMonth')`, м² → t('sqm') - выполнено

#### property-list-section
- [x] `ui.tsx:28` - убран дефолтный текст "Смотреть все" - выполнено

---

## Фаза 2: Цветовая система (Tailwind v4 variables)

### 2.1 Обновить globals.css (если нужно)

- [x] Проверить наличие всех нужных CSS переменных:
  - [x] `--brand-primary` ✓
  - [x] `--brand-primary-hover` ✓
  - [x] `--brand-primary-light` ✓
  - [x] `--success`, `--error`, `--warning` ✓
  - [x] `--background-secondary`, `--background-tertiary` ✓
  - [x] `--text-secondary`, `--text-tertiary` ✓

### 2.2 Заменить хардкод цветов

#### widgets/property-detail-header
- [x] `ui.tsx:106` - `text-blue-600` → `text-brand-primary` - выполнено
- [x] `ui.tsx:122` - `bg-blue-600 text-white shadow-sm` → `bg-brand-primary text-white shadow-sm` - выполнено
- [x] `ui.tsx:163` - `text-blue-600` → `text-brand-primary` - выполнено
- [x] `ui.tsx:189` - `text-blue-600 hover:bg-blue-50` → `text-brand-primary hover:bg-brand-primary-light` - выполнено
- [x] `ui.tsx:196` - то же - выполнено
- [x] `ui.tsx:204` - `text-blue-600` → `text-brand-primary` - выполнено

#### entities/property/ui/property-sidebar-conditions
- [x] `ui.tsx:102` - использовать переменные - выполнено
- [x] `ui.tsx:145` - `bg-brand-primary hover:bg-brand-primary-hover text-white` - выполнено
- [x] `ui.tsx:154` - переменные - выполнено
- [x] `ui.tsx:164` - `bg-success` - выполнено

#### entities/property/ui/property-agent-block
- [x] `ui.tsx:109` - `bg-brand-primary hover:bg-brand-primary-hover text-white` - выполнено
- [x] `ui.tsx:116` - переменные - выполнено

#### entities/property/ui/property-agent-sidebar-card
- [x] `ui.tsx:108` - `text-brand-primary` - выполнено

#### entities/property/ui/property-gallery
- [x] `ui.tsx:165` - `bg-text-tertiary` - выполнено
- [x] `ui.tsx:251, 266, 282, 298` - `bg-secondary text-foreground hover:bg-muted` - выполнено
- [x] `ui.tsx:254, 269, 285, 301` - оставлено для изображений - выполнено
- [x] `ui.tsx:216` - `bg-background` - выполнено
- [x] `ui.tsx:395` - `bg-black` допустимо для lightbox - выполнено

#### entities/property/ui/property-description-section
- [x] `ui.tsx:58-59` - заменить хардкод цветов кнопок на переменные - выполнено

#### entities/property/ui/property-mobile-main-info
- [x] `ui.tsx:127` - `bg-secondary` - выполнено
- [x] `ui.tsx:128` - `text-text-secondary` - выполнено
- [x] `ui.tsx:129` - `bg-background` - выполнено
- [x] `ui.tsx:146` - `border-border placeholder:text-text-tertiary` - выполнено
- [x] `ui.tsx:151` - переменные - выполнено

#### features/property-contact
- [x] `ui.tsx:54, 92` - `bg-brand-primary hover:bg-brand-primary-hover text-white` - выполнено
- [x] `ui.tsx:99` - переменные - выполнено

#### entities/property/ui/property-tenant-info
- [x] `ui.tsx:56, 63, 70, 77` - `text-success`/`text-error` - выполнено

#### entities/property/ui/property-address-transport/transport-stations
- [x] `transport-stations.tsx:174` - `bg-background` - выполнено

#### entities/property/ui/property-location-section
- [x] `ui.tsx:84` - Mapbox цвет `'#3b82f6'` → получать из CSS variable через getComputedStyle - выполнено

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
- [x] `property-header/ui.tsx` - убрать `useTranslations`, добавить props для переводов - выполнено
- [x] `property-main-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов - выполнено
- [x] `property-characteristics/ui.tsx` - убрать `useTranslations`, добавить props для переводов - выполнено
- [x] `property-tenant-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов - выполнено
- [x] `property-mobile-main-info/ui.tsx` - убрать `useTranslations`, добавить props для переводов - выполнено

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
- [x] `property-sidebar-conditions/ui.tsx` - оставить `'use client'`, передавать лейблы через props - выполнено
- [x] `property-detail-header/ui.tsx` - оставить `'use client'`, передавать nav items через props
- [x] `property-actions/ui.tsx` - оставить `'use client'`, передавать labels через props - выполнено
- [x] `property-contact/ui.tsx` - оставить `'use client'`, передавать labels через props - выполнено
- [x] `property-agent-block/ui.tsx` - добавить `'use client'`, передавать labels через props - выполнено

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
- [x] `property-description-section` - принимает translations через props, текст рендерится на сервере
- [x] `property-amenities-grid` - принимает translations через props, список рендерится на сервере

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

- [x] `property-gallery/ui.tsx` - добавить dark: варианты - выполнено (используются семантические классы)
- [x] `property-mobile-main-info/ui.tsx` - добавить dark: варианты - выполнено
- [x] `property-description-section/ui.tsx` - добавить dark: варианты - выполнено
- [x] `transport-stations.tsx` - добавить dark: варианты - выполнено

### 4.2 Тестирование тёмной темы

- [x] Проверить все кнопки в dark mode - выполнено
- [x] Проверить все карточки в dark mode - выполнено (синхронизированы CSS переменные в globals.css)
- [x] Проверить галерею в dark mode - выполнено
- [ ] Проверить карту в dark mode (Mapbox имеет свои темы)

### 4.3 Исправления тёмной темы (2026-02-02)

- [x] Синхронизированы CSS переменные `[data-theme="dark"]` с `.dark` классом в `globals.css`
- [x] `property-amenities-grid/ui.tsx` - заменён `bg-brand-primary/10` на `bg-secondary` для корректной работы в тёмной теме
- [x] `property-gallery/media-section.tsx` - заменён `bg-white` на `bg-background` для floor plan section

---

## Фаза 5: FSD рефакторинг

### 5.1 Удалить console.log

- [x] `widgets/property-detail/ui.tsx:59` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:63` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:67` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:71` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:75` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:79` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:242` - заменён на TODO-комментарий
- [x] `widgets/property-detail/ui.tsx:251` - заменён на TODO-комментарий
- [x] `property-list-section/ui.tsx` - удалён console.log из onClick

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
- [x] Создать файл `src/shared/api/mocks/property-detail/property.json` - выполнено
- [x] Включить все данные объекта - выполнено

#### 5.2.2 Создать `nearby-places.json` - инфраструктура
- [x] Создать файл `src/shared/api/mocks/property-detail/nearby-places.json` - выполнено
- [x] Структура по категориям (transport, schools, medical, и т.д.) - выполнено

#### 5.2.3 Создать `agent-properties.json` - объекты агента
- [x] Создать файл `src/shared/api/mocks/property-detail/agent-properties.json` - выполнено
- [x] Массив карточек объектов агента - выполнено

#### 5.2.4 Создать `similar-properties.json` - рекомендации
- [x] Создать файл `src/shared/api/mocks/property-detail/similar-properties.json` - выполнено
- [x] Массив похожих объектов - выполнено

#### 5.2.5 Создать хелпер для загрузки моков
- [x] Создать `src/shared/api/mocks/property-detail/index.ts` - выполнено
- [x] Создать `src/shared/api/mocks/property-detail/types.ts` - выполнено
- [x] Реализовать функции: `getPropertyDetailById`, `getNearbyPlaces`, `getAgentProperties`, `getSimilarProperties`, `getPropertyPageData` - выполнено
- [x] Экспортировать типы и функции через `src/shared/api/index.ts` - выполнено

#### 5.2.6 Удалить старые моки из entities
- [x] Удалить `property-location-section/mock-data.ts` - выполнено
- [ ] Удалить `mockBarcelonaStations` из `transport-stations.tsx` - оставлен для возможного тестирования
- [x] Обновить компоненты чтобы получали данные через props - выполнено:
  - [x] `PropertyLocationSection` - принимает `nearbyPlaces` через props
  - [x] `PropertyListSection` - получает `agentProperties` и `similarProperties` через props
  - [x] Обновлён `page.tsx` для загрузки всех данных параллельно
  - [x] Обновлён `PropertyDetailPage` для передачи данных
  - [x] Обновлён `PropertyDetailWidget` для использования данных

#### 5.2.7 Добавить переменную окружения
- [x] Добавить в `.env.local`: `NEXT_PUBLIC_USE_MOCKS=true` - выполнено
- [x] Добавить в `.env.example`: `NEXT_PUBLIC_USE_MOCKS=false` - выполнено

### 5.3 Убрать magic numbers

- [x] `widgets/property-detail-header/ui.tsx:47` - вынести `50` в константу `SCROLL_THRESHOLD` - выполнено
- [x] `widgets/property-detail-header/ui.tsx:56` - вынести `300` в константу `INTERSECTION_OFFSET` - выполнено
- [x] `widgets/property-detail-header/ui.tsx:71` - вынести `60` в константу `HEADER_HEIGHT` - выполнено
- [x] `widgets/property-detail-header/ui.tsx` - `'ru-RU'` → добавлен locale prop + getIntlLocale() helper - выполнено

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
