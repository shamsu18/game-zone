import { create } from 'zustand';
import { authApi } from '../api/index.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('gz_token') || null,
  loading: false,
  initialized: false,

  // Restore session on app load
  init: async () => {
    const token = localStorage.getItem('gz_token');
    if (!token) {
      set({ initialized: true });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user, token, initialized: true });
    } catch {
      localStorage.removeItem('gz_token');
      set({ user: null, token: null, initialized: true });
    }
  },

  login: async (credentials) => {
    set({ loading: true });
    try {
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem('gz_token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  signup: async (data) => {
    set({ loading: true });
    try {
      const { user, token } = await authApi.signup(data);
      localStorage.setItem('gz_token', token);
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('gz_token');
    set({ user: null, token: null });
  },

  updateUser: (user) => set({ user }),

  isAdmin: () => get().user?.role === 'admin',
  isStaff: () => ['admin', 'staff'].includes(get().user?.role),
}));
