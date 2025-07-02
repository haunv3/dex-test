import { useMemo } from 'react';
import { useTokenStore } from '../store/tokenStore';

export const useTokens = () => {
  const {
    allOraichainTokens,
    allOtherChainTokens,
    addedTokens,
    updateAllOraichainTokens,
    updateAllOtherChainTokens,
    addToken,
    removeToken,
    clearTokens,
  } = useTokenStore();

  // Memoize allTokens to prevent unnecessary re-renders
  const allTokens = useMemo(() =>
    [...allOraichainTokens, ...allOtherChainTokens, ...addedTokens],
    [allOraichainTokens, allOtherChainTokens, addedTokens]
  );

  // Memoize verifiedTokens to prevent unnecessary re-renders
  const verifiedTokens = useMemo(() =>
    allOraichainTokens.filter(token => token.isVerified),
    [allOraichainTokens]
  );

  return {
    // State
    allOraichainTokens,
    allOtherChainTokens,
    addedTokens,

    // Actions
    updateAllOraichainTokens,
    updateAllOtherChainTokens,
    addToken,
    removeToken,
    clearTokens,

    // Computed values
    allTokens,
    verifiedTokens,
  };
};
