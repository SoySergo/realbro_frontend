'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FloatingComparisonBar } from '@/features/comparison';

/**
 * ComparisonBarProvider - Глобальный провайдер для FloatingComparisonBar
 * 
 * Показывает плавающую панель сравнения на всех страницах, кроме /compare
 */
export function ComparisonBarProvider() {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('comparison');

    // Не показываем панель на странице сравнения
    const isComparePage = pathname?.includes('/compare');
    if (isComparePage) {
        return null;
    }

    const translations = {
        compare: t('compare'),
        clearAll: t('clearAll'),
        selected: t('selected'),
        outOf: t('outOf'),
        openComparison: t('openComparison'),
    };

    // Получаем текущую локаль из pathname
    const locale = pathname?.split('/')[1] || 'ru';

    const handleOpenComparison = () => {
        router.push(`/${locale}/compare`);
    };

    return (
        <FloatingComparisonBar
            translations={translations}
            onOpenComparison={handleOpenComparison}
        />
    );
}
