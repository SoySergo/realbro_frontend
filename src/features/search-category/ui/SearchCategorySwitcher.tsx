'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/shared/config/routing';
import { Building2, Users } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';

export type SearchCategory = 'properties' | 'professionals';

interface SearchCategorySwitcherProps {
    currentCategory: SearchCategory;
    locale: string;
    className?: string;
}

/**
 * Переключатель категории поиска: Недвижимость / Профессионалы
 * Выпадающий список, стиль консистентен с кнопками-фильтрами
 */
export function SearchCategorySwitcher({
    currentCategory,
    locale,
    className,
}: SearchCategorySwitcherProps) {
    const t = useTranslations('searchCategory');
    const router = useRouter();

    const handleCategoryChange = (value: string) => {
        if (!value || value === currentCategory) return;

        if (value === 'properties') {
            router.push('/search/properties/map');
        } else if (value === 'professionals') {
            router.push('/search/agencies/list');
        }
    };

    const CurrentIcon = currentCategory === 'properties' ? Building2 : Users;

    return (
        <Select value={currentCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger
                className={cn(
                    'h-9 w-auto gap-2 text-sm border-border px-3 shrink-0',
                    className
                )}
            >
                <CurrentIcon className="w-4 h-4" />
                <SelectValue>
                    {currentCategory === 'properties'
                        ? t('properties')
                        : t('professionals')}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="properties">
                    <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {t('properties')}
                    </span>
                </SelectItem>
                <SelectItem value="professionals">
                    <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('professionals')}
                    </span>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
