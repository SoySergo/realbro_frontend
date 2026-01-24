/**
 * Типы для работы с рисованием полигонов на карте
 */

// Точка полигона (координаты)
export type DrawPoint = {
    lng: number;
    lat: number;
};

// Режим рисования
export type DrawMode = 'idle' | 'drawing' | 'editing';

// Нарисованный полигон
export type DrawPolygon = {
    id: string;
    name?: string;
    points: DrawPoint[];
    createdAt: Date;
};

// Состояние редактора полигонов
export type DrawState = {
    mode: DrawMode;
    currentPoints: DrawPoint[];
    polygons: DrawPolygon[];
    selectedPolygonId: string | null;
};
