import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';

const WalletInfo: React.FC = () => {
  const { t } = useTranslation();
  const { isConnected, connections, getAllAddresses } = useWallet();

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

  if (!isConnected) {
    return null;
  }

  const allAddresses = getAllAddresses();

  return (
    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Connected Wallets
        </h3>
        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">
          {connections.length} connected
        </span>
      </div>

      <div className="space-y-2">
        {/* EVM Wallets */}
        {allAddresses.evm.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🔷</span>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                EVM Wallets ({allAddresses.evm.length})
              </span>
            </div>
            {allAddresses.evm.map((addr, index) => (
              <div key={`evm-${index}`} className="flex items-center justify-between ml-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">{getWalletIcon(addr.walletType)}</span>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {getWalletName(addr.walletType)}
                  </span>
                </div>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {formatAddress(addr.address)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cosmos Wallets */}
        {allAddresses.cosmos.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🔶</span>
              <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                Cosmos Wallets ({allAddresses.cosmos.length})
              </span>
            </div>
            {allAddresses.cosmos.map((addr, index) => (
              <div key={`cosmos-${index}`} className="flex items-center justify-between ml-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">{getWalletIcon(addr.walletType)}</span>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    {getWalletName(addr.walletType)}
                  </span>
                </div>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  {formatAddress(addr.address)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Info */}
      <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-700">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-600 dark:text-blue-400">Primary Network:</span>
          <span className="text-blue-700 dark:text-blue-300 font-medium">
            {connections[0]?.network || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
