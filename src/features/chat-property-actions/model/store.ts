'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PropertyActionsStore {
    likedIds: string[];
    dislikedIds: string[];
    savedIds: string[];
    viewedIds: string[];

    toggleLike: (propertyId: string) => void;
    toggleDislike: (propertyId: string) => void;
    toggleSave: (propertyId: string) => void;
    markViewed: (propertyId: string) => void;
    isLiked: (propertyId: string) => boolean;
    isDisliked: (propertyId: string) => boolean;
    isSaved: (propertyId: string) => boolean;
    isViewed: (propertyId: string) => boolean;
}

export const usePropertyActionsStore = create<PropertyActionsStore>()(
    persist(
        (set, get) => ({
            likedIds: [],
            dislikedIds: [],
            savedIds: [],
            viewedIds: [],

            toggleLike: (propertyId) =>
                set((state) => {
                    const isCurrentlyLiked = state.likedIds.includes(propertyId);
                    return {
                        likedIds: isCurrentlyLiked
                            ? state.likedIds.filter((id) => id !== propertyId)
                            : [...state.likedIds, propertyId],
                        // Remove from disliked if liking
                        dislikedIds: isCurrentlyLiked
                            ? state.dislikedIds
                            : state.dislikedIds.filter((id) => id !== propertyId),
                    };
                }),

            toggleDislike: (propertyId) =>
                set((state) => {
                    const isCurrentlyDisliked = state.dislikedIds.includes(propertyId);
                    return {
                        dislikedIds: isCurrentlyDisliked
                            ? state.dislikedIds.filter((id) => id !== propertyId)
                            : [...state.dislikedIds, propertyId],
                        // Remove from liked if disliking
                        likedIds: isCurrentlyDisliked
                            ? state.likedIds
                            : state.likedIds.filter((id) => id !== propertyId),
                    };
                }),

            toggleSave: (propertyId) =>
                set((state) => ({
                    savedIds: state.savedIds.includes(propertyId)
                        ? state.savedIds.filter((id) => id !== propertyId)
                        : [...state.savedIds, propertyId],
                })),

            markViewed: (propertyId) =>
                set((state) => ({
                    viewedIds: state.viewedIds.includes(propertyId)
                        ? state.viewedIds
                        : [...state.viewedIds, propertyId],
                })),

            isLiked: (propertyId) => get().likedIds.includes(propertyId),
            isDisliked: (propertyId) => get().dislikedIds.includes(propertyId),
            isSaved: (propertyId) => get().savedIds.includes(propertyId),
            isViewed: (propertyId) => get().viewedIds.includes(propertyId),
        }),
        {
            name: 'realbro-property-actions',
        }
    )
);
