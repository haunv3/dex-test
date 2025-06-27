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
    allTokens: [...allOraichainTokens, ...allOtherChainTokens, ...addedTokens],
    verifiedTokens: allOraichainTokens.filter(token => token.isVerified),
  };
};
