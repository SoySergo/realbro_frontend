'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useFilterStore } from '@/store/filterStore';
import type { LocationItem } from '@/types/filter';

/**
 * Режим поиска локаций
 * Содержит инпут с автокомплитом и выбранные теги локаций
 */

// Мокированные данные для локаций
const MOCK_LOCATIONS: LocationItem[] = [
    // Франция - страна
    { id: 1, name: 'Франция', type: 'country' },

    // Регионы Франции
    { id: 10, name: 'Иль-де-Франс', type: 'province' },
    { id: 11, name: 'Прованс-Альпы-Лазурный берег', type: 'province' },
    { id: 12, name: 'Овернь-Рона-Альпы', type: 'province' },
    { id: 13, name: 'Новая Аквитания', type: 'province' },
    { id: 14, name: 'Окситания', type: 'province' },

    // Города
    { id: 100, name: 'Париж', type: 'city' },
    { id: 101, name: 'Марсель', type: 'city' },
    { id: 102, name: 'Лион', type: 'city' },
    { id: 103, name: 'Тулуза', type: 'city' },
    { id: 104, name: 'Ницца', type: 'city' },
    { id: 105, name: 'Нант', type: 'city' },
    { id: 106, name: 'Страсбург', type: 'city' },
    { id: 107, name: 'Монпелье', type: 'city' },
    { id: 108, name: 'Бордо', type: 'city' },
    { id: 109, name: 'Лилль', type: 'city' },
    { id: 110, name: 'Канны', type: 'city' },
    { id: 111, name: 'Антиб', type: 'city' },
    { id: 112, name: 'Грас', type: 'city' },

    // Районы Парижа
    { id: 200, name: 'Париж 1-й округ (Лувр)', type: 'district' },
    { id: 201, name: 'Париж 4-й округ (Маре)', type: 'district' },
    { id: 202, name: 'Париж 5-й округ (Латинский квартал)', type: 'district' },
    { id: 203, name: 'Париж 6-й округ (Люксембург)', type: 'district' },
    { id: 204, name: 'Париж 7-й округ (Эйфелева башня)', type: 'district' },
    { id: 205, name: 'Париж 8-й округ (Елисейские поля)', type: 'district' },
    { id: 206, name: 'Париж 16-й округ (Пасси)', type: 'district' },
    { id: 207, name: 'Париж 18-й округ (Монмартр)', type: 'district' },
];

// Имитация API запроса с задержкой
const searchLocations = async (query: string): Promise<LocationItem[]> => {
    // Фейковая задержка 100мс
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return MOCK_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Ограничиваем 10 результатами
};

// Тип-лейбл для типа локации
const getLocationTypeLabel = (type: LocationItem['type']): string => {
    const labels = {
        country: 'Страна',
        province: 'Регион',
        city: 'Город',
        district: 'Район'
    };
    return labels[type];
};

export function LocationSearchMode() {
    const t = useTranslations('filters');
    const { locationFilter, setLocationFilter } = useFilterStore();

    // Локальное состояние для поиска локаций
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>(
        locationFilter?.selectedLocations || []
    );
    const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef<HTMLInputElement>(null);

    // Лимит видимых тегов
    const VISIBLE_TAGS_LIMIT = 3;

    // Обновление позиции dropdown при изменении showDropdown
    useEffect(() => {
        if (showDropdown && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [showDropdown]);

    // Поиск локаций при изменении запроса
    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }

            setIsSearching(true);
            const results = await searchLocations(searchQuery);

            // Фильтруем уже выбранные локации
            const filteredResults = results.filter(
                result => !selectedLocations.find(loc => loc.id === result.id)
            );

            setSearchResults(filteredResults);

            // Показываем dropdown если есть результаты
            if (filteredResults.length > 0) {
                setShowDropdown(true);
            } else {
                setShowDropdown(false);
            }

            setIsSearching(false);
        };

        performSearch();
    }, [searchQuery, selectedLocations]);

    // Удаление выбранной локации
    const handleRemoveLocation = (id: number) => {
        setSelectedLocations(prev => prev.filter(loc => loc.id !== id));
    };

    // Добавление локации
    const handleAddLocation = (location: LocationItem) => {
        if (!selectedLocations.find(loc => loc.id === location.id)) {
            setSelectedLocations(prev => [...prev, location]);
        }
        setSearchQuery('');
        setShowDropdown(false);

        // Возвращаем фокус на инпут
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    // Очистка инпута
    const handleClearInput = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowDropdown(false);
    };

    // Применение фильтра
    const handleApply = () => {
        setLocationFilter({
            mode: 'search',
            selectedLocations: selectedLocations,
        });
    };

    return (
        <>
            <div className="flex items-center gap-2 flex-wrap flex-1">
                <Label className="text-sm text-text-primary">
                    {t('locationSearch')}:
                </Label>

                {/* Инпут поиска с dropdown */}
                <div className="relative flex-1 min-w-[200px] max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => {
                            if (searchResults.length > 0) {
                                setShowDropdown(true);
                            }
                        }}
                        placeholder="Город, район, регион, страна..."
                        className={cn(
                            "w-full h-9 pl-9 pr-20 text-sm rounded-md transition-colors",
                            "bg-background border border-border",
                            "text-text-primary placeholder:text-text-tertiary",
                            "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent",
                            "hover:border-border-hover"
                        )}
                    />

                    {/* Лоадер или кнопка очистки */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {isSearching && (
                            <Loader2 className="w-4 h-4 text-text-tertiary animate-spin" />
                        )}
                        {searchQuery && !isSearching && (
                            <button
                                onClick={handleClearInput}
                                className={cn(
                                    "p-1 rounded-sm transition-colors",
                                    "text-text-tertiary hover:text-text-primary hover:bg-background-secondary"
                                )}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Выбранные локации (теги) */}
                {selectedLocations.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {selectedLocations.slice(0, VISIBLE_TAGS_LIMIT).map((location) => (
                            <div
                                key={location.id}
                                className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                                    "bg-brand-primary-light text-brand-primary",
                                    "dark:bg-brand-primary/20 dark:text-brand-primary",
                                    "text-sm transition-colors"
                                )}
                            >
                                <span className="font-medium">{location.name}</span>
                                <button
                                    onClick={() => handleRemoveLocation(location.id)}
                                    className={cn(
                                        "hover:bg-brand-primary/20 rounded-sm p-0.5 transition-colors",
                                        "dark:hover:bg-brand-primary/30"
                                    )}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Popover с остальными тегами */}
                        {selectedLocations.length > VISIBLE_TAGS_LIMIT && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-md",
                                            "bg-background border border-border dark:border-transparent",
                                            "text-text-secondary hover:text-text-primary",
                                            "hover:bg-background-secondary dark:hover:bg-background-tertiary",
                                            "text-sm transition-colors duration-150 cursor-pointer"
                                        )}
                                    >
                                        <span className="font-medium">
                                            +{selectedLocations.length - VISIBLE_TAGS_LIMIT}
                                        </span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto max-w-md p-3 bg-background border-border"
                                    align="start"
                                >
                                    <div className="flex flex-col gap-2">
                                        {selectedLocations.slice(VISIBLE_TAGS_LIMIT).map((location) => (
                                            <div
                                                key={location.id}
                                                className={cn(
                                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md w-fit",
                                                    "bg-brand-primary-light text-brand-primary",
                                                    "dark:bg-brand-primary/20 dark:text-brand-primary",
                                                    "text-sm transition-colors max-w-[200px]"
                                                )}
                                            >
                                                <span className="font-medium truncate">{location.name}</span>
                                                <button
                                                    onClick={() => handleRemoveLocation(location.id)}
                                                    className={cn(
                                                        "hover:bg-brand-primary/20 rounded-sm p-0.5 transition-colors shrink-0",
                                                        "dark:hover:bg-brand-primary/30"
                                                    )}
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown с результатами поиска - вынесен за пределы flex-контейнера */}
            {showDropdown && searchResults.length > 0 && (
                <div
                    className={cn(
                        "fixed z-50",
                        "bg-background border border-border rounded-md shadow-lg",
                        "max-h-[300px] overflow-y-auto"
                    )}
                    style={{
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        width: `${dropdownPosition.width}px`
                    }}
                >
                    {searchResults.map((location) => (
                        <button
                            key={location.id}
                            onClick={() => handleAddLocation(location)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2.5 cursor-pointer",
                                "text-sm text-text-secondary transition-colors duration-150",
                                "hover:bg-brand-primary-light hover:text-brand-primary",
                                "dark:hover:bg-brand-primary dark:hover:text-white",
                                "border-b border-border last:border-b-0"
                            )}
                        >
                            <span className="font-medium">{location.name}</span>
                            <span className="text-xs text-text-tertiary">
                                {getLocationTypeLabel(location.type)}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Кнопка применить */}
            <Button
                size="sm"
                onClick={handleApply}
                className={cn(
                    "h-8 ml-auto cursor-pointer",
                    "bg-brand-primary hover:bg-brand-primary-hover text-white"
                )}
            >
                {t('apply')}
            </Button>
        </>
    );
}
