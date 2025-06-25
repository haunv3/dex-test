import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_TOKENS, getTokensByNetwork, getNetworkByChainId } from '../../constants/networks';
import { useWallet } from '../../hooks/useWallet';

interface TokenSelectorProps {
  selectedToken: string; // This should be token.id now, not token.symbol
  onTokenSelect: (tokenId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  isOpen,
  onToggle,
}) => {
  const { t } = useTranslation();
  const { network } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');

  // Get tokens for current network, or all tokens if no network
  const availableTokens = network ? getTokensByNetwork(network) : SUPPORTED_TOKENS;
  const selectedTokenData = availableTokens.find(token => token.id === selectedToken);

  // Filter tokens based on search term
  const filteredTokens = availableTokens.filter(token => {
    const networkInfo = getNetworkByChainId(token.networkId);
    const searchLower = searchTerm.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(searchLower) ||
      token.name.toLowerCase().includes(searchLower) ||
      (networkInfo?.name.toLowerCase().includes(searchLower))
    );
  });

  const getTokenDisplayName = (token: any) => {
    const networkInfo = getNetworkByChainId(token.networkId);
    if (networkInfo) {
      return `${token.symbol} (${networkInfo.name})`;
    }
    return token.symbol;
  };

  const getTokenDisplayNameShort = (token: any) => {
    const networkInfo = getNetworkByChainId(token.networkId);
    if (networkInfo) {
      // Use short network name
      const shortNetworkName = networkInfo.name === 'Ethereum' ? 'ETH' :
                              networkInfo.name === 'BNB Smart Chain' ? 'BSC' :
                              networkInfo.name;
      return `${token.symbol} (${shortNetworkName})`;
    }
    return token.symbol;
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
      >
        <span className="text-lg">{selectedTokenData?.icon || '🪙'}</span>
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {selectedTokenData ? getTokenDisplayNameShort(selectedTokenData) : selectedToken}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
          <div className="p-2">
            <input
              type="text"
              placeholder={t('swap.searchTokens')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredTokens.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                No tokens found
              </div>
            ) : (
              filteredTokens.map((token) => {
                const networkInfo = getNetworkByChainId(token.networkId);
                return (
                  <button
                    key={token.id}
                    onClick={() => {
                      onTokenSelect(token.id);
                      onToggle();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                      selectedToken === token.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="text-lg">{token.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {token.symbol}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {token.name} • {networkInfo?.name || 'Unknown Network'}
                      </div>
                    </div>
                    {selectedToken === token.id && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector;
