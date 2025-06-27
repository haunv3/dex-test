import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TokenItemType } from '@oraichain/oraidex-common';

interface TokenSelectorProps {
  selectedToken: string;
  onTokenSelect: (tokenDenom: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  tokens: TokenItemType[];
  placeholder?: string;
}

const TokenSelector: React.FC<TokenSelectorProps> = ({
  selectedToken,
  onTokenSelect,
  isOpen,
  onToggle,
  tokens,
  placeholder = 'Select a token',
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTokenData = tokens.find(token => token.denom === selectedToken);

  // Filter tokens based on search term
  const filteredTokens = tokens.filter(token => {
    const searchLower = searchTerm.toLowerCase();
    return (
      token.name?.toLowerCase().includes(searchLower) ||
      token.denom?.toLowerCase().includes(searchLower)
    );
  });

  const getTokenDisplayNameShort = (token: TokenItemType) => {
    return token.name || token.denom;
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {selectedTokenData ? getTokenDisplayNameShort(selectedTokenData) + ' - ' + selectedTokenData.org : placeholder}
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
              placeholder={t('swap.searchTokens') || 'Search tokens...'}
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
                return (
                  <button
                    key={token.denom}
                    onClick={() => {
                      onTokenSelect(token.denom);
                      onToggle();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                      selectedToken === token.denom ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    {/* <span className="text-lg">{token.icon || '🪙'}</span> */}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {token.name || token.denom}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {token.org} {token.isVerified && '• ✅ Verified'}
                      </div>
                    </div>
                    {selectedToken === token.denom && (
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
