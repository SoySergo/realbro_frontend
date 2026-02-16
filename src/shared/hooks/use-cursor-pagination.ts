'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CursorPaginatedResponse } from '@/shared/api/types';

/**
 * Состояние cursor-пагинации
 */
interface CursorPaginationState<T> {
    /** Загруженные элементы */
    items: T[];
    /** Текущий cursor для следующей загрузки */
    cursor: string | null;
    /** Есть ли ещё данные */
    has_more: boolean;
    /** Идёт загрузка */
    is_loading: boolean;
    /** Общее количество элементов */
    total: number;
    /** Ошибка загрузки */
    error: Error | null;
}

/**
 * Параметры хука cursor-пагинации
 */
interface UseCursorPaginationOptions<T> {
    /** Функция-загрузчик данных (принимает cursor, возвращает CursorPaginatedResponse) */
    fetcher: (cursor?: string) => Promise<CursorPaginatedResponse<T>>;
    /** Начальные данные (для SSR — первая страница приходит с сервера) */
    initialData?: CursorPaginatedResponse<T>;
    /** Включить автоподгрузку при скролле через IntersectionObserver */
    autoLoad?: boolean;
}

/**
 * Хук cursor-based пагинации с поддержкой SSR и IntersectionObserver
 *
 * - Хранит items, cursor, has_more, is_loading, total
 * - loadMore() — подгружает следующую порцию
 * - reset() — сброс (при смене фильтров)
 * - setInitialData() — для SSR (первая страница приходит с сервера)
 * - sentinelRef — ref для IntersectionObserver (автоподгрузка при скролле)
 */
export function useCursorPagination<T>(options: UseCursorPaginationOptions<T>) {
    const { fetcher, initialData, autoLoad = false } = options;

    const [state, setState] = useState<CursorPaginationState<T>>(() => ({
        items: initialData?.data ?? [],
        cursor: initialData?.pagination.next_cursor ?? null,
        has_more: initialData?.pagination.has_more ?? true,
        is_loading: false,
        total: initialData?.pagination.total ?? 0,
        error: null,
    }));

    // Ref для предотвращения дублирования запросов
    const loadingRef = useRef(false);
    // Ref для IntersectionObserver sentinel элемента
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    // Ref для текущего fetcher (чтобы избежать stale closure)
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    /**
     * Загрузить следующую порцию данных
     */
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !state.has_more) return;

        loadingRef.current = true;
        setState(prev => ({ ...prev, is_loading: true, error: null }));

        try {
            const response = await fetcherRef.current(state.cursor ?? undefined);
            setState(prev => ({
                items: [...prev.items, ...response.data],
                cursor: response.pagination.next_cursor ?? null,
                has_more: response.pagination.has_more,
                is_loading: false,
                total: response.pagination.total,
                error: null,
            }));
        } catch (err) {
            // Игнорируем ошибки отмены (AbortError)
            if (err instanceof Error && err.name === 'AbortError') {
                setState(prev => ({ ...prev, is_loading: false }));
                return;
            }
            setState(prev => ({
                ...prev,
                is_loading: false,
                error: err instanceof Error ? err : new Error('Failed to load data'),
            }));
        } finally {
            loadingRef.current = false;
        }
    }, [state.cursor, state.has_more]);

    /**
     * Сброс пагинации (при смене фильтров)
     */
    const reset = useCallback(() => {
        loadingRef.current = false;
        setState({
            items: [],
            cursor: null,
            has_more: true,
            is_loading: false,
            total: 0,
            error: null,
        });
    }, []);

    /**
     * Установить начальные данные (для SSR)
     */
    const setInitialData = useCallback((data: CursorPaginatedResponse<T>) => {
        loadingRef.current = false;
        setState({
            items: data.data,
            cursor: data.pagination.next_cursor ?? null,
            has_more: data.pagination.has_more,
            is_loading: false,
            total: data.pagination.total,
            error: null,
        });
    }, []);

    /**
     * IntersectionObserver для автоподгрузки при скролле
     */
    useEffect(() => {
        if (!autoLoad) return;

        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && !loadingRef.current && state.has_more) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [autoLoad, loadMore, state.has_more]);

    return {
        ...state,
        loadMore,
        reset,
        setInitialData,
        sentinelRef,
    };
}
