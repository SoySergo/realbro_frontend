'use client';

import { create } from 'zustand';

interface HoveredProperty {
    id: string;
    coordinates: [number, number]; // [lng, lat]
}

interface HoveredPropertyStore {
    hovered: HoveredProperty | null;
    setHovered: (property: HoveredProperty | null) => void;
}

export const useHoveredPropertyStore = create<HoveredPropertyStore>((set) => ({
    hovered: null,
    setHovered: (property) => set({ hovered: property }),
}));
