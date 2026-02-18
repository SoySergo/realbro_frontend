'use client';

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useHeaderSlotStore } from './model';

interface HeaderSlotProps {
    children: ReactNode;
}

/**
 * HeaderSlot — компонент для рендера контента страницы в общий хедер.
 * Использует React Portal для рендера children в слот AppHeader.
 *
 * Пример использования на странице:
 * ```tsx
 * <HeaderSlot>
 *   <SearchFiltersBar />
 * </HeaderSlot>
 * ```
 */
export function HeaderSlot({ children }: HeaderSlotProps) {
    const portalTarget = useHeaderSlotStore((s) => s.portalTarget);

    if (!portalTarget) return null;
    return createPortal(children, portalTarget);
}

/**
 * Хук для программной очистки слота хедера при размонтировании страницы.
 * Используется, если нужен явный контроль жизненного цикла.
 */
export function useHeaderSlotCleanup() {
    const portalTarget = useHeaderSlotStore((s) => s.portalTarget);

    useEffect(() => {
        return () => {
            // При размонтировании очищаем контент слота
            if (portalTarget) {
                portalTarget.innerHTML = '';
            }
        };
    }, [portalTarget]);
}
