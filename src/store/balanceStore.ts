import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BalanceState {
  balances: Record<string, string>;
  lastUpdated: Record<string, number>;
  isLoading: Record<string, boolean>;
}

interface BalanceActions {
  updateBalance: (denom: string, amount: string) => void;
  updateBalances: (balances: Record<string, string>) => void;
  setLoading: (denom: string, loading: boolean) => void;
  clearBalance: (denom: string) => void;
  clearAllBalances: () => void;
  getBalance: (denom: string) => string;
  getAllBalances: () => Record<string, string>;
}

type BalanceStore = BalanceState & BalanceActions;

export const useBalanceStore = create<BalanceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      balances: {},
      lastUpdated: {},
      isLoading: {},

      // Actions
      updateBalance: (denom: string, amount: string) => {
        set((state) => ({
          balances: {
            ...state.balances,
            [denom]: amount,
          },
          lastUpdated: {
            ...state.lastUpdated,
            [denom]: Date.now(),
          },
        }));
      },

      updateBalances: (balances: Record<string, string>) => {
        const now = Date.now();
        set((state) => ({
          balances: {
            ...state.balances,
            ...balances,
          },
          lastUpdated: Object.keys(balances).reduce((acc, denom) => {
            acc[denom] = now;
            return acc;
          }, {} as Record<string, number>),
        }));
      },

      setLoading: (denom: string, loading: boolean) => {
        set((state) => ({
          isLoading: {
            ...state.isLoading,
            [denom]: loading,
          },
        }));
      },

      clearBalance: (denom: string) => {
        set((state) => {
          const newBalances = { ...state.balances };
          const newLastUpdated = { ...state.lastUpdated };
          const newIsLoading = { ...state.isLoading };

          delete newBalances[denom];
          delete newLastUpdated[denom];
          delete newIsLoading[denom];

          return {
            balances: newBalances,
            lastUpdated: newLastUpdated,
            isLoading: newIsLoading,
          };
        });
      },

      clearAllBalances: () => {
        set({
          balances: {},
          lastUpdated: {},
          isLoading: {},
        });
      },

      getBalance: (denom: string) => {
        return get().balances[denom] || '0';
      },

      getAllBalances: () => {
        return get().balances;
      },
    }),
    {
      name: 'balance-storage',
      partialize: (state) => ({
        balances: state.balances,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
