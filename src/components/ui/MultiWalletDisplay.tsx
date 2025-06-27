import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import Button from './Button';

interface MultiWalletDisplayProps {
  className?: string;
}

const MultiWalletDisplay: React.FC<MultiWalletDisplayProps> = ({ className }) => {
  const { t } = useTranslation();
  const {
    isConnected,
    connections,
    isConnecting,
    connectWallet,
    disconnectConnection,
    getAllAddresses,
  } = useWallet(false);

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (walletType: string) => {
    switch (walletType) {
      case 'metamask':
        return '🦊';
      case 'owallet':
        return '🔵';
      case 'keplr':
        return '🔷';
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
      case 'keplr':
        return 'Keplr';
      default:
        return 'Wallet';
    }
  };

  const getChainIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
      case 'mainnet':
        return '🔷';
      case 'bsc':
      case 'binance':
        return '🟡';
      case 'polygon':
        return '🟣';
      case 'oraichain':
        return '🔵';
      case 'cosmoshub':
        return '🔶';
      case 'osmosis':
        return '🟠';
      default:
        return '⭕';
    }
  };

  const handleConnectEVM = async (walletType: 'metamask' | 'owallet') => {
    try {
      await connectWallet(walletType);
    } catch (error) {
      console.error('Failed to connect EVM wallet:', error);
    }
  };

  const handleConnectCosmos = async () => {
    try {
      await connectWallet('owallet', 'Oraichain');
    } catch (error) {
      console.error('Failed to connect Cosmos wallet:', error);
    }
  };

  const handleDisconnect = (type: 'evm' | 'cosmos', walletType: string) => {
    disconnectConnection(type, walletType);
  };

  const allAddresses = getAllAddresses();

  if (!isConnected && connections.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('wallet.connectWallets')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('wallet.connectMultipleWallets')}
          </p>
        </div>

        {/* EVM Wallets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            EVM Wallets
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={() => handleConnectEVM('metamask')}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🦊</span>
              <span>Connect MetaMask</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConnectEVM('owallet')}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Connect OWallet (EVM)</span>
            </Button>
          </div>
        </div>

        {/* Cosmos Wallets */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Cosmos Wallets
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              onClick={handleConnectCosmos}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Connect OWallet (Cosmos)</span>
            </Button>
          </div>
        </div>

        {isConnecting && (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Connecting...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('wallet.connectedWallets')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {connections.length} wallet{connections.length !== 1 ? 's' : ''} connected
        </p>
      </div>

      {/* EVM Addresses */}
      {allAddresses.evm.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
            <span>🔷</span>
            <span>EVM Addresses</span>
          </h4>
          <div className="space-y-2">
            {allAddresses.evm.map((addr, index) => (
              <div
                key={`${addr.walletType}-${addr.chainId}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span>{getWalletIcon(addr.walletType)}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getWalletName(addr.walletType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{getChainIcon(addr.network)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {addr.network}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {formatAddress(addr.address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect('evm', addr.walletType)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cosmos Addresses */}
      {allAddresses.cosmos.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
            <span>🔶</span>
            <span>Cosmos Addresses</span>
          </h4>
          <div className="space-y-2">
            {allAddresses.cosmos.map((addr, index) => (
              <div
                key={`${addr.walletType}-${addr.chainId}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span>{getWalletIcon(addr.walletType)}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getWalletName(addr.walletType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>{getChainIcon(addr.network)}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {addr.network}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {formatAddress(addr.address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect('cosmos', addr.walletType)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connect More Wallets */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Connect More Wallets
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {!allAddresses.evm.some(addr => addr.walletType === 'metamask') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnectEVM('metamask')}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🦊</span>
              <span>Add MetaMask</span>
            </Button>
          )}
          {!allAddresses.evm.some(addr => addr.walletType === 'owallet') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConnectEVM('owallet')}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Add OWallet (EVM)</span>
            </Button>
          )}
          {!allAddresses.cosmos.some(addr => addr.walletType === 'owallet') && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleConnectCosmos}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-2"
            >
              <span>🔵</span>
              <span>Add OWallet (Cosmos)</span>
            </Button>
          )}
        </div>
      </div>

      {isConnecting && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Connecting...
        </div>
      )}
    </div>
  );
};

export default MultiWalletDisplay;
