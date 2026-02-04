'use client';

import { useTranslations } from 'next-intl';
import { Search, Phone, Languages, Building2, Star, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import type { AgencyFilters, AgencyPropertyType, AgencySortType } from '@/entities/agency';

// Доступные языки
const AVAILABLE_LANGUAGES = ['es', 'ca', 'en', 'ru', 'fr', 'de', 'it', 'pt', 'uk', 'zh', 'ar'];

// Типы недвижимости
const PROPERTY_TYPES: AgencyPropertyType[] = [
    'residential',
    'commercial',
    'luxury',
    'newBuilding',
    'secondary',
    'rental',
    'sale',
];

interface AgencyFiltersBarProps {
    filters: AgencyFilters;
    onFiltersChange: (filters: Partial<AgencyFilters>) => void;
    onReset: () => void;
    className?: string;
}

/**
 * Панель фильтров для поиска агентств
 * Включает: поиск по названию, телефону, языки, типы недвижимости, рейтинг
 */
export function AgencyFiltersBar({
    filters,
    onFiltersChange,
    onReset,
    className,
}: AgencyFiltersBarProps) {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');
    const tCommon = useTranslations('common');

    // Обработка изменения поискового запроса
    const handleQueryChange = (value: string) => {
        onFiltersChange({ query: value || undefined });
    };

    // Обработка изменения телефона
    const handlePhoneChange = (value: string) => {
        onFiltersChange({ phone: value || undefined });
    };

    // Обработка изменения языков
    const handleLanguageToggle = (lang: string) => {
        const currentLanguages = filters.languages || [];
        const newLanguages = currentLanguages.includes(lang)
            ? currentLanguages.filter((l) => l !== lang)
            : [...currentLanguages, lang];
        onFiltersChange({ languages: newLanguages.length > 0 ? newLanguages : undefined });
    };

    // Обработка изменения типов недвижимости
    const handlePropertyTypeToggle = (type: AgencyPropertyType) => {
        const currentTypes = filters.propertyTypes || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter((t) => t !== type)
            : [...currentTypes, type];
        onFiltersChange({ propertyTypes: newTypes.length > 0 ? newTypes : undefined });
    };

    // Обработка изменения сортировки
    const handleSortChange = (value: AgencySortType) => {
        onFiltersChange({ sort: value });
    };

    // Подсчёт активных фильтров
    const activeFiltersCount =
        (filters.query ? 1 : 0) +
        (filters.phone ? 1 : 0) +
        (filters.languages?.length || 0) +
        (filters.propertyTypes?.length || 0) +
        (filters.minRating ? 1 : 0) +
        (filters.isVerified ? 1 : 0);

    return (
        <div className={cn('bg-background-secondary border-b border-border', className)}>
            <div className="max-w-6xl mx-auto px-4 py-3">
                {/* Основные фильтры */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Поиск по названию */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <Input
                            type="text"
                            placeholder={t('namePlaceholder')}
                            value={filters.query || ''}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Поиск по телефону */}
                    <div className="relative w-[180px]">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <Input
                            type="tel"
                            placeholder={t('phonePlaceholder')}
                            value={filters.phone || ''}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Фильтр по языкам */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Languages className="w-4 h-4" />
                                {t('languages')}
                                {filters.languages && filters.languages.length > 0 && (
                                    <Badge variant="default" className="ml-1 text-xs">
                                        {filters.languages.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-text-primary mb-3">
                                    {t('filterByLanguage')}
                                </p>
                                {AVAILABLE_LANGUAGES.map((lang) => (
                                    <label
                                        key={lang}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={filters.languages?.includes(lang) || false}
                                            onCheckedChange={() => handleLanguageToggle(lang)}
                                        />
                                        <span className="text-sm text-text-secondary">
                                            {tLang(lang)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Фильтр по типам недвижимости */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Building2 className="w-4 h-4" />
                                {t('propertyTypes')}
                                {filters.propertyTypes && filters.propertyTypes.length > 0 && (
                                    <Badge variant="default" className="ml-1 text-xs">
                                        {filters.propertyTypes.length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-text-primary mb-3">
                                    {t('filterByPropertyType')}
                                </p>
                                {PROPERTY_TYPES.map((type) => (
                                    <label
                                        key={type}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={filters.propertyTypes?.includes(type) || false}
                                            onCheckedChange={() => handlePropertyTypeToggle(type)}
                                        />
                                        <span className="text-sm text-text-secondary">
                                            {t(`propertyTypesLabels.${type}`)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Сортировка */}
                    <Select
                        value={filters.sort || 'rating'}
                        onValueChange={(value) => handleSortChange(value as AgencySortType)}
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder={t('sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rating">{t('sortRating')}</SelectItem>
                            <SelectItem value="reviewsCount">{t('sortReviews')}</SelectItem>
                            <SelectItem value="objectsCount">{t('sortObjects')}</SelectItem>
                            <SelectItem value="name">{t('sortName')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Кнопка сброса */}
                    {activeFiltersCount > 0 && (
                        <Button variant="ghost" onClick={onReset} className="text-text-secondary">
                            {tCommon('reset')}
                        </Button>
                    )}
                </div>

                {/* Активные фильтры (теги) */}
                {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        {/* Языки */}
                        {filters.languages?.map((lang) => (
                            <Badge
                                key={`lang-${lang}`}
                                variant="secondary"
                                className="gap-1 cursor-pointer"
                                onClick={() => handleLanguageToggle(lang)}
                            >
                                {tLang(lang)}
                                <span className="text-text-tertiary">×</span>
                            </Badge>
                        ))}

                        {/* Типы недвижимости */}
                        {filters.propertyTypes?.map((type) => (
                            <Badge
                                key={`type-${type}`}
                                variant="secondary"
                                className="gap-1 cursor-pointer"
                                onClick={() => handlePropertyTypeToggle(type)}
                            >
                                {t(`propertyTypesLabels.${type}`)}
                                <span className="text-text-tertiary">×</span>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
