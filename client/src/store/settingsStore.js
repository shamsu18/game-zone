import { create } from 'zustand';
import { settingsApi } from '../api/index.js';

export const useSettingsStore = create((set) => ({
  settings: null,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const settings = await settingsApi.get();
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setSettings: (settings) => set({ settings }),
}));
