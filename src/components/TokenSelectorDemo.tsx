import React, { useState } from 'react';
import TokenSelector from './swap/TokenSelector';
import { SUPPORTED_TOKENS, getTokenById } from '../constants/networks';

const TokenSelectorDemo: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('usdt-bsc');
  const [isOpen, setIsOpen] = useState(false);

  const selectedTokenInfo = getTokenById(selectedToken);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Token Selector Demo
      </h2>

      <div className="space-y-4">
        {/* Current Selection */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Currently Selected:
          </h3>
          {selectedTokenInfo ? (
            <div className="space-y-1">
              <p><strong>ID:</strong> {selectedTokenInfo.id}</p>
              <p><strong>Symbol:</strong> {selectedTokenInfo.symbol}</p>
              <p><strong>Name:</strong> {selectedTokenInfo.name}</p>
              <p><strong>Network ID:</strong> {selectedTokenInfo.networkId}</p>
              <p><strong>Contract:</strong> {selectedTokenInfo.contractAddress.slice(0, 20)}...</p>
            </div>
          ) : (
            <p className="text-red-500">Token not found</p>
          )}
        </div>

        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Token:
          </label>
          <TokenSelector
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
            isOpen={isOpen}
            onToggle={() => setIsOpen(!isOpen)}
          />
        </div>

        {/* Available Tokens List */}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Available Tokens:
          </h3>
          <div className="space-y-2">
            {SUPPORTED_TOKENS.map(token => (
              <div
                key={token.id}
                className={`p-3 rounded-lg border ${
                  selectedToken === token.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{token.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {token.symbol} ({token.id})
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {token.name} • Network: {token.networkId}
                    </div>
                  </div>
                  {selectedToken === token.id && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            How it works:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Click "Select Token" to open the selector</li>
            <li>• You can search by symbol, name, or network</li>
            <li>• Each token shows its network (BSC/ETH)</li>
            <li>• Selection uses unique token ID, not symbol</li>
            <li>• This prevents confusion between same-symbol tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TokenSelectorDemo;
