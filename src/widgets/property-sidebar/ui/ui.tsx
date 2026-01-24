'use client';

import { useTranslations } from 'next-intl';
import { Map, List, SortAsc, SortDesc, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { usePropertySidebarStore, type PropertySortBy } from '../model';
import { PropertyList } from './property-list';
import { cn } from '@/shared/lib/utils';

type PropertySidebarProps = {
    /** Колбэк при клике на объект */
    onPropertyClick?: (property: { id: string; coordinates: { lat: number; lng: number } }) => void;
    /** CSS классы */
    className?: string;
};

/**
 * Сайдбар для отображения списка объектов недвижимости
 *
 * Структура:
 * - Хедер: Переключатель "Сортировка / Список" + кнопка свернуть
 * - Контент: Список карточек или карта
 * - В режиме списка: кнопка "Смотреть на карте"
 */
export function PropertySidebar({ onPropertyClick, className }: PropertySidebarProps) {
    const t = useTranslations('sidebar');
    const tFilters = useTranslations('filters');

    const {
        view,
        setView,
        isOpen,
        toggle,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
    } = usePropertySidebarStore();

    const sortOptions: { value: PropertySortBy; label: string }[] = [
        { value: 'createdAt', label: 'По дате' },
        { value: 'price', label: tFilters('price') },
        { value: 'area', label: tFilters('area') },
    ];

    const handleSortChange = (value: string) => {
        setSortBy(value as PropertySortBy);
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleShowOnMap = () => {
        setView('map');
    };

    // Свёрнутое состояние
    if (!isOpen) {
        return (
            <div className={cn('w-10 bg-background border-l border-border', className)}>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggle}
                    className="w-full h-12 rounded-none"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn('w-80 bg-background border-l border-border flex flex-col', className)}>
            {/* Хедер */}
            <div className="p-3 border-b border-border bg-background-secondary">
                <div className="flex items-center gap-2">
                    {/* Переключатель вида */}
                    <div className="flex items-center bg-background rounded-lg p-1 border border-border">
                        <button
                            onClick={() => setView('map')}
                            className={cn(
                                'p-1.5 rounded transition-colors',
                                view === 'map'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                            title="Карта"
                        >
                            <Map className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={cn(
                                'p-1.5 rounded transition-colors',
                                view === 'list'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-text-secondary hover:text-text-primary'
                            )}
                            title="Список"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Сортировка (только в режиме списка) */}
                    {view === 'list' && (
                        <>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-[120px] h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sortOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleSortOrder}
                                className="h-8 w-8 p-0"
                            >
                                {sortOrder === 'asc' ? (
                                    <SortAsc className="w-4 h-4" />
                                ) : (
                                    <SortDesc className="w-4 h-4" />
                                )}
                            </Button>
                        </>
                    )}

                    {/* Кнопка свернуть */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggle}
                        className="ml-auto h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Контент */}
            <div className="flex-1 overflow-hidden">
                {view === 'list' ? (
                    <PropertyList
                        onPropertyClick={onPropertyClick}
                        onShowOnMap={handleShowOnMap}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-text-secondary text-sm">
                        <div className="text-center p-4">
                            <Map className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>Карта активна</p>
                            <p className="text-xs mt-1">Нажмите на "Список" для просмотра объектов</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
