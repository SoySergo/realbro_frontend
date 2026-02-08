'use client';

import { useTranslations } from 'next-intl';
import { Search, Phone, Languages, Building2, Star } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';
import { Checkbox } from '@/shared/ui/checkbox';
import { useAgencyFilters } from '@/features/agency-filters';
import { AVAILABLE_LANGUAGES, AGENCY_PROPERTY_TYPES } from '@/entities/agency';
import type { AgencyPropertyType } from '@/entities/agency';

/**
 * Группа десктоп-фильтров для поиска профессионалов.
 * Встраивается в SearchFiltersBar вместо фильтров недвижимости.
 */
export function ProfessionalFiltersGroup() {
    const t = useTranslations('agency');
    const tLang = useTranslations('languages');
    const { filters, setFilters } = useAgencyFilters();

    const handleQueryChange = (value: string) => {
        setFilters({ query: value || undefined });
    };

    const handlePhoneChange = (value: string) => {
        setFilters({ phone: value || undefined });
    };

    const handleLanguageToggle = (lang: string) => {
        const current = filters.languages || [];
        const next = current.includes(lang)
            ? current.filter((l) => l !== lang)
            : [...current, lang];
        setFilters({ languages: next.length > 0 ? next : undefined });
    };

    const handlePropertyTypeToggle = (type: AgencyPropertyType) => {
        const current = filters.propertyTypes || [];
        const next = current.includes(type)
            ? current.filter((t) => t !== type)
            : [...current, type];
        setFilters({ propertyTypes: next.length > 0 ? next : undefined });
    };

    return (
        <>
            {/* Поиск по названию */}
            <div className="relative min-w-[160px] max-w-[220px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={filters.query || ''}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    className="h-9 text-sm pl-8"
                />
            </div>

            {/* Поиск по телефону — скрыт на < 1440px */}
            <div className="relative w-[160px] hidden 2xl:block">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    value={filters.phone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="h-9 text-sm pl-8"
                />
            </div>

            {/* Фильтр по языкам */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0">
                        <Languages className="w-4 h-4" />
                        <span className="hidden lg:inline">{t('languages')}</span>
                        {filters.languages && filters.languages.length > 0 && (
                            <Badge variant="default" className="ml-0.5 text-xs px-1.5 min-w-5 h-5">
                                {filters.languages.length}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="start">
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

            {/* Фильтр по типам недвижимости — скрыт на < 1024px */}
            <div className="hidden lg:block">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 h-9 shrink-0">
                            <Building2 className="w-4 h-4" />
                            <span>{t('propertyTypes')}</span>
                            {filters.propertyTypes && filters.propertyTypes.length > 0 && (
                                <Badge variant="default" className="ml-0.5 text-xs px-1.5 min-w-5 h-5">
                                    {filters.propertyTypes.length}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="start">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-text-primary mb-3">
                                {t('filterByPropertyType')}
                            </p>
                            {AGENCY_PROPERTY_TYPES.map((type) => (
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
            </div>
        </>
    );
}
