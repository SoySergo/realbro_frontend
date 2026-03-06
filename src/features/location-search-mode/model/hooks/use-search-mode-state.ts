import { useState, useCallback } from 'react';
import type { LocationItem } from '@/entities/location';
import type { LocationFilterMode } from '@/features/location-filter/model/types';

// === Персистенция в localStorage ===
const STORAGE_KEY_PREFIX = 'location-mode-data-';

function getStorageKey(mode: string): string {
    return `${STORAGE_KEY_PREFIX}${mode}`;
}

function loadFromStorage(mode: string): LocationItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(getStorageKey(mode));
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveToStorage(mode: string, items: LocationItem[]): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(getStorageKey(mode), JSON.stringify(items));
    } catch {
        // storage full — ignore
    }
}

/** Очистить все данные локаций из localStorage */
export function clearAllLocationStorage(): void {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage).filter(k => k.startsWith(STORAGE_KEY_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
}

/**
 * React state для режима поиска локаций с персистенцией в localStorage
 * Управляет списком выбранных локаций до применения фильтра
 * @param mode — режим локации (search, draw, isochrone, radius)
 */
export function useSearchModeState(mode: LocationFilterMode = 'search') {
    const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>(
        () => loadFromStorage(mode)
    );

    // Добавить локацию
    const addLocation = useCallback((location: LocationItem) => {
        setSelectedLocations(prev => {
            // Проверяем дубликат по wikidata
            if (location.wikidata && prev.some(loc => loc.wikidata === location.wikidata)) {
                console.log('Location already selected:', location.wikidata);
                return prev;
            }
            console.log('Location added:', location.wikidata, location.name);
            const next = [...prev, location];
            saveToStorage(mode, next);
            return next;
        });
    }, [mode]);

    // Удалить локацию по wikidata
    const removeLocation = useCallback((wikidata: string) => {
        setSelectedLocations(prev => {
            const filtered = prev.filter(loc => loc.wikidata !== wikidata);
            console.log('Location removed:', wikidata);
            saveToStorage(mode, filtered);
            return filtered;
        });
    }, [mode]);

    // Toggle локацию (добавить если нет, удалить если есть)
    const toggleLocation = useCallback((location: LocationItem) => {
        setSelectedLocations(prev => {
            if (!location.wikidata) {
                console.warn('Location without wikidata cannot be toggled');
                return prev;
            }

            const existingIndex = prev.findIndex(loc => loc.wikidata === location.wikidata);

            let next: LocationItem[];
            if (existingIndex >= 0) {
                // Удаляем
                next = prev.filter((_, idx) => idx !== existingIndex);
                console.log('Location toggled OFF:', location.wikidata, location.name);
            } else {
                // Добавляем
                next = [...prev, location];
                console.log('Location toggled ON:', location.wikidata, location.name);
            }
            saveToStorage(mode, next);
            return next;
        });
    }, [mode]);

    // Очистить все локации
    const clearLocations = useCallback(() => {
        setSelectedLocations([]);
        saveToStorage(mode, []);
        console.log('All locations cleared');
    }, [mode]);

    return {
        selectedLocations,
        addLocation,
        removeLocation,
        toggleLocation,
        clearLocations,
    };
}
