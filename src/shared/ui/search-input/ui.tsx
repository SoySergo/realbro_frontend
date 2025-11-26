import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    /** Значение инпута */
    value: string;
    /** Обработчик изменения значения */
    onChange: (value: string) => void;
    /** Обработчик очистки инпута */
    onClear?: () => void;
    /** Состояние загрузки (показывает лоадер вместо иконки поиска) */
    isLoading?: boolean;
    /** Дополнительные классы для контейнера */
    containerClassName?: string;
    /** Показывать кнопку очистки */
    showClearButton?: boolean;
}

/**
 * Инпут поиска с лоадером и кнопкой очистки
 * Лоадер заменяет иконку поиска при загрузке
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            value,
            onChange,
            onClear,
            isLoading = false,
            containerClassName,
            showClearButton = true,
            className,
            placeholder,
            ...props
        },
        ref
    ) => {
        // Обработчик очистки
        const handleClear = () => {
            onChange('');
            onClear?.();
        };

        return (
            <div className={cn('relative flex-1', containerClassName)}>
                {/* Иконка поиска или лоадер слева */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
                    ) : (
                        <Search className="w-4 h-4 text-text-tertiary" />
                    )}
                </div>

                {/* Инпут */}
                <input
                    ref={ref}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={cn(
                        'w-full h-9 pl-9 text-sm rounded-md transition-colors',
                        'bg-background border border-border',
                        'text-text-primary placeholder:text-text-tertiary',
                        'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent',
                        'hover:border-border-hover',
                        // Добавляем padding справа если есть кнопка очистки
                        showClearButton && value && !isLoading ? 'pr-9' : 'pr-3',
                        className
                    )}
                    {...props}
                />

                {/* Кнопка очистки справа (показывается только если есть текст и не идёт загрузка) */}
                {showClearButton && value && !isLoading && (
                    <button
                        onClick={handleClear}
                        type="button"
                        className={cn(
                            'absolute right-2 top-1/2 -translate-y-1/2',
                            'p-1 rounded-sm transition-colors',
                            'text-text-tertiary hover:text-text-primary hover:bg-background-secondary'
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName = 'SearchInput';
