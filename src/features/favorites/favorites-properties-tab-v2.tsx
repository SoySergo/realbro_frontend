'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, Filter as FilterIcon, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { PropertyCardGrid } from '@/entities/property/ui';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import type { FavoriteProperty, FavoritesPropertiesFilters } from '@/entities/favorites/model/types';
import { Link } from '@/shared/config/routing';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { DateRangePicker } from '@/shared/ui/date-range-picker';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils';

interface FavoritesPropertiesTabProps {
    properties: FavoriteProperty[];
    isEmpty: boolean;
}

/**
 * Улучшенный таб избранных объектов с фильтрацией и grid-отображением
 */
export function FavoritesPropertiesTabV2({ properties, isEmpty }: FavoritesPropertiesTabProps) {
    const t = useTranslations('favorites');
    const tProperty = useTranslations('property');
    const tFilters = useTranslations('filters');

    // Состояние фильтров
    const [filters, setFilters] = useState<FavoritesPropertiesFilters>({
        markType: 'all',
        sortBy: 'addedAt',
        sortOrder: 'desc',
    });

    // Применение фильтров
    const filteredProperties = useMemo(() => {
        let result = [...properties];

        // Фильтр по типу отметки
        if (filters.markType && filters.markType !== 'all') {
            result = result.filter((item) => item.markType === filters.markType);
        }

        // Фильтр по дате добавления
        if (filters.dateFrom) {
            result = result.filter((item) => new Date(item.addedAt) >= filters.dateFrom!);
        }
        if (filters.dateTo) {
            result = result.filter((item) => new Date(item.addedAt) <= filters.dateTo!);
        }

        // Фильтр по цене
        if (filters.minPrice !== undefined) {
            result = result.filter((item) => item.property.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
            result = result.filter((item) => item.property.price <= filters.maxPrice!);
        }

        // Фильтр по комнатам
        if (filters.rooms && filters.rooms.length > 0) {
            result = result.filter((item) => {
                const rooms = item.property.rooms || 0;
                return filters.rooms!.includes(rooms);
            });
        }

        // Фильтр по площади
        if (filters.minArea !== undefined) {
            result = result.filter((item) => item.property.area >= filters.minArea!);
        }
        if (filters.maxArea !== undefined) {
            result = result.filter((item) => item.property.area <= filters.maxArea!);
        }

        // Сортировка
        result.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case 'addedAt':
                    comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
                    break;
                case 'price':
                    comparison = a.property.price - b.property.price;
                    break;
                case 'area':
                    comparison = a.property.area - b.property.area;
                    break;
                case 'updatedAt':
                    comparison =
                        new Date(a.property.updatedAt).getTime() -
                        new Date(b.property.updatedAt).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return filters.sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [properties, filters]);

    // Проверка активных фильтров
    const hasActiveFilters = useMemo(() => {
        return (
            (filters.markType && filters.markType !== 'all') ||
            filters.dateFrom ||
            filters.dateTo ||
            filters.minPrice !== undefined ||
            filters.maxPrice !== undefined ||
            (filters.rooms && filters.rooms.length > 0) ||
            filters.minArea !== undefined ||
            filters.maxArea !== undefined
        );
    }, [filters]);

    const handleClearFilters = () => {
        setFilters({
            markType: 'all',
            sortBy: 'addedAt',
            sortOrder: 'desc',
        });
    };

    const handleRoomToggle = (roomCount: number) => {
        const currentRooms = filters.rooms || [];
        const newRooms = currentRooms.includes(roomCount)
            ? currentRooms.filter((r) => r !== roomCount)
            : [...currentRooms, roomCount];
        setFilters({ ...filters, rooms: newRooms });
    };

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-text-secondary" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary mb-2">{t('empty.title')}</h2>
                <p className="text-text-secondary max-w-sm">{t('empty.description')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Панель фильтров и сортировки */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                {/* Левая часть: быстрые фильтры */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Фильтр по типу отметки */}
                    <ToggleGroup
                        type="single"
                        value={filters.markType || 'all'}
                        onValueChange={(value) =>
                            value && setFilters({ ...filters, markType: value as any })
                        }
                        className="border border-border rounded-lg p-1"
                    >
                        <ToggleGroupItem value="all" size="sm" className="text-xs">
                            {t('filters.all')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="like" size="sm" className="text-xs">
                            {t('filters.liked')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="dislike" size="sm" className="text-xs">
                            {t('filters.disliked')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value="unsorted" size="sm" className="text-xs">
                            {t('filters.unsorted')}
                        </ToggleGroupItem>
                    </ToggleGroup>

                    {/* Выбор даты */}
                    <DateRangePicker
                        from={filters.dateFrom}
                        to={filters.dateTo}
                        onSelect={(from, to) => setFilters({ ...filters, dateFrom: from, dateTo: to })}
                        placeholder={t('filters.selectDateRange')}
                        className="h-9 text-xs"
                    />

                    {/* Расширенные фильтры (мобильный sheet) */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('filters.advanced')}</span>
                                {hasActiveFilters && (
                                    <span className="flex h-2 w-2 rounded-full bg-brand-primary" />
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>{t('filters.advancedFilters')}</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-6">
                                {/* Цена */}
                                <div className="space-y-3">
                                    <Label>{tFilters('price')}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder={tFilters('min')}
                                            value={filters.minPrice || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    minPrice: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                        <Input
                                            type="number"
                                            placeholder={tFilters('max')}
                                            value={filters.maxPrice || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    maxPrice: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Комнаты */}
                                <div className="space-y-3">
                                    <Label>{tFilters('rooms')}</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {[1, 2, 3, 4, 5].map((room) => (
                                            <label
                                                key={room}
                                                className="flex items-center gap-2 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={filters.rooms?.includes(room) || false}
                                                    onCheckedChange={() => handleRoomToggle(room)}
                                                />
                                                <span className="text-sm">
                                                    {room}
                                                    {room === 5 ? '+' : ''}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Площадь */}
                                <div className="space-y-3">
                                    <Label>{tFilters('area')}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder={tFilters('min')}
                                            value={filters.minArea || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    minArea: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                        <Input
                                            type="number"
                                            placeholder={tFilters('max')}
                                            value={filters.maxArea || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    maxArea: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                {/* Кнопка очистки */}
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={handleClearFilters}
                                    >
                                        {t('filters.clearAll')}
                                    </Button>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Правая часть: сортировка */}
                <div className="flex items-center gap-2">
                    <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={(value) => {
                            const [sortBy, sortOrder] = value.split('-');
                            setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                        }}
                    >
                        <SelectTrigger className="w-[180px] h-9 text-xs">
                            <ArrowUpDown className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="addedAt-desc">{t('sort.newestFirst')}</SelectItem>
                            <SelectItem value="addedAt-asc">{t('sort.oldestFirst')}</SelectItem>
                            <SelectItem value="price-asc">{t('sort.priceLowToHigh')}</SelectItem>
                            <SelectItem value="price-desc">{t('sort.priceHighToLow')}</SelectItem>
                            <SelectItem value="area-desc">{t('sort.areaLargest')}</SelectItem>
                            <SelectItem value="area-asc">{t('sort.areaSmallest')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Счетчик результатов */}
            <div className="text-sm text-text-secondary">
                {t('filters.showing', { count: filteredProperties.length, total: properties.length })}
            </div>

            {/* Сетка объектов */}
            {filteredProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FilterIcon className="w-12 h-12 text-text-tertiary mb-3" />
                    <p className="text-text-secondary">{t('filters.noResults')}</p>
                    <Button variant="link" onClick={handleClearFilters} className="mt-2">
                        {t('filters.clearAll')}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {filteredProperties.map((favProperty) => (
                        <Link key={favProperty.id} href={`/property/${favProperty.property.id}`}>
                            <PropertyCardGrid
                                property={favProperty.property}
                                actions={<PropertyCompareButton property={favProperty.property} />}
                                menuItems={<PropertyCompareMenuItem property={favProperty.property} />}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
