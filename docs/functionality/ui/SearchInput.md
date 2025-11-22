# SearchInput Component

**Что делает**: UI компонент инпута поиска с лоадером и кнопкой очистки. Лоадер заменяет иконку поиска при загрузке.

**Ключевые особенности**:
- Пропсы:
  - `value: string` - значение инпута
  - `onChange: (value: string) => void` - обработчик изменения
  - `onClear?: () => void` - обработчик очистки
  - `isLoading?: boolean` - состояние загрузки (показывает спиннер вместо иконки поиска)
  - `showClearButton?: boolean` - показывать кнопку очистки (по умолчанию true)
  - `placeholder?: string` - плейсхолдер
  - `containerClassName?: string` - дополнительные классы контейнера
- Стилизация: через дизайн-систему проекта (CSS переменные)
- Иконки: Search (обычное состояние), Loader2 (загрузка), X (очистка)

**Использование**:
```tsx
<SearchInput
  value={query}
  onChange={setQuery}
  onClear={() => setQuery('')}
  isLoading={isSearching}
  placeholder={t('searchPlaceholder')}
/>
```

**Файл**: `src/components/ui/search-input.tsx`
