'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchLocations } from '@/services/mapbox-geocoding';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import type { MapboxLocation } from '@/types/map';

type IsochroneAddressSearchProps = {
    /** Колбэк при выборе локации */
    onLocationSelect: (coordinates: [number, number], name: string) => void;
    /** Текущие координаты (если уже выбрана точка) */
    selectedCoordinates?: [number, number] | null;
    /** Название выбранной точки */
    selectedName?: string;
    /** Очистить выбранную локацию */
    onClear?: () => void;
};

/**
 * Компонент поиска адреса для изохронов
 * Использует Mapbox Geocoding API для автокомплита
 */
export function IsochroneAddressSearch({
    onLocationSelect,
    selectedCoordinates,
    selectedName,
    onClear,
}: IsochroneAddressSearchProps) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MapboxLocation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Дебаунс для поиска
    const debouncedQuery = useDebounce(query, 300);

    // Поиск локаций при изменении запроса
    useEffect(() => {
        async function performSearch() {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                console.log('Searching for:', debouncedQuery);
                const locations = await searchLocations({
                    query: debouncedQuery,
                    language: 'en',
                    limit: 8,
                });
                setResults(locations);
                setIsOpen(locations.length > 0);
                setHighlightedIndex(-1);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }

        performSearch();
    }, [debouncedQuery]);

    // Закрытие при клике вне компонента
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Обработчик выбора локации
    const handleSelectLocation = (location: MapboxLocation) => {
        onLocationSelect(location.coordinates, location.name);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    // Обработчик очистки
    const handleClear = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        onClear?.();
    };

    // Обработчик клавиш (навигация по результатам)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < results.length) {
                    handleSelectLocation(results[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
        }
    };

    // Если есть выбранная точка, показываем её
    if (selectedCoordinates && selectedName) {
        return (
            <div className="flex items-center gap-2 p-3 bg-brand-primary/10 border border-brand-primary rounded-lg">
                <MapPin className="h-4 w-4 text-brand-primary shrink-0" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                        {selectedName}
                    </p>
                    <p className="text-xs text-text-tertiary font-mono">
                        {selectedCoordinates[1].toFixed(4)}, {selectedCoordinates[0].toFixed(4)}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="shrink-0 h-8 w-8 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative">
            {/* Инпут поиска */}
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
                <Input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for address or place..."
                    className="pl-9 pr-9"
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary animate-spin" />
                )}
            </div>

            {/* Выпадающий список результатов */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {results.map((location, index) => (
                        <button
                            key={location.id}
                            onClick={() => handleSelectLocation(location)}
                            className={cn(
                                'w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-background-secondary transition-colors',
                                highlightedIndex === index && 'bg-background-secondary',
                                index !== results.length - 1 && 'border-b border-border'
                            )}
                        >
                            <MapPin className="h-4 w-4 text-text-tertiary mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {location.name}
                                </p>
                                <p className="text-xs text-text-tertiary truncate">
                                    {location.context}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
