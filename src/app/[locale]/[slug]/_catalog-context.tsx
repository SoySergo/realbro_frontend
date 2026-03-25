'use client';

import { createContext, useContext } from 'react';

/** Контекст для обмена состоянием скролла между layout и catalog page */
interface CatalogContextValue {
    /** Видна ли секция фильтров в viewport */
    filtersVisible: boolean;
    /** Коллбэк от catalog page при изменении видимости фильтров */
    setFiltersVisible: (visible: boolean) => void;
}

export const CatalogContext = createContext<CatalogContextValue>({
    filtersVisible: true,
    setFiltersVisible: () => {},
});

export function useCatalogContext() {
    return useContext(CatalogContext);
}
