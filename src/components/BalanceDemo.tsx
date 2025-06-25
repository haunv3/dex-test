import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';
import { BalanceDisplay, BalanceOverview } from './ui';
import { balanceService } from '../services/balanceService';
import { SUPPORTED_NETWORKS, getTokensByNetwork } from '../constants/networks';
import BalanceDebug from './BalanceDebug';
import BalanceDisplayTest from './BalanceDisplayTest';

const BalanceDemo: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const { balances, totalValue, totalValueFormatted, isLoading, error, refreshBalances } = useBalance();

  const handleConnect = async () => {
    try {
      await connectWallet('metamask');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
  };

  const handleSwitchNetwork = async (networkId: string) => {
    try {
      const network = SUPPORTED_NETWORKS.find((n: any) => n.id === networkId);
      if (network) {
        await balanceService.switchNetwork(network);
        await refreshBalances();
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleTestBalance = async () => {
    if (!address) return;

    try {
      console.log('=== Testing Balance Service ===');
      console.log('Address:', address);

      // Test 1: Check supported networks
      const networks = balanceService.getSupportedNetworks();
      console.log('Supported networks:', networks);

      // Test 2: Check tokens for BSC
      const bscTokens = balanceService.getSupportedTokens('0x38');
      console.log('BSC tokens:', bscTokens);

      // Test 3: Get all balances
      console.log('Fetching all balances...');
      const allBalances = await balanceService.getAllBalances(address);
      console.log('All balances:', allBalances);

      // Test 4: Get portfolio value
      console.log('Fetching portfolio value...');
      const portfolioValue = await balanceService.getTotalPortfolioValue(address);
      console.log('Portfolio value:', portfolioValue);

      console.log('=== Test completed ===');

    } catch (error) {
      console.error('Balance test failed:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
        Balance System Demo
      </h1>

      {/* Debug Component */}
      <BalanceDebug />

      {/* Balance Display Test */}
      {isConnected && (
        <BalanceDisplayTest />
      )}

      {/* Wallet Connection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Wallet Connection
        </h2>

        {!isConnected ? (
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Connect MetaMask
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Connected Address</p>
                <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {address}
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Disconnect
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleTestBalance}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Test Balance Service
              </button>
              <button
                onClick={refreshBalances}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Refreshing...' : 'Refresh Balances'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Balance Overview */}
      {isConnected && (
        <BalanceOverview className="w-full" />
      )}

      {/* Individual Token Balances */}
      {isConnected && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Individual Token Balances
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* BSC Tokens */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">BSC Tokens (BEP20)</h3>
              <BalanceDisplay tokenSymbol="BNB" networkId="bsc" showNetwork={true} />
              <BalanceDisplay tokenSymbol="USDT" networkId="bsc" showNetwork={true} />
            </div>

            {/* Ethereum Tokens */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Ethereum Tokens (ERC20)</h3>
              <BalanceDisplay tokenSymbol="ETH" networkId="ethereum" showNetwork={true} />
              <BalanceDisplay tokenSymbol="USDT" networkId="ethereum" showNetwork={true} />
            </div>

            {/* Network Info */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Network Information</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>BSC: 1 token (USDT)</p>
                <p>Ethereum: 1 token (USDT)</p>
                <p>Total: 2 networks</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Supported Networks & Tokens
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUPPORTED_NETWORKS.map((network: any) => (
            <div key={network.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg">{network.icon}</span>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{network.name}</h3>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Chain ID: {network.chainId}</p>
                <p>Native: {network.nativeCurrency.symbol}</p>
                <p>Tokens: {getTokensByNetwork(network.chainId).length}</p>
              </div>

              {isConnected && (
                <button
                  onClick={() => handleSwitchNetwork(network.id)}
                  className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Switch to {network.name}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="font-medium text-red-800 dark:text-red-200">Error</h3>
          </div>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BalanceDemo;
