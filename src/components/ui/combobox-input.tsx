import * as React from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { cn } from '@/lib/utils';

/**
 * Универсальный компонент комбобокса с поиском и клавиатурной навигацией
 * Объединяет инпут с автокомплитом и dropdown меню с результатами
 */

export interface ComboboxInputProps<T> {
    /** Значение поискового запроса */
    value: string;
    /** Обработчик изменения запроса */
    onChange: (value: string) => void;
    /** Обработчик очистки инпута */
    onClear?: () => void;
    /** Массив результатов поиска */
    results: T[];
    /** Состояние загрузки */
    isLoading?: boolean;
    /** Видимость dropdown */
    showDropdown: boolean;
    /** Обработчик изменения видимости dropdown */
    onShowDropdownChange: (show: boolean) => void;
    /** Обработчик выбора элемента */
    onSelect: (item: T) => void;
    /** Функция рендеринга элемента результата */
    renderItem: (item: T, isSelected: boolean) => React.ReactNode;
    /** Получение уникального ключа для элемента */
    getItemKey: (item: T) => string | number;
    /** Placeholder для инпута */
    placeholder?: string;
    /** Дополнительные классы для контейнера */
    containerClassName?: string;
    /** Дополнительные классы для dropdown */
    dropdownClassName?: string;
    /** Максимальная высота dropdown */
    maxDropdownHeight?: string;
    /** Позиция dropdown ('auto' | 'top' | 'bottom') */
    dropdownPosition?: 'auto' | 'top' | 'bottom';
}

/**
 * ComboboxInput - универсальный компонент для поиска с автокомплитом
 * 
 * Особенности:
 * - Клавиатурная навигация: ArrowUp/Down, Tab/Shift+Tab (циклично), Enter, Space, Escape
 * - Автоматическое позиционирование dropdown относительно инпута
 * - Generic типизация для работы с любыми данными
 * - Интеграция с SearchInput компонентом
 */
export function ComboboxInput<T>({
    value,
    onChange,
    onClear,
    results,
    isLoading = false,
    showDropdown,
    onShowDropdownChange,
    onSelect,
    renderItem,
    getItemKey,
    placeholder,
    containerClassName,
    dropdownClassName,
    maxDropdownHeight = '300px',
    dropdownPosition = 'auto',
}: ComboboxInputProps<T>) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
    const [dropdownStyles, setDropdownStyles] = React.useState<React.CSSProperties>({});

    // Обновление позиции dropdown
    React.useEffect(() => {
        if (showDropdown && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            let position: 'top' | 'bottom' = 'bottom';

            // Автоматическое определение позиции
            if (dropdownPosition === 'auto') {
                // Если снизу недостаточно места, но сверху больше
                if (spaceBelow < 200 && spaceAbove > spaceBelow) {
                    position = 'top';
                }
            } else {
                position = dropdownPosition === 'top' ? 'top' : 'bottom';
            }

            const styles: React.CSSProperties = {
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
            };

            if (position === 'top') {
                styles.bottom = `${viewportHeight - rect.top - window.scrollY + 4}px`;
            } else {
                styles.top = `${rect.bottom + window.scrollY + 4}px`;
            }

            setDropdownStyles(styles);
        }
    }, [showDropdown, dropdownPosition]);

    // Сброс выбранного индекса при изменении результатов
    React.useEffect(() => {
        setSelectedIndex(-1);
    }, [results]);

    // Автоскролл к выбранному элементу
    React.useEffect(() => {
        if (selectedIndex >= 0 && dropdownRef.current) {
            const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
            if (selectedElement) {
                selectedElement.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedIndex]);

    // Обработчик клавиатурной навигации
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;

            case 'Tab':
                // Tab для циклической навигации
                e.preventDefault();
                if (!e.shiftKey) {
                    // Tab вниз с циклом
                    setSelectedIndex(prev =>
                        prev < results.length - 1 ? prev + 1 : 0
                    );
                } else {
                    // Shift+Tab вверх с циклом
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : results.length - 1
                    );
                }
                break;

            case 'Enter':
            case ' ': // Пробел для выбора
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < results.length) {
                    onSelect(results[selectedIndex]);
                    setSelectedIndex(-1);
                }
                break;

            case 'Escape':
                e.preventDefault();
                onShowDropdownChange(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Обработчик клика на элемент
    const handleItemClick = (item: T) => {
        onSelect(item);
        setSelectedIndex(-1);
    };

    // Обработчик очистки
    const handleClear = () => {
        onClear?.();
        setSelectedIndex(-1);
    };

    // Обработчик фокуса
    const handleFocus = () => {
        if (results.length > 0) {
            onShowDropdownChange(true);
        }
    };

    return (
        <div className={cn('relative', containerClassName)}>
            {/* Инпут поиска */}
            <SearchInput
                ref={inputRef}
                value={value}
                onChange={onChange}
                onClear={handleClear}
                isLoading={isLoading}
                placeholder={placeholder}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
            />

            {/* Dropdown с результатами */}
            {showDropdown && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        'fixed z-50',
                        'bg-background border border-border rounded-md shadow-lg',
                        'overflow-y-auto',
                        dropdownClassName
                    )}
                    style={{
                        ...dropdownStyles,
                        maxHeight: maxDropdownHeight,
                    }}
                >
                    {results.map((item, index) => (
                        <div
                            key={getItemKey(item)}
                            onClick={() => handleItemClick(item)}
                            className={cn(
                                'cursor-pointer transition-colors duration-150',
                                'border-b border-border last:border-b-0'
                            )}
                        >
                            {renderItem(item, selectedIndex === index)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
