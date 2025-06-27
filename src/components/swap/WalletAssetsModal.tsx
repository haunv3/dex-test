import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMultiWalletBalance } from '../../hooks/useMultiWalletBalance';
import { balanceService } from '../../services/balanceService';
import { useWallet } from '../../hooks/useWallet';
import type { Network } from '../../constants/networks';

interface WalletAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  walletType: 'metamask' | 'owallet';
  onDisconnect: () => void;
}

const WalletAssetsModal: React.FC<WalletAssetsModalProps> = ({
  isOpen,
  onClose,
  walletAddress,
  walletType,
  onDisconnect,
}) => {
  const { t } = useTranslation();
  const {
    evmBalances,
    cosmosBalances,
    totalValueFormatted,
    isLoading,
    error,
    refreshBalances,
    walletCounts
  } = useMultiWalletBalance();
  const { connections, getAllAddresses, disconnectConnection } = useWallet();

  // Combine all balances for display
  const allBalances = [...evmBalances, ...cosmosBalances];

  console.log('Multi-wallet balances:', { evmBalances, cosmosBalances, walletCounts });

  const handleDisconnect = () => {
    onDisconnect();
  };

  const handleDisconnectSpecific = (type: 'evm' | 'cosmos', walletType: string) => {
    disconnectConnection(type, walletType);
  };

  const formatAddress = (address: string) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'metamask':
        return '🦊';
      case 'owallet':
        return '🔵';
      default:
        return '💳';
    }
  };

  const getWalletName = (walletType: string) => {
    switch (walletType) {
      case 'metamask':
        return 'MetaMask';
      case 'owallet':
        return 'OWallet';
      default:
        return 'Wallet';
    }
  };

  const handleSwitchNetwork = async (network: Network) => {
    try {
      await balanceService.switchNetwork(network);
      await refreshBalances();
    } catch (error) {
      console.error('Error switching network:', error);
      // Try to add network if switch fails
      try {
        await balanceService.addNetwork(network);
        await refreshBalances();
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    }
  };

  if (!isOpen) return null;

  const allAddresses = getAllAddresses();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                🔗
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  Multi-Wallet
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connections.length} wallet{connections.length !== 1 ? 's' : ''} connected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Connected Wallets Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Connected Wallets
            </h3>
            <div className="space-y-2">
              {/* EVM Wallets */}
              {allAddresses.evm.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🔷</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      EVM: {allAddresses.evm.length} wallet{allAddresses.evm.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {walletCounts.evm} networks
                  </span>
                </div>
              )}

              {/* Cosmos Wallets */}
              {allAddresses.cosmos.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">🔶</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Cosmos: {allAddresses.cosmos.length} wallet{allAddresses.cosmos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {walletCounts.cosmos} networks
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Total Value */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('wallet.totalValue')}
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {totalValueFormatted}
                </p>
              )}
              {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
              )}
            </div>
          </div>

          {/* Assets List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {t('wallet.assets')}
              </h3>
              <button
                onClick={refreshBalances}
                disabled={isLoading}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <svg className={`w-4 h-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {isLoading && allBalances.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading assets...</p>
              </div>
            ) : allBalances.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No assets found</p>
                <p className="text-sm text-gray-400 mt-1">Connect to supported networks to see your assets</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allBalances.map((networkBalance) => (
                  <div key={networkBalance.network.id} className="space-y-3">
                    {/* Network Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{networkBalance.network.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {networkBalance.network.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({networkBalance.network.isEvm ? 'EVM' : 'Cosmos'})
                        </span>
                      </div>
                      <button
                        onClick={() => handleSwitchNetwork(networkBalance.network)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Switch
                      </button>
                    </div>

                    {/* Native Token */}
                    {parseFloat(networkBalance.nativeBalance) > 0 && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{networkBalance.network.nativeCurrency.symbol === 'BNB' ? '🟡' :
                                                   networkBalance.network.nativeCurrency.symbol === 'ETH' ? '🔷' : '🟣'}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {networkBalance.network.nativeCurrency.symbol}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {networkBalance.network.nativeCurrency.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {networkBalance.nativeValueFormatted}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {parseFloat(networkBalance.nativeBalanceFormatted).toFixed(6)} {networkBalance.network.nativeCurrency.symbol}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Token Balances */}
                    {networkBalance.tokenBalances.map((tokenBalance) => (
                      <div
                        key={tokenBalance.token.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{tokenBalance.token.icon}</span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {tokenBalance.token.symbol}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {tokenBalance.token.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {tokenBalance.valueFormatted}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {parseFloat(tokenBalance.balanceFormatted).toFixed(6)} {tokenBalance.token.symbol}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {/* Disconnect All Button */}
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Disconnect All Wallets
              </button>

              {/* Individual Disconnect Buttons */}
              {connections.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Or disconnect individual wallets:
                  </p>
                  {connections.map((conn, index) => (
                    <button
                      key={`${conn.type}-${conn.walletType}-${index}`}
                      onClick={() => handleDisconnectSpecific(conn.type, conn.walletType)}
                      className="w-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center space-x-2">
                        <span>{getWalletIcon(conn.walletType)}</span>
                        <span>{getWalletName(conn.walletType)} ({conn.type})</span>
                      </span>
                      <span className="text-xs">{formatAddress(conn.address)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletAssetsModal;
