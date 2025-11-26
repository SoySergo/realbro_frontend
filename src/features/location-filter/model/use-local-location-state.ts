import { useState, useCallback, useMemo } from 'react';
import type {
    LocationFilterMode,
    LocalLocationStates,
    LocalSearchModeState,
    LocalDrawModeState,
    LocalIsochroneModeState,
    LocalRadiusModeState,
} from './types';

// Начальное состояние для каждого режима
const INITIAL_STATES: LocalLocationStates = {
    search: { selectedLocations: [] },
    draw: { polygon: null },
    isochrone: { isochrone: null },
    radius: { radius: null },
};

/**
 * Хук для управления локальным состоянием режимов локации
 * Простой React state для временных изменений до применения фильтра
 * Каждый режим имеет своё независимое состояние
 */
export function useLocalLocationState(currentMode: LocationFilterMode | null) {
    // Простой React state без localStorage
    const [localStates, setLocalStates] = useState<LocalLocationStates>(INITIAL_STATES);

    // Обновить состояние для режима search
    const updateSearchState = useCallback((
        updater: Partial<LocalSearchModeState> | ((prev: LocalSearchModeState) => LocalSearchModeState)
    ) => {
        setLocalStates(prev => {
            const newSearchState = typeof updater === 'function'
                ? updater(prev.search)
                : { ...prev.search, ...updater };

            console.log('[useLocalLocationState] updateSearchState called, prev:', prev.search.selectedLocations.length, 'new:', newSearchState.selectedLocations.length);

            return {
                ...prev,
                search: newSearchState
            };
        });
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

    // Получить текущее состояние активного режима
    const currentLocalState = useMemo(() => {
        if (!currentMode) return null;
        return localStates[currentMode];
    }, [currentMode, localStates]);

    return {
        // Текущее состояние активного режима
        currentLocalState,

        // Апдейтеры для каждого режима
        updateSearchState,
        updateDrawState,
        updateIsochroneState,
        updateRadiusState,
    };
}
