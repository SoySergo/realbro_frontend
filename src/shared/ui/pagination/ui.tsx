'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface PaginationProps {
    page: number;
    totalPages: number;
    disabled?: boolean;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, disabled, onPageChange }: PaginationProps) {
    const paginationPages = useMemo(() => {
        const pages: (number | 'ellipsis')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push('ellipsis');
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push('ellipsis');
            pages.push(totalPages);
        }
        return pages;
    }, [page, totalPages]);

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-1 px-3 md:px-6 py-4 md:py-6 border-t border-border bg-background">
            {/* Previous */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1 || disabled}
                className="h-9 w-9 p-0"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            {paginationPages.map((p, idx) =>
                p === 'ellipsis' ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-sm text-text-secondary"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        disabled={disabled}
                        className={cn(
                            'w-9 h-9 flex items-center justify-center text-sm rounded-lg transition-colors',
                            p === page
                                ? 'bg-brand-primary text-white font-medium'
                                : 'text-text-secondary hover:bg-background-secondary'
                        )}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages || disabled}
                className="h-9 w-9 p-0"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
