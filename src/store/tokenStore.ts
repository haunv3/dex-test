import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenItemType } from '@oraichain/oraidex-common';

interface TokenState {
  allOraichainTokens: TokenItemType[];
  allOtherChainTokens: TokenItemType[];
  addedTokens: TokenItemType[];
}

interface TokenActions {
  updateAllOraichainTokens: (tokens: TokenItemType[]) => void;
  updateAllOtherChainTokens: (tokens: TokenItemType[]) => void;
  addToken: (token: TokenItemType) => void;
  removeToken: (tokenId: string) => void;
  clearTokens: () => void;
}

type TokenStore = TokenState & TokenActions;

export const useTokenStore = create<TokenStore>()(
  persist(
    (set, get) => ({
      // Initial state
      allOraichainTokens: [],
      allOtherChainTokens: [],
      addedTokens: [],

      // Actions
      updateAllOraichainTokens: (tokens: TokenItemType[]) => {
        set({ allOraichainTokens: tokens });
      },

      updateAllOtherChainTokens: (tokens: TokenItemType[]) => {
        set({ allOtherChainTokens: tokens });
      },

      addToken: (token: TokenItemType) => {
        const { addedTokens } = get();
        const existingToken = addedTokens.find(t => t.denom === token.denom);
        if (!existingToken) {
          set({ addedTokens: [...addedTokens, token] });
        }
      },

      removeToken: (tokenId: string) => {
        const { addedTokens } = get();
        set({
          addedTokens: addedTokens.filter(token => token.denom !== tokenId)
        });
      },

      clearTokens: () => {
        set({
          allOraichainTokens: [],
          allOtherChainTokens: [],
          addedTokens: []
        });
      },
    }),
    {
      name: 'token-storage',
      partialize: (state) => ({
        allOraichainTokens: state.allOraichainTokens,
        allOtherChainTokens: state.allOtherChainTokens,
        addedTokens: state.addedTokens,
      }),
    }
  )
);
