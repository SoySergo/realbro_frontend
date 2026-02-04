'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/shared/config/routing';
import { Building2, Users } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

type SearchCategory = 'properties' | 'professionals';

interface SearchCategorySwitcherProps {
    currentCategory: SearchCategory;
    locale: string;
    className?: string;
}

/**
 * Переключатель категории поиска: Недвижимость / Профессионалы
 * Изменяет URL при переключении
 */
export function SearchCategorySwitcher({
    currentCategory,
    locale,
    className,
}: SearchCategorySwitcherProps) {
    const t = useTranslations('searchCategory');
    const router = useRouter();

    const handleCategoryChange = (value: SearchCategory) => {
        if (!value) return;

        if (value === 'properties') {
            router.push('/search/map');
        } else if (value === 'professionals') {
            router.push('/agencies');
        }
    };

    return (
        <ToggleGroup
            type="single"
            value={currentCategory}
            onValueChange={handleCategoryChange as (value: string) => void}
            className={cn('bg-background-secondary rounded-lg p-1', className)}
        >
            <ToggleGroupItem
                value="properties"
                aria-label={t('properties')}
                className="gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t('properties')}</span>
            </ToggleGroupItem>
            <ToggleGroupItem
                value="professionals"
                aria-label={t('professionals')}
                className="gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">{t('professionals')}</span>
            </ToggleGroupItem>
        </ToggleGroup>
    );
}
