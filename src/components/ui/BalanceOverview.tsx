import React from 'react';
import { useBalance } from '../../hooks/useBalance';
import { formatUSDValue } from '../../utils';

interface BalanceOverviewProps {
  className?: string;
  showEmptyNetworks?: boolean;
  maxNetworks?: number;
}

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  className = '',
  showEmptyNetworks = false,
  maxNetworks = 5,
}) => {
  const { balances, totalValue, totalValueFormatted, isLoading, error, lastUpdated, refreshBalances } = useBalance();

  if (isLoading && balances.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Overview</h3>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-4 w-32 rounded mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-3 w-24 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Overview</h3>
          <button
            onClick={refreshBalances}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">Failed to load balances</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{error}</p>
          <button
            onClick={refreshBalances}
            className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayedBalances = showEmptyNetworks
    ? balances.slice(0, maxNetworks)
    : balances.filter(balance =>
        parseFloat(balance.nativeBalance) > 0 ||
        balance.tokenBalances.some(token => parseFloat(token.balance) > 0)
      ).slice(0, maxNetworks);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Portfolio Overview</h3>
          {lastUpdated && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshBalances}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Refresh balances"
          >
            <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Total Value */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalValueFormatted}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Networks</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{balances.length}</p>
          </div>
        </div>
      </div>

      {/* Network Balances */}
      {displayedBalances.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-1">No balances found</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Connect your wallet to supported networks to see your assets
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBalances.map((networkBalance) => (
            <div key={networkBalance.network.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              {/* Network Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{networkBalance.network.icon}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {networkBalance.network.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {networkBalance.totalValueFormatted}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {networkBalance.tokenBalances.length + (parseFloat(networkBalance.nativeBalance) > 0 ? 1 : 0)} assets
                  </p>
                </div>
              </div>

              {/* Assets */}
              <div className="space-y-2">
                {/* Native Token */}
                {parseFloat(networkBalance.nativeBalance) > 0 && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {networkBalance.network.nativeCurrency.symbol === 'BNB' ? '🟡' :
                         networkBalance.network.nativeCurrency.symbol === 'ETH' ? '🔷' : '🟣'}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {networkBalance.network.nativeCurrency.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {networkBalance.nativeValueFormatted}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {parseFloat(networkBalance.nativeBalanceFormatted).toFixed(6)} {networkBalance.network.nativeCurrency.symbol}
                      </p>
                    </div>
                  </div>
                )}

                {/* Token Balances */}
                {networkBalance.tokenBalances.map((tokenBalance) => (
                  <div key={tokenBalance.token.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{tokenBalance.token.icon}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tokenBalance.token.symbol}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {tokenBalance.valueFormatted}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {parseFloat(tokenBalance.balanceFormatted).toFixed(4)} {tokenBalance.token.symbol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More Button */}
      {balances.length > maxNetworks && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Show {balances.length - maxNetworks} more networks
          </button>
        </div>
      )}
    </div>
  );
};

export default BalanceOverview;
