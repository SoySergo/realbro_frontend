'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Property } from '@/entities/property';

// Максимальное количество объектов для сравнения
const MAX_COMPARISON_ITEMS = 4;

interface ComparisonStore {
    // ID объектов в сравнении
    comparisonIds: string[];
    // Полные данные объектов (кэш для быстрого доступа)
    comparisonProperties: Record<string, Property>;
    // Флаг показа панели сравнения
    isComparisonPanelOpen: boolean;

    // Добавить объект к сравнению
    addToComparison: (property: Property) => boolean;
    // Удалить объект из сравнения
    removeFromComparison: (propertyId: string) => void;
    // Проверить, находится ли объект в сравнении
    isInComparison: (propertyId: string) => boolean;
    // Переключить состояние объекта в сравнении
    toggleComparison: (property: Property) => boolean;
    // Очистить все объекты из сравнения
    clearComparison: () => void;
    // Открыть/закрыть панель сравнения
    setComparisonPanelOpen: (isOpen: boolean) => void;
    toggleComparisonPanel: () => void;
    // Получить количество объектов в сравнении
    getComparisonCount: () => number;
    // Получить все объекты для сравнения
    getComparisonProperties: () => Property[];
}

export const useComparisonStore = create<ComparisonStore>()(
    persist(
        (set, get) => ({
            comparisonIds: [],
            comparisonProperties: {},
            isComparisonPanelOpen: false,

            addToComparison: (property: Property) => {
                const { comparisonIds, comparisonProperties } = get();

                // Проверяем лимит
                if (comparisonIds.length >= MAX_COMPARISON_ITEMS) {
                    console.log('Comparison limit reached', { max: MAX_COMPARISON_ITEMS });
                    return false;
                }

                // Проверяем, не добавлен ли уже
                if (comparisonIds.includes(property.id)) {
                    console.log('Property already in comparison', { propertyId: property.id });
                    return false;
                }

                set({
                    comparisonIds: [...comparisonIds, property.id],
                    comparisonProperties: {
                        ...comparisonProperties,
                        [property.id]: property,
                    },
                });

                console.log('Property added to comparison', { propertyId: property.id });
                return true;
            },

            removeFromComparison: (propertyId: string) => {
                const { comparisonIds, comparisonProperties } = get();

                const newIds = comparisonIds.filter((id) => id !== propertyId);
                const { [propertyId]: _, ...newProperties } = comparisonProperties;

                set({
                    comparisonIds: newIds,
                    comparisonProperties: newProperties,
                });

                console.log('Property removed from comparison', { propertyId });
            },

            isInComparison: (propertyId: string) => {
                return get().comparisonIds.includes(propertyId);
            },

            toggleComparison: (property: Property) => {
                const { isInComparison, addToComparison, removeFromComparison } = get();

                if (isInComparison(property.id)) {
                    removeFromComparison(property.id);
                    return false;
                } else {
                    return addToComparison(property);
                }
            },

            clearComparison: () => {
                set({
                    comparisonIds: [],
                    comparisonProperties: {},
                });
                console.log('Comparison cleared');
            },

            setComparisonPanelOpen: (isOpen: boolean) => {
                set({ isComparisonPanelOpen: isOpen });
            },

            toggleComparisonPanel: () => {
                set((state) => ({ isComparisonPanelOpen: !state.isComparisonPanelOpen }));
            },

            getComparisonCount: () => {
                return get().comparisonIds.length;
            },

            getComparisonProperties: () => {
                const { comparisonIds, comparisonProperties } = get();
                return comparisonIds
                    .map((id) => comparisonProperties[id])
                    .filter(Boolean) as Property[];
            },
        }),
        {
            name: 'property-comparison-storage',
            partialize: (state) => ({
                comparisonIds: state.comparisonIds,
                comparisonProperties: state.comparisonProperties,
            }),
        }
    )
);

// Селекторы для оптимизации ре-рендеров
export const useComparisonIds = () => useComparisonStore((state) => state.comparisonIds);
export const useIsInComparison = (propertyId: string) =>
    useComparisonStore((state) => state.comparisonIds.includes(propertyId));
export const useComparisonCount = () => useComparisonStore((state) => state.comparisonIds.length);
export const useIsComparisonPanelOpen = () =>
    useComparisonStore((state) => state.isComparisonPanelOpen);

// Константы для экспорта
export const COMPARISON_MAX_ITEMS = MAX_COMPARISON_ITEMS;
