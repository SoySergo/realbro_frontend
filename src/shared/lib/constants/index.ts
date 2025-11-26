// Константы приложения

// Барселона (центр)
export const BARCELONA_CENTER = {
    lat: 41.3851,
    lng: 2.1734,
};

// Дефолтный зум карты
export const DEFAULT_MAP_ZOOM = 12;

// Лимиты фильтров
export const PRICE_RANGE = {
    min: 0,
    max: 5000,
    step: 50,
};

export const AREA_RANGE = {
    min: 0,
    max: 500,
    step: 10,
};

export const BEDROOMS_OPTIONS = [0, 1, 2, 3, 4, 5] as const;
export const BATHROOMS_OPTIONS = [1, 2, 3, 4] as const;

// Провинции Барселоны (для MVP только Барселона)
export const PROVINCES = ['Barcelona'] as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
