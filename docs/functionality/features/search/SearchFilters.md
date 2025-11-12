# Фильтры поиска недвижимости

**Что делает**: Набор компонентов для фильтрации объектов недвижимости с использованием shadcn UI компонентов.

## Основные фильтры

### PriceFilter

**Файл**: `src/components/features/search/filters/PriceFilter.tsx`

**Описание**: Фильтр диапазона цен с двойным слайдером и полями ввода.

**Особенности**:
- Двухсегментная логарифмическая шкала:
  - 0-50% слайдера = 0-500k€ (шаг 10k€)
  - 50-100% слайдера = 500k-5000k€ (шаг 50k€)
- Поля ввода с валидацией
- Debounce 300ms при изменении слайдера
- Форматирование цены через `Intl.NumberFormat`
- Синхронизация с `filterStore`

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- `Slider` - двойной слайдер
- `Label` - подписи к полям

---

### AreaFilter

**Файл**: `src/components/features/search/filters/AreaFilter.tsx`

**Описание**: Фильтр диапазона площади с двойным слайдером и полями ввода.

**Особенности**:
- Диапазон: 0-500 м²
- Шаг слайдера: 5 м²
- Поля ввода с валидацией
- Быстрые пресеты (< 50 м², 50-100 м², 100-200 м², > 200 м²)
- Debounce 300ms при изменении слайдера
- Синхронизация с `filterStore`

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- `Slider` - двойной слайдер
- `Label` - подписи к полям

---

### RoomsFilter

**Файл**: `src/components/features/search/filters/RoomsFilter.tsx`

**Описание**: Мультиселект для выбора количества комнат.

**Особенности**:
- Опции: студия, 1к, 2к, 3к, 4к, 4+
- Множественный выбор
- Иконка галочки для выбранных элементов
- Счётчик выбранных вариантов в кнопке

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- Lucide иконки (`Check`, `ChevronDown`)

---

### CategoryFilter

**Файл**: `src/components/features/search/filters/CategoryFilter.tsx`

**Описание**: Мультиселект для выбора категорий недвижимости.

**Особенности**:
- Категории: Квартира, Дом, Вилла, Студия, Пентхаус, Таунхаус
- Множественный выбор
- Иконка галочки для выбранных элементов
- Счётчик выбранных вариантов в кнопке
- Скролл при большом количестве категорий (max-height: 300px)

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- Lucide иконки (`Check`, `ChevronDown`)

---

### LocationFilter

**Файл**: `src/components/features/search/filters/LocationFilter.tsx`

**Описание**: Фильтр локации с тремя режимами работы.

**Режимы**:
1. **Polygon** - рисование произвольной области на карте
2. **Isochrone** - зона доступности по времени
   - Профили: пешком/велосипед/машина
   - Время: 5, 10, 15, 30, 45, 60 минут
3. **Radius** - радиус от точки
   - Радиусы: 1, 3, 5, 10, 15, 20 км

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- Lucide иконки (`MapPin`, `ChevronDown`)

---

### MarkerTypeFilter

**Файл**: `src/components/features/search/filters/MarkerTypeFilter.tsx`

**Описание**: Фильтр типа маркеров на карте.

**Опции**:
- Все объекты
- Не видел
- Не разобранные
- Понравились
- Не понравились

**Компоненты shadcn**:
- `Button` - кнопка фильтра
- Lucide иконки (`ChevronDown`)

---

## Общие паттерны

### Структура выпадающего меню
```tsx
{isOpen && (
  <>
    {/* Оверлей для закрытия */}
    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
    
    {/* Меню */}
    <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-md shadow-lg z-20 ...">
      {/* Контент */}
    </div>
  </>
)}
```

### Активное состояние кнопки
```tsx
<Button
  variant="outline"
  className={cn(
    'whitespace-nowrap',
    isActive && 'bg-brand-primary-light text-brand-primary'
  )}
>
```

### Debounce для слайдеров
```tsx
const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

const handleSliderChange = (newValue: number[]) => {
  setIsDragging(true);
  setLocalValue(newValue);
  
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }
  
  debounceTimerRef.current = setTimeout(() => {
    setFilters({ ... });
  }, 300);
};
```

---

## Локализация

Все текстовые элементы используют локализацию через `next-intl`:

```tsx
const t = useTranslations('filters');
```

**Ключи локализации** (в `messages/*.json`):
- `price`, `priceRange`, `minPrice`, `maxPrice`
- `area`, `areaRange`, `minArea`, `maxArea`
- `rooms`, `studio`, `room1`, `room2`, `room3`, `room4`, `room5plus`
- `category`, `markerType`, `location`
- `quickSelect`, `presets`, `reset`, `apply`

---

## Синхронизация с Store

Все фильтры используют Zustand стор `filterStore`:

```tsx
const { currentFilters, setFilters } = useFilterStore();

// Применение фильтра
setFilters({ minPrice: 100000, maxPrice: 500000 });

// Сброс фильтра
setFilters({ minPrice: undefined, maxPrice: undefined });
```

---

## Компоненты shadcn

### Использованные компоненты
- `Button` - кнопки и триггеры фильтров
- `Slider` - двойные слайдеры для диапазонов
- `Label` - подписи к полям ввода

### Установка зависимостей
```bash
pnpm add @radix-ui/react-slider @radix-ui/react-label class-variance-authority
```
