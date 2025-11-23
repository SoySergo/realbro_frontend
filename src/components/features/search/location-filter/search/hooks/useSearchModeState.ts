import { useState, useCallback } from 'react';
import type { LocationItem } from '@/types/filter';

/**
 * Простой React state для режима поиска локаций
 * Управляет списком выбранных локаций до применения фильтра
 */
export function useSearchModeState() {
    const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>([]);

    // Добавить локацию
    const addLocation = useCallback((location: LocationItem) => {
        setSelectedLocations(prev => {
            // Проверяем дубликат по wikidata
            if (location.wikidata && prev.some(loc => loc.wikidata === location.wikidata)) {
                console.log('Location already selected:', location.wikidata);
                return prev;
            }
            console.log('Location added:', location.wikidata, location.name);
            return [...prev, location];
        });
    }, []);

    // Удалить локацию по wikidata
    const removeLocation = useCallback((wikidata: string) => {
        setSelectedLocations(prev => {
            const filtered = prev.filter(loc => loc.wikidata !== wikidata);
            console.log('Location removed:', wikidata);
            return filtered;
        });
    }, []);

    // Toggle локацию (добавить если нет, удалить если есть)
    const toggleLocation = useCallback((location: LocationItem) => {
        setSelectedLocations(prev => {
            if (!location.wikidata) {
                console.warn('Location without wikidata cannot be toggled');
                return prev;
            }

            const existingIndex = prev.findIndex(loc => loc.wikidata === location.wikidata);

            if (existingIndex >= 0) {
                // Удаляем
                const filtered = prev.filter((_, idx) => idx !== existingIndex);
                console.log('Location toggled OFF:', location.wikidata, location.name);
                return filtered;
            } else {
                // Добавляем
                console.log('Location toggled ON:', location.wikidata, location.name);
                return [...prev, location];
            }
        });
    }, []);

    // Очистить все локации
    const clearLocations = useCallback(() => {
        setSelectedLocations([]);
        console.log('All locations cleared');
    }, []);

    return {
        selectedLocations,
        addLocation,
        removeLocation,
        toggleLocation,
        clearLocations,
    };
}
