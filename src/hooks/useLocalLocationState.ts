import { useState, useEffect, useCallback, useRef } from 'react';
import type {
    LocationFilterMode,
    LocalLocationStates,
    LocalSearchModeState,
    LocalDrawModeState,
    LocalIsochroneModeState,
    LocalRadiusModeState,
} from '@/types/filter';

const STORAGE_KEY = 'local-location-states';

// Начальное состояние для каждого режима
const INITIAL_STATES: LocalLocationStates = {
    search: { selectedLocations: [] },
    draw: { polygon: null },
    isochrone: { isochrone: null },
    radius: { radius: null },
};

/**
 * Хук для управления локальным состоянием режимов локации
 * Сохраняет состояние каждого режима в localStorage
 * Позволяет переключаться между режимами с сохранением состояния
 */
export function useLocalLocationState(currentMode: LocationFilterMode | null) {
    // Инициализация из localStorage
    const [localStates, setLocalStates] = useState<LocalLocationStates>(() => {
        if (typeof window === 'undefined') return INITIAL_STATES;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);

                // Валидация структуры
                if (typeof parsed !== 'object' || !parsed.search || !parsed.draw) {
                    console.warn('[LOCAL] Invalid local location states, using defaults');
                    return INITIAL_STATES;
                }

                return parsed;
            }
        } catch (error) {
            console.error('[LOCAL] Failed to load local location states:', error);
        }

        return INITIAL_STATES;
    });

    // Отслеживание предыдущего режима для автосохранения
    const previousModeRef = useRef<LocationFilterMode | null>(null);

    // Отслеживание смены режима для автосохранения
    useEffect(() => {
        if (previousModeRef.current && previousModeRef.current !== currentMode) {
            console.log(
                '[LOCAL] Mode changed from',
                previousModeRef.current,
                'to',
                currentMode,
                '- autosave triggered'
            );
        }
        previousModeRef.current = currentMode;
    }, [currentMode]);

    // Сохранение в localStorage при изменении
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localStates));
        } catch (error) {
            console.error('[LOCAL] Failed to save local location states:', error);

            // Проверяем, не превышена ли квота
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('[LOCAL] localStorage quota exceeded - consider clearing old data');
            }
        }
    }, [localStates]);

    // Получить состояние конкретного режима
    const getLocalState = useCallback(<T extends LocationFilterMode>(
        mode: T
    ): LocalLocationStates[T] => {
        return localStates[mode];
    }, [localStates]);

    // Обновить состояние для режима search
    const updateSearchState = useCallback((
        updater: Partial<LocalSearchModeState> | ((prev: LocalSearchModeState) => LocalSearchModeState)
    ) => {
        setLocalStates(prev => ({
            ...prev,
            search: typeof updater === 'function'
                ? updater(prev.search)
                : { ...prev.search, ...updater }
        }));
    }, []);

    // Обновить состояние для режима draw
    const updateDrawState = useCallback((
        updater: Partial<LocalDrawModeState> | ((prev: LocalDrawModeState) => LocalDrawModeState)
    ) => {
        setLocalStates(prev => ({
            ...prev,
            draw: typeof updater === 'function'
                ? updater(prev.draw)
                : { ...prev.draw, ...updater }
        }));
    }, []);

    // Обновить состояние для режима isochrone
    const updateIsochroneState = useCallback((
        updater: Partial<LocalIsochroneModeState> | ((prev: LocalIsochroneModeState) => LocalIsochroneModeState)
    ) => {
        setLocalStates(prev => ({
            ...prev,
            isochrone: typeof updater === 'function'
                ? updater(prev.isochrone)
                : { ...prev.isochrone, ...updater }
        }));
    }, []);

    // Обновить состояние для режима radius
    const updateRadiusState = useCallback((
        updater: Partial<LocalRadiusModeState> | ((prev: LocalRadiusModeState) => LocalRadiusModeState)
    ) => {
        setLocalStates(prev => ({
            ...prev,
            radius: typeof updater === 'function'
                ? updater(prev.radius)
                : { ...prev.radius, ...updater }
        }));
    }, []);

    // Очистить состояние конкретного режима
    const clearLocalState = useCallback((mode: LocationFilterMode) => {
        setLocalStates(prev => ({
            ...prev,
            [mode]: INITIAL_STATES[mode]
        }));
        console.log('Cleared local state for mode:', mode);
    }, []);

    // Очистить все локальные состояния
    const clearAllLocalStates = useCallback(() => {
        setLocalStates(INITIAL_STATES);
        console.log('Cleared all local location states');
    }, []);

    // Полная форс-очистка localStorage и состояния
    const forceCleanLocalStorage = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setLocalStates(INITIAL_STATES);
            console.log('[LOCAL] Force cleaned localStorage');
        } catch (error) {
            console.error('[LOCAL] Failed to force clean localStorage:', error);
        }
    }, []);

    // Получить текущее состояние активного режима
    const currentLocalState = currentMode ? localStates[currentMode] : null;

    // Проверка наличия данных в конкретном режиме
    const hasDataInMode = useCallback((mode: LocationFilterMode): boolean => {
        const state = localStates[mode];

        switch (mode) {
            case 'search':
                return (state as LocalSearchModeState).selectedLocations.length > 0;
            case 'draw':
                return (state as LocalDrawModeState).polygon !== null;
            case 'isochrone':
                return (state as LocalIsochroneModeState).isochrone !== null;
            case 'radius':
                return (state as LocalRadiusModeState).radius !== null;
            default:
                return false;
        }
    }, [localStates]);

    // Получить список режимов с данными (кроме текущего)
    const getModesWithData = useCallback((excludeMode?: LocationFilterMode): LocationFilterMode[] => {
        const modes: LocationFilterMode[] = ['search', 'draw', 'isochrone', 'radius'];
        return modes.filter(mode => {
            if (excludeMode && mode === excludeMode) return false;
            return hasDataInMode(mode);
        });
    }, [hasDataInMode]);

    // Загрузить данные из глобального фильтра в локальный стейт режима
    const loadFromGlobalFilter = useCallback((
        mode: LocationFilterMode,
        locationFilter: import('@/types/filter').LocationFilter | null
    ) => {
        if (!locationFilter || locationFilter.mode !== mode) {
            // Если нет фильтра или режим не совпадает - ничего не делаем
            return;
        }

        // Загружаем данные в зависимости от режима
        switch (mode) {
            case 'search':
                if (locationFilter.selectedLocations) {
                    setLocalStates(prev => ({
                        ...prev,
                        search: { selectedLocations: locationFilter.selectedLocations || [] }
                    }));
                    console.log('Loaded search locations from global filter:', locationFilter.selectedLocations.length);
                }
                break;

            case 'draw':
                if (locationFilter.polygon) {
                    setLocalStates(prev => ({
                        ...prev,
                        draw: { polygon: locationFilter.polygon || null }
                    }));
                    console.log('Loaded polygon from global filter');
                }
                break;

            case 'isochrone':
                if (locationFilter.isochrone) {
                    setLocalStates(prev => ({
                        ...prev,
                        isochrone: { isochrone: locationFilter.isochrone || null }
                    }));
                    console.log('Loaded isochrone from global filter');
                }
                break;

            case 'radius':
                if (locationFilter.radius) {
                    setLocalStates(prev => ({
                        ...prev,
                        radius: { radius: locationFilter.radius || null }
                    }));
                    console.log('Loaded radius from global filter');
                }
                break;
        }
    }, []);

    return {
        // Текущее состояние активного режима
        currentLocalState,

        // Все локальные состояния
        localStates,

        // Геттер для конкретного режима
        getLocalState,

        // Апдейтеры для каждого режима
        updateSearchState,
        updateDrawState,
        updateIsochroneState,
        updateRadiusState,

        // Очистка
        clearLocalState,
        clearAllLocalStates,
        forceCleanLocalStorage,

        // Проверка данных
        hasDataInMode,
        getModesWithData,

        // Загрузка из глобального фильтра
        loadFromGlobalFilter,
    };
}
