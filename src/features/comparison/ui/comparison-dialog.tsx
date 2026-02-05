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
                    'max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden',
                    className
                )}
            >
                <DialogHeader className="sr-only">
                    <DialogTitle>{t.dialogTitle}</DialogTitle>
                    <DialogDescription>{t.dialogDescription}</DialogDescription>
                </DialogHeader>

                {/* Close button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 rounded-full"
                >
                    <X className="w-5 h-5" />
                    <span className="sr-only">{t.close}</span>
                </Button>

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
