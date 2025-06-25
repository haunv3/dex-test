import React, { useState } from 'react';
import BalanceDisplay from './ui/BalanceDisplay';
import { SUPPORTED_TOKENS, getTokenById } from '../constants/networks';
import { useBalance } from '../hooks/useBalance';

const BalanceDisplayTest: React.FC = () => {
  const { balances, isLoading } = useBalance();
  const [selectedTokenId, setSelectedTokenId] = useState('usdt-bsc');

  const selectedToken = getTokenById(selectedTokenId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Balance Display Test
      </h2>

      <div className="space-y-6">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Token to Test:
          </label>
          <select
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
          >
            {SUPPORTED_TOKENS.map(token => (
              <option key={token.id} value={token.id}>
                {token.symbol} ({token.name}) - {token.networkId}
              </option>
            ))}
          </select>
        </div>

        {/* Token Info */}
        {selectedToken && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Selected Token Info:
            </h3>
            <div className="space-y-1 text-sm">
              <p><strong>ID:</strong> {selectedToken.id}</p>
              <p><strong>Symbol:</strong> {selectedToken.symbol}</p>
              <p><strong>Name:</strong> {selectedToken.name}</p>
              <p><strong>Network ID:</strong> {selectedToken.networkId}</p>
              <p><strong>Contract:</strong> {selectedToken.contractAddress}</p>
            </div>
          </div>
        )}

        {/* Balance Display Tests */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            Balance Display Tests:
          </h3>

          {/* Test 1: Using tokenId */}
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test 1: Using tokenId="{selectedTokenId}"
            </h4>
            <BalanceDisplay tokenId={selectedTokenId} showNetwork={true} />
          </div>

          {/* Test 2: Using tokenSymbol */}
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test 2: Using tokenSymbol="{selectedToken?.symbol}"
            </h4>
            <BalanceDisplay tokenSymbol={selectedToken?.symbol} showNetwork={true} />
          </div>

          {/* Test 3: Using tokenSymbol + networkId */}
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test 3: Using tokenSymbol="{selectedToken?.symbol}" + networkId="{selectedToken?.networkId}"
            </h4>
            <BalanceDisplay
              tokenSymbol={selectedToken?.symbol}
              networkId={selectedToken?.networkId}
              showNetwork={true}
            />
          </div>
        </div>

        {/* Raw Balance Data */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Raw Balance Data:
          </h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {isLoading ? (
              <p>Loading balances...</p>
            ) : (
              <pre>{JSON.stringify(balances, null, 2)}</pre>
            )}
          </div>
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Debug Info:
          </h3>
          <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <p>• Test 1 should find the exact token by ID</p>
            <p>• Test 2 might find any token with same symbol</p>
            <p>• Test 3 should find token with symbol + network</p>
            <p>• Check raw data to see actual balance structure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplayTest;
