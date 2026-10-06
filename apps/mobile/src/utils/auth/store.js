import { create } from 'zustand';

// Firebase owns session persistence and refresh; this store contains UI state only.
export const useAuthStore = create((set) => ({
  isReady: false,
  auth: null,
  setAuth: (auth) => set({ auth }),
}));

export const useAuthModal = create((set) => ({
  isOpen: false,
  mode: 'signup',
  open: (options) => set({ isOpen: true, mode: options?.mode || 'signup' }),
  close: () => set({ isOpen: false }),
}));
