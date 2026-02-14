'use client';

import { create } from 'zustand';
import type {
    AutosearchTask,
    AutosearchProperty,
    CreateAutosearchRequest,
} from '@/entities/autosearch';
import {
    getAutosearchList,
    createAutosearch as createAutosearchAPI,
    updateAutosearch as updateAutosearchAPI,
    deleteAutosearch as deleteAutosearchAPI,
    activateAutosearch as activateAutosearchAPI,
    deactivateAutosearch as deactivateAutosearchAPI,
} from '@/shared/api/autosearch';

interface AutosearchStore {
    // Задания AutoSearch
    tasks: AutosearchTask[];
    
    // Входящие объекты от AutoSearch
    incomingProperties: AutosearchProperty[];
    
    // Состояния загрузки
    isLoadingTasks: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    
    // Методы для работы с заданиями
    fetchTasks: () => Promise<void>;
    createTask: (data: CreateAutosearchRequest) => Promise<AutosearchTask>;
    updateTask: (id: string, data: Partial<CreateAutosearchRequest>) => Promise<AutosearchTask>;
    deleteTask: (id: string) => Promise<void>;
    activateTask: (id: string) => Promise<void>;
    deactivateTask: (id: string) => Promise<void>;
    
    // Методы для работы с входящими объектами
    addIncomingProperty: (property: AutosearchProperty) => void;
    markPropertyAsViewed: (propertyId: string) => void;
    clearIncomingProperties: () => void;
}

export const useAutosearchStore = create<AutosearchStore>((set, get) => ({
    tasks: [],
    incomingProperties: [],
    isLoadingTasks: false,
    isCreating: false,
    isUpdating: false,

    fetchTasks: async () => {
        set({ isLoadingTasks: true });
        try {
            const response = await getAutosearchList();
            set({ tasks: response.items, isLoadingTasks: false });
        } catch (error) {
            console.error('[AutoSearch Store] Failed to fetch tasks', error);
            set({ isLoadingTasks: false });
        }
    },

    createTask: async (data) => {
        set({ isCreating: true });
        try {
            const newTask = await createAutosearchAPI(data);
            set((state) => ({
                tasks: [...state.tasks, newTask],
                isCreating: false,
            }));
            return newTask;
        } catch (error) {
            console.error('[AutoSearch Store] Failed to create task', error);
            set({ isCreating: false });
            throw error;
        }
    },

    updateTask: async (id, data) => {
        set({ isUpdating: true });
        try {
            const updatedTask = await updateAutosearchAPI(id, data);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
                isUpdating: false,
            }));
            return updatedTask;
        } catch (error) {
            console.error('[AutoSearch Store] Failed to update task', error);
            set({ isUpdating: false });
            throw error;
        }
    },

    deleteTask: async (id) => {
        try {
            await deleteAutosearchAPI(id);
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
            }));
        } catch (error) {
            console.error('[AutoSearch Store] Failed to delete task', error);
            throw error;
        }
    },

    activateTask: async (id) => {
        try {
            const updatedTask = await activateAutosearchAPI(id);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
            }));
        } catch (error) {
            console.error('[AutoSearch Store] Failed to activate task', error);
            throw error;
        }
    },

    deactivateTask: async (id) => {
        try {
            const updatedTask = await deactivateAutosearchAPI(id);
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
            }));
        } catch (error) {
            console.error('[AutoSearch Store] Failed to deactivate task', error);
            throw error;
        }
    },

    addIncomingProperty: (property) => {
        set((state) => ({
            incomingProperties: [property, ...state.incomingProperties],
        }));
    },

    markPropertyAsViewed: (propertyId) => {
        set((state) => ({
            incomingProperties: state.incomingProperties.map((p) =>
                p.id === propertyId
                    ? {
                          ...p,
                          autosearchMetadata: {
                              ...p.autosearchMetadata,
                              isNew: false,
                          },
                      }
                    : p
            ),
        }));
    },

    clearIncomingProperties: () => {
        set({ incomingProperties: [] });
    },
}));
