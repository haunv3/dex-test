import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBalance } from '../hooks/useBalance';
import { useWallet } from '../hooks/useWallet';
import { useTokens } from '../hooks/useTokens';
import Button from './ui/Button';
import Card from './ui/Card';

const BalanceDemo: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, connections } = useWallet();
  const { allTokens } = useTokens();
  const {
    balances,
    isLoading,
    getBalance,
    getExchainTokens,
    getNobleTokens,
    fetchAllBalances,
    fetchTokenBalance,
  } = useBalance();

  const [selectedToken, setSelectedToken] = useState<string>('');

  const exchainTokens = getExchainTokens();
  const nobleTokens = getNobleTokens();

  const handleFetchAllBalances = async () => {
    console.log('Fetching all balances...');
    await fetchAllBalances();
  };

  const handleFetchSpecificBalance = async () => {
    if (!selectedToken) {
      alert('Please select a token first');
      return;
    }
    console.log(`Fetching balance for ${selectedToken}...`);
    await fetchTokenBalance(selectedToken);
  };

  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0.00';
    return num.toFixed(4);
  };

  const getNetworkName = (chainId: string) => {
    switch (chainId) {
      case '20250626':
        return 'Exchain (EVM)';
      case 'noble-1':
        return 'Noble (Cosmos)';
      default:
        return chainId;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Balance Demo - Exchain & Noble
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test balance fetching for Exchain (EVM) and Noble (Cosmos) networks
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Wallet Connected: {isConnected ? 'Yes' : 'No'}</span>
          </div>
          {isConnected && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Connected Wallets: {connections.length}
            </div>
          )}
        </div>
      </Card>

      {/* Available Tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Exchain Tokens */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">🟢 Exchain Tokens (EVM)</h2>
          <div className="space-y-2">
            {exchainTokens.length > 0 ? (
              exchainTokens.map((token) => (
                <div
                  key={token.denom}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{token.name || token.denom}</div>
                    <div className="text-sm text-gray-500">{token.denom}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatBalance(getBalance(token.denom), token.decimals)}
                    </div>
                    {isLoading[token.denom] && (
                      <div className="text-xs text-blue-500">Loading...</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No Exchain tokens found</p>
            )}
          </div>
        </Card>

        {/* Noble Tokens */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">🔷 Noble Tokens (Cosmos)</h2>
          <div className="space-y-2">
            {nobleTokens.length > 0 ? (
              nobleTokens.map((token) => (
                <div
                  key={token.denom}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{token.name || token.denom}</div>
                    <div className="text-sm text-gray-500">{token.denom}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatBalance(getBalance(token.denom), token.decimals)}
                    </div>
                    {isLoading[token.denom] && (
                      <div className="text-xs text-blue-500">Loading...</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No Noble tokens found</p>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleFetchAllBalances}
              disabled={!isConnected || Object.values(isLoading).some(Boolean)}
              variant="primary"
            >
              {Object.values(isLoading).some(Boolean) ? 'Loading...' : 'Fetch All Balances'}
            </Button>

            <div className="flex items-center space-x-2">
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select a token</option>
                {[...exchainTokens, ...nobleTokens].map((token) => (
                  <option key={token.denom} value={token.denom}>
                    {token.name || token.denom} ({getNetworkName(token.chainId)})
                  </option>
                ))}
              </select>
              <Button
                onClick={handleFetchSpecificBalance}
                disabled={!selectedToken || !isConnected || isLoading[selectedToken]}
                variant="outline"
              >
                Fetch Balance
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Debug Info */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Total Tokens:</strong> {allTokens.length}
          </div>
          <div>
            <strong>Exchain Tokens:</strong> {exchainTokens.length}
          </div>
          <div>
            <strong>Noble Tokens:</strong> {nobleTokens.length}
          </div>
          <div>
            <strong>Stored Balances:</strong> {Object.keys(balances).length}
          </div>
          <div>
            <strong>Loading States:</strong> {Object.values(isLoading).filter(Boolean).length}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BalanceDemo;
