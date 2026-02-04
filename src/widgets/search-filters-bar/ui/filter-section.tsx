'use client';

import { ReactNode } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/shared/ui/accordion';

interface FilterSectionProps {
    id: string;
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

/**
 * Компонент секции фильтра с возможностью сворачивания (accordion)
 * Используется как в desktop, так и в mobile версиях
 */
export function FilterSection({ id, title, children, defaultOpen = true }: FilterSectionProps) {
    return (
        <Accordion type="single" collapsible defaultValue={defaultOpen ? id : undefined}>
            <AccordionItem value={id} className="border-b border-border">
                <AccordionTrigger className="text-sm font-medium text-text-primary hover:text-brand-primary">
                    {title}
                </AccordionTrigger>
                <AccordionContent>
                    {children}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
