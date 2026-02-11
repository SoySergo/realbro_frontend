'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru, enUS, es, ca, uk, fr, it, pt, de } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

const dateLocales: Record<string, Locale> = {
    ru,
    en: enUS,
    es,
    ca,
    uk,
    fr,
    it,
    pt,
    de,
};

interface DateRangePickerProps {
    from?: Date;
    to?: Date;
    onSelect?: (from?: Date, to?: Date) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Компонент для выбора диапазона дат
 * Упрощенный вариант с полями ввода дат
 */
export function DateRangePicker({ from, to, onSelect, placeholder, className }: DateRangePickerProps) {
    const t = useTranslations('common');
    const locale = useLocale();
    const dateLocale = dateLocales[locale] || enUS;

    const [isOpen, setIsOpen] = useState(false);
    const [tempFrom, setTempFrom] = useState<string>(from ? format(from, 'yyyy-MM-dd') : '');
    const [tempTo, setTempTo] = useState<string>(to ? format(to, 'yyyy-MM-dd') : '');

    // Синхронизируем локальное состояние с props
    useEffect(() => {
        setTempFrom(from ? format(from, 'yyyy-MM-dd') : '');
        setTempTo(to ? format(to, 'yyyy-MM-dd') : '');
    }, [from, to]);

    const handleApply = () => {
        const fromDate = tempFrom ? new Date(tempFrom) : undefined;
        const toDate = tempTo ? new Date(tempTo) : undefined;
        onSelect?.(fromDate, toDate);
        setIsOpen(false);
    };

    const handleClear = () => {
        setTempFrom('');
        setTempTo('');
        onSelect?.(undefined, undefined);
        setIsOpen(false);
    };

    const formatDateRange = () => {
        if (!from && !to) return placeholder || t('selectDate');
        if (from && !to) return format(from, 'd MMM yyyy', { locale: dateLocale });
        if (!from && to) return `– ${format(to, 'd MMM yyyy', { locale: dateLocale })}`;
        if (from && to) {
            return `${format(from, 'd MMM yyyy', { locale: dateLocale })} – ${format(to, 'd MMM yyyy', { locale: dateLocale })}`;
        }
        return placeholder || t('selectDate');
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'justify-start text-left font-normal',
                        !from && !to && 'text-text-tertiary',
                        className
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">
                            {t('from')}
                        </label>
                        <Input
                            type="date"
                            value={tempFrom}
                            onChange={(e) => setTempFrom(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-text-primary">
                            {t('to')}
                        </label>
                        <Input
                            type="date"
                            value={tempTo}
                            onChange={(e) => setTempTo(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                        >
                            <X className="h-4 w-4 mr-1" />
                            {t('clear')}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleApply}
                        >
                            {t('apply')}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
