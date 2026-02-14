'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Building2, SlidersHorizontal } from 'lucide-react';
import { PropertyCardGrid } from '@/entities/property';
import { PropertyCompareButton, PropertyCompareMenuItem } from '@/features/comparison';
import { Button } from '@/shared/ui/button';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/shared/ui/sheet';
import { cn } from '@/shared/lib/utils';
import type { PropertyGridCard } from '@/entities/property';
import type { AgencyAgent } from '@/entities/agency';

interface AgencyPropertiesSectionProps {
    /** Объекты недвижимости агентства */
    properties: PropertyGridCard[];
    /** Агенты агентства (если есть) */
    agents?: AgencyAgent[];
    /** ID агентства */
    agencyId: string;
    /** Локаль */
    locale: string;
}

interface PropertyFiltersState {
    minPrice?: number;
    maxPrice?: number;
    rooms?: number[];
    agentId?: string;
}

/**
 * Секция с объектами недвижимости агентства
 * Поддерживает фильтрацию по цене, комнатам, агенту
 * Использует PropertyCardGrid для отображения
 */
export function AgencyPropertiesSection({ 
    properties: initialProperties, 
    agents = [],
    agencyId,
    locale,
}: AgencyPropertiesSectionProps) {
    const t = useTranslations('agency');
    const tCommon = useTranslations('common');
    const tProperty = useTranslations('property');
    const router = useRouter();

    const [isPending, startTransition] = useTransition();
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    
    // Локальные фильтры (в будущем будут отправляться на бекенд)
    const [filters, setFilters] = useState<PropertyFiltersState>({});
    
    // Фильтрованные объекты (временно на клиенте, в prod - на бекенде)
    const filteredProperties = initialProperties.filter(property => {
        // Фильтр по минимальной цене
        if (filters.minPrice && property.price < filters.minPrice) {
            return false;
        }
        
        // Фильтр по максимальной цене
        if (filters.maxPrice && property.price > filters.maxPrice) {
            return false;
        }
        
        // Фильтр по количеству комнат
        if (filters.rooms && filters.rooms.length > 0) {
            if (!filters.rooms.includes(property.rooms)) {
                return false;
            }
        }
        
        // Фильтр по агенту
        if (filters.agentId && filters.agentId !== 'all') {
            if (property.author?.id !== filters.agentId) {
                return false;
            }
        }
        
        return true;
    });

    // Обработчик изменения минимальной цены
    const handleMinPriceChange = useCallback((value: string) => {
        const numValue = parseInt(value, 10);
        setFilters(prev => ({
            ...prev,
            minPrice: isNaN(numValue) ? undefined : numValue,
        }));
    }, []);

    // Обработчик изменения максимальной цены
    const handleMaxPriceChange = useCallback((value: string) => {
        const numValue = parseInt(value, 10);
        setFilters(prev => ({
            ...prev,
            maxPrice: isNaN(numValue) ? undefined : numValue,
        }));
    }, []);

    // Обработчик изменения комнат
    const handleRoomsChange = useCallback((value: string) => {
        if (value === 'all') {
            setFilters(prev => ({ ...prev, rooms: undefined }));
        } else {
            const rooms = value.split(',').map(Number).filter(n => !isNaN(n));
            setFilters(prev => ({ ...prev, rooms }));
        }
    }, []);

    // Обработчик изменения агента
    const handleAgentChange = useCallback((value: string) => {
        setFilters(prev => ({
            ...prev,
            agentId: value === 'all' ? undefined : value,
        }));
    }, []);

    // Обработчик клика на карточку
    const handlePropertyClick = useCallback(
        (property: PropertyGridCard) => {
            startTransition(() => {
                router.push(`/${locale}/property/${property.id}`);
            });
        },
        [router, locale]
    );

    // Сброс фильтров
    const handleResetFilters = useCallback(() => {
        setFilters({});
    }, []);

    // Проверка активных фильтров
    const hasActiveFilters = Boolean(
        filters.minPrice || 
        filters.maxPrice || 
        filters.rooms?.length || 
        filters.agentId
    );

    // Пустое состояние
    if (initialProperties.length === 0) {
        return (
            <div className="bg-background border border-border rounded-xl p-8 text-center">
                <Building2 className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <p className="text-text-secondary">{t('noPropertiesFound')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Панель фильтров и управления */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-text-secondary">
                    {t('propertiesCount', { count: filteredProperties.length })} {tProperty('found')}
                </div>

                {/* Мобильная кнопка фильтров */}
                <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <SheetTrigger asChild>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className={cn(
                                'gap-2',
                                hasActiveFilters && 'border-brand-primary text-brand-primary'
                            )}
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            {tCommon('filters')}
                            {hasActiveFilters && (
                                <span className="bg-brand-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    {[
                                        filters.minPrice, 
                                        filters.maxPrice, 
                                        filters.rooms?.length, 
                                        filters.agentId
                                    ].filter(Boolean).length}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                            <SheetTitle>{tCommon('filters')}</SheetTitle>
                            <SheetDescription>
                                {t('filterPropertiesDescription')}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(80vh-180px)]">
                            {/* Фильтр по цене */}
                            <div className="space-y-3">
                                <Label>{tProperty('price')}</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Input
                                            type="number"
                                            placeholder={tProperty('minPrice')}
                                            value={filters.minPrice || ''}
                                            onChange={(e) => handleMinPriceChange(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            type="number"
                                            placeholder={tProperty('maxPrice')}
                                            value={filters.maxPrice || ''}
                                            onChange={(e) => handleMaxPriceChange(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Фильтр по комнатам */}
                            <div className="space-y-3">
                                <Label>{tProperty('rooms')}</Label>
                                <Select
                                    value={filters.rooms?.join(',') || 'all'}
                                    onValueChange={handleRoomsChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={tProperty('selectRooms')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{tCommon('all')}</SelectItem>
                                        <SelectItem value="1">1 {tProperty('room')}</SelectItem>
                                        <SelectItem value="2">2 {tProperty('rooms')}</SelectItem>
                                        <SelectItem value="3">3 {tProperty('rooms')}</SelectItem>
                                        <SelectItem value="4">4 {tProperty('rooms')}</SelectItem>
                                        <SelectItem value="1,2">1-2 {tProperty('rooms')}</SelectItem>
                                        <SelectItem value="2,3">2-3 {tProperty('rooms')}</SelectItem>
                                        <SelectItem value="3,4">3-4 {tProperty('rooms')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Фильтр по агенту */}
                            {agents.length > 0 && (
                                <div className="space-y-3">
                                    <Label>{t('agent')}</Label>
                                    <Select
                                        value={filters.agentId || 'all'}
                                        onValueChange={handleAgentChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectAgent')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('allAgents')}</SelectItem>
                                            {agents.map(agent => (
                                                <SelectItem key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                    {agent.objectsCount && ` (${agent.objectsCount})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Кнопки управления */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-3">
                            <Button 
                                variant="outline" 
                                onClick={handleResetFilters}
                                disabled={!hasActiveFilters}
                                className="flex-1"
                            >
                                {tCommon('reset')}
                            </Button>
                            <Button 
                                onClick={() => setIsFiltersOpen(false)}
                                className="flex-1"
                            >
                                {tCommon('apply')}
                            </Button>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Сетка объектов */}
            <div className={cn(
                'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4',
                isPending && 'opacity-50 pointer-events-none'
            )}>
                {filteredProperties.map((property) => (
                    <PropertyCardGrid
                        key={property.id}
                        property={property}
                        onClick={() => handlePropertyClick(property)}
                        actions={<PropertyCompareButton property={property} />}
                        menuItems={<PropertyCompareMenuItem property={property} />}
                    />
                ))}
            </div>

            {/* Пустое состояние после фильтрации */}
            {filteredProperties.length === 0 && hasActiveFilters && (
                <div className="bg-background border border-border rounded-xl p-8 text-center">
                    <Building2 className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                    <p className="text-text-secondary mb-4">
                        {t('noPropertiesMatchFilters')}
                    </p>
                    <Button 
                        variant="outline" 
                        onClick={handleResetFilters}
                    >
                        {tCommon('resetFilters')}
                    </Button>
                </div>
            )}
        </div>
    );
}
