'use client';

import { create } from 'zustand';

/**
 * Стор для портала хедера.
 * Позволяет страницам рендерить контент в слот хедера через createPortal.
 */
interface HeaderSlotStore {
    portalTarget: HTMLDivElement | null;
    setPortalTarget: (el: HTMLDivElement | null) => void;
}

export const useHeaderSlotStore = create<HeaderSlotStore>((set) => ({
    portalTarget: null,
    setPortalTarget: (el) => set({ portalTarget: el }),
}));
