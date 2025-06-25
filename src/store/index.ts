import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, User, Theme } from '../types';
import i18n from '../i18n';

interface AppStore extends AppState {
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: string) => void;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      theme: { mode: 'light' },
      language: 'en',
      isLoading: false,

      // Actions
      setUser: (user: User | null) => set({ user }),

      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document
        if (theme.mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      setLanguage: (language: string) => {
        set({ language });
        i18n.changeLanguage(language);
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),

      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme: Theme = {
          mode: currentTheme.mode === 'light' ? 'dark' : 'light'
        };
        get().setTheme(newTheme);
      },

      logout: () => set({ user: null }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
