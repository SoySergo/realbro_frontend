'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIAgentSettings } from '@/entities/chat';
import { getAISettings, updateAISettings } from '@/shared/api/chat';

interface ChatSettingsStore {
    settings: AIAgentSettings;
    isLoading: boolean;

    fetchSettings: () => Promise<void>;
    updateSettings: (updates: Partial<AIAgentSettings>) => Promise<void>;
}

const defaultSettings: AIAgentSettings = {
    isActive: true,
    notificationStartHour: 7,
    notificationEndHour: 22,
    notificationFrequency: '30min',
    linkedFilterIds: ['filter_1', 'filter_2'],
};

export const useChatSettingsStore = create<ChatSettingsStore>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            isLoading: false,

            fetchSettings: async () => {
                set({ isLoading: true });
                const settings = await getAISettings();
                set({ settings, isLoading: false });
            },

            updateSettings: async (updates) => {
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                }));
                const result = await updateAISettings(updates);
                set({ settings: result });
            },
        }),
        {
            name: 'realbro-chat-settings',
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
