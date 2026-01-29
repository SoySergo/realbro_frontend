# Chat Performance Optimization Analysis

## Executive Summary

**Вердикт по TanStack Virtual:** ✅ Рекомендуется для вертикального списка сообщений, особенно при наличии 50+ объектов.

---

## Проблемы производительности

### 1. Отсутствие мемоизации компонентов

| Компонент               | Файл                                                               | Проблема                                                      |
| ----------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `PropertyOpenCard`      | `entities/chat/ui/property-open-card/ui.tsx`                       | Рендерится в `.map()` без `React.memo()`                      |
| `PropertyBatchCard`     | `entities/chat/ui/property-batch-card/ui.tsx`                      | То же самое                                                   |
| `PropertyActionButtons` | `features/chat-property-actions/ui/property-action-buttons/ui.tsx` | Создаётся инлайн `<PropertyActionButtons propertyId={...} />` |

**Последствие:** При каждом изменении `isAtBottom`, `unseenIds` или приходе нового сообщения ВСЕ карточки перерендериваются.

---

### 2. Пересоздание объектов на каждом рендере

```tsx
// AIAgentPropertyFeed ui.tsx L86
const viewedSet = new Set(viewedIds); // ❌ Новый Set каждый рендер

// AIAgentPropertyFeed ui.tsx L333
const renderPropertyCard = (property: Property) => ( // ❌ Новая функция каждый рендер
    <PropertyBatchCard ... />
);
```

---

### 3. IntersectionObserver recreates

```tsx
// AIAgentPropertyFeed ui.tsx L282
useEffect(() => {
  // Создаёт новый observer на каждое изменение unseenIds.size
}, [unseenIds.size, realTimeMessages.length]); // ❌
```

---

### 4. Нет виртуализации

При 100+ объектах все DOM-элементы в памяти, что вызывает:

- Медленный initial render
- Высокое потребление памяти
- Лаги при скролле

---

## Рекомендуемые оптимизации

### Приоритет 1: Мемоизация (Быстро, большой эффект)

```tsx
// PropertyOpenCard.tsx
export const PropertyOpenCard = React.memo(function PropertyOpenCard({...}) {
    // ...
});

// PropertyBatchCard.tsx
export const PropertyBatchCard = React.memo(function PropertyBatchCard({...}) {
    // ...
});

// PropertyActionButtons.tsx
export const PropertyActionButtons = React.memo(function PropertyActionButtons({...}) {
    // ...
});
```

### Приоритет 2: useMemo/useCallback (Средне)

```tsx
// AIAgentPropertyFeed.tsx
const viewedSet = useMemo(() => new Set(viewedIds), [viewedIds]);

const renderPropertyCard = useCallback(
  (property: Property) => (
    <PropertyBatchCard
      property={property}
      actions={<PropertyActionButtons propertyId={property.id} />}
    />
  ),
  [],
);
```

### Приоритет 3: TanStack Virtual (Для масштаба)

```bash
pnpm add @tanstack/react-virtual
```

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

// Вместо .map() использовать виртуальный список:
const rowVirtualizer = useVirtualizer({
  count: allMessages.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 400, // Примерная высота карточки
  overscan: 3,
});
```

**Когда применять TanStack Virtual:**

- 50+ объектов в ленте
- Пользователи жалуются на лаги
- Mobile устройства с ограниченной памятью

---

## Приоритетность

| #   | Оптимизация                  | Сложность | Эффект           | Рекомендация                 |
| --- | ---------------------------- | --------- | ---------------- | ---------------------------- |
| 1   | `React.memo()` на карточки   | Низкая    | Высокий          | ✅ Сделать сейчас            |
| 2   | `useCallback` для renderCard | Низкая    | Средний          | ✅ Сделать сейчас            |
| 3   | `useMemo` для viewedSet      | Низкая    | Средний          | ✅ Сделать сейчас            |
| 4   | Throttle scroll handler      | Низкая    | Низкий           | ⏳ Опционально               |
| 5   | TanStack Virtual             | Средняя   | Высокий при 100+ | ⏳ Когда будет 100+ объектов |
| 6   | Lazy load images             | Средняя   | Средний          | ⏳ После Virtual             |

---

## React DevTools анализ

Ключевые метрики для отслеживания:

- **Highlight updates** — покажет какие компоненты перерендериваются
- **Profiler** — записать сессию добавления 10 сообщений
- **Components** → найти `AIAgentPropertyFeed` → проверить "Why did this render?"

Ожидаемый результат после оптимизации:

- Только новые карточки должны рендериться
- Существующие карточки НЕ должны перерендериваться при добавлении новых

---

## Следующие шаги

1. [x] Добавить `React.memo()` на `PropertyOpenCard`, `PropertyBatchCard`, `PropertyActionButtons`
2. [x] Обернуть `renderPropertyCard` в `useCallback`
3. [x] Создать `viewedSet` через `useMemo`
4. [ ] Профилирование с React DevTools до/после
5. [ ] (При необходимости) Внедрить TanStack Virtual
