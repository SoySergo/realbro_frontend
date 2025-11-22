# ComboboxInput

**Что делает**: Универсальный компонент инпута с автокомплитом и dropdown меню. Предоставляет поиск с клавиатурной навигацией по результатам.

**Ключевые особенности**:
- **Generic типизация**: Работает с любым типом данных через `<T>`
- **Клавиатурная навигация**: ArrowUp/Down, Tab/Shift+Tab (циклично), Enter, Space, Escape
- **Автопозиционирование**: Автоматически определяет положение dropdown (сверху/снизу) в зависимости от доступного места
- **Автоскролл**: Автоматически прокручивает к выбранному элементу при навигации
- **Интеграция с SearchInput**: Использует существующий UI компонент для инпута

**Основные пропсы**:
- `value`, `onChange` - управление значением поиска
- `results` - массив результатов для отображения
- `renderItem` - функция рендеринга элемента (получает `item` и `isSelected`)
- `getItemKey` - функция получения уникального ключа элемента
- `onSelect` - колбэк выбора элемента
- `showDropdown`, `onShowDropdownChange` - управление видимостью dropdown
- `isLoading` - состояние загрузки
- `dropdownPosition` - позиция dropdown ('auto' | 'top' | 'bottom')

**Пример использования**:
```tsx
<ComboboxInput<MapboxLocation>
    value={searchQuery}
    onChange={setSearchQuery}
    results={searchResults}
    isLoading={isSearching}
    showDropdown={showDropdown}
    onShowDropdownChange={setShowDropdown}
    onSelect={handleSelect}
    renderItem={(location, isSelected) => (
        <div className={isSelected ? 'selected' : ''}>
            {location.name}
        </div>
    )}
    getItemKey={(location) => location.id}
    placeholder="Search locations..."
/>
```

**Файл**: `src/components/ui/combobox-input.tsx`

**Используется в**:
- `LocationSearchMode` - поиск локаций через Mapbox Geocoding API
