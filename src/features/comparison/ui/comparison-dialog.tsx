'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { ComparisonPanel, type ComparisonPanelTranslations } from '@/widgets/comparison-panel';
import { useComparisonCount } from '../model';

export interface ComparisonDialogTranslations extends ComparisonPanelTranslations {
    dialogTitle: string;
    dialogDescription: string;
    close: string;
}

interface ComparisonDialogProps {
    translations: ComparisonDialogTranslations;
    locale: string;
    isOpen: boolean;
    onClose: () => void;
    onPropertyClick?: (property: import('@/entities/property').Property) => void;
    onAddMore?: () => void;
    className?: string;
}

/**
 * ComparisonDialog - Модальное окно сравнения объектов
 * 
 * Обертка над ComparisonPanel для показа в виде диалога вместо отдельной страницы.
 */
export function ComparisonDialog({
    translations,
    locale,
    isOpen,
    onClose,
    onPropertyClick,
    onAddMore,
    className,
}: ComparisonDialogProps) {
    const t = translations;
    const count = useComparisonCount();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent 
                className={cn(
                    'max-w-6xl w-full md:w-[95vw] h-[100dvh] md:h-[90vh] max-h-[100dvh] md:max-h-[90vh] p-0 overflow-hidden',
                    'rounded-none md:rounded-lg',
                    className
                )}
            >
                {/* Мобильный хедер для диалога сравнения */}
                <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-background sticky top-0 z-10">
                    <DialogTitle className="text-base font-semibold truncate flex-1">
                        {t.dialogTitle}
                    </DialogTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="shrink-0 rounded-full"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">{t.close}</span>
                    </Button>
                </div>

                {/* Desktop close button */}
                <div className="hidden md:block">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{t.dialogTitle}</DialogTitle>
                        <DialogDescription>{t.dialogDescription}</DialogDescription>
                    </DialogHeader>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-4 top-4 z-10 rounded-full"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">{t.close}</span>
                    </Button>
                </div>

                {/* Comparison Panel */}
                <div className="h-full overflow-auto">
                    <ComparisonPanel
                        translations={t}
                        locale={locale}
                        onBack={onClose}
                        onPropertyClick={(property) => {
                            onPropertyClick?.(property);
                            onClose();
                        }}
                        onAddMore={() => {
                            onAddMore?.();
                            onClose();
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ComparisonDialog;
