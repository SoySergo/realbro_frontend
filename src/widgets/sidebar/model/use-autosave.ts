'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSidebarStore } from './store';
import { updateSearchQuery } from '@/shared/api/search-queries';

const AUTOSAVE_DELAY = 30_000; // 30 секунд неактивности

/**
 * Хук для автосохранения вкладок поиска.
 * - Автосохранение через 30 секунд неактивности
 * - Ctrl+S / Cmd+S для быстрого сохранения
 * - Предупреждение при закрытии страницы с несохранёнными изменениями
 */
export function useAutosave() {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Сохранение всех несохранённых вкладок
    const saveAllUnsaved = useCallback(async () => {
        const { queries, saveQuery } = useSidebarStore.getState();
        const unsaved = queries.filter((q) => q.isUnsaved);

        for (const query of unsaved) {
            try {
                await updateSearchQuery(query.id, {
                    title: query.title,
                    filters: query.filters,
                    resultsCount: query.resultsCount,
                });
                saveQuery(query.id, query.title);
            } catch (error) {
                console.error('[Autosave] Failed to save query:', query.id, error);
            }
        }

        if (unsaved.length > 0) {
            console.log(`[Autosave] Saved ${unsaved.length} queries`);
        }
    }, []);

    // Сброс таймера автосохранения
    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            saveAllUnsaved();
        }, AUTOSAVE_DELAY);
    }, [saveAllUnsaved]);

    // Подписка на изменения store — сбрасываем таймер при любом изменении queries
    useEffect(() => {
        const unsubscribe = useSidebarStore.subscribe(
            (state, prevState) => {
                // Сбрасываем таймер только если изменились queries
                if (state.queries !== prevState.queries) {
                    resetTimer();
                }
            }
        );

        return () => {
            unsubscribe();
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [resetTimer]);

    // Ctrl+S / Cmd+S
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveAllUnsaved();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [saveAllUnsaved]);

    // beforeunload предупреждение
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const { queries } = useSidebarStore.getState();
            const hasUnsaved = queries.some((q) => q.isUnsaved);

            if (hasUnsaved) {
                e.preventDefault();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
}
