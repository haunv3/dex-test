import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';
import Button from './Button';

interface WalletConnectProps {
  className?: string;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ className }) => {
  const { t } = useTranslation();
  const {
    isConnected,
    walletType,
    isConnecting,
    connectWallet,
    disconnectWallet,
    getCurrentAddress,
    getCurrentChainId,
    availableChains,
    switchKeplrChain,
  } = useWallet(false);

  const [showChainSelector, setShowChainSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnectWallet = async (walletType: 'metamask' | 'owallet') => {
    setError(null);
    try {
      console.log('Attempting to connect wallet:', walletType);

      if (walletType === 'owallet') {
        await connectWallet(walletType, 'noble-1'); // Default to Noble
      } else {
        await connectWallet(walletType);
      }

      console.log('Wallet connected successfully:', walletType);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);

      // Handle specific error messages
      let errorMessage = 'Failed to connect wallet';

      if (error.message.includes('not installed')) {
       if (walletType === 'metamask') {
          errorMessage = 'MetaMask is not installed. Please install MetaMask extension.';
        } else if (walletType === 'owallet') {
          errorMessage = 'OWallet is not installed. Please install OWallet extension.';
        }
      } else if (error.message.includes('No accounts found')) {
        errorMessage = 'No accounts found in wallet. Please add accounts to your wallet.';
      } else if (error.message.includes('User rejected')) {
        errorMessage = 'Connection was rejected by user.';
      } else if (error.message.includes('already pending')) {
        errorMessage = 'Connection request is already pending. Please check your wallet.';
      } else {
        errorMessage = error.message || 'Failed to connect wallet';
      }

      setError(errorMessage);

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSwitchChain = async (chainId: string) => {
    setError(null);
    try {
      await switchKeplrChain(chainId);
      setShowChainSelector(false);
    } catch (error: any) {
      console.error('Failed to switch chain:', error);
      setError(`Failed to switch to chain: ${chainId}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'metamask':
        return '🦊';
      case 'owallet':
        return '🟠';
      default:
        return '💳';
    }
  };

  const getWalletName = (type: string) => {
    switch (type) {
      case 'metamask':
        return 'MetaMask';
      case 'owallet':
        return 'OWallet';
      default:
        return 'Wallet';
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected) {
    const currentAddress = getCurrentAddress();
    const currentChainId = getCurrentChainId();

    return (
      <div className={`space-y-2 ${className}`}>
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-red-600 dark:text-red-400">⚠️</span>
              <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {/* Wallet Info */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <span className="text-lg">{getWalletIcon(walletType || '')}</span>
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {getWalletName(walletType || '')}
              </div>
              <div className="text-gray-500 dark:text-gray-400">
                {formatAddress(currentAddress || '')}
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={disconnectWallet}
          >
            Disconnect
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 dark:text-red-400">⚠️</span>
            <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        {/* MetaMask */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleConnectWallet('metamask')}
          disabled={isConnecting}
          className="flex items-center space-x-2"
        >
          <span>🦊</span>
          <span>MetaMask</span>
        </Button>

        {/* OWallet */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleConnectWallet('owallet')}
          disabled={isConnecting}
          className="flex items-center space-x-2"
        >
          <span>🟠</span>
          <span>OWallet</span>
        </Button>

        {isConnecting && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Connecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
