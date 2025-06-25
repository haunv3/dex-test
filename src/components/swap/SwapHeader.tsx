import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import { useWallet } from '../../hooks/useWallet';
import Button from '../ui/Button';
import WalletConnectModal from './WalletConnectModal';
import WalletAssetsModal from './WalletAssetsModal';
import i18n from '../../i18n';

const SwapHeader: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const { isConnected, walletType, address, connectWallet, disconnectWallet } = useWallet();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState(false);

  const handleLanguageChange = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleConnectWallet = () => {
    if (isConnected) {
      setShowAssetsModal(true);
    } else {
      setShowConnectModal(true);
    }
  };

  const handleWalletConnect = async (walletType: 'metamask' | 'owallet') => {
    try {
      await connectWallet(walletType);
      setShowConnectModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // You could show a toast notification here
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowAssetsModal(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Swap tab */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OG</span>
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
                  Oraigold
                </h1>
              </div>

              {/* Swap tab */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button className="px-4 py-2 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-md text-sm font-medium shadow-sm">
                  {t('swap.swap')}
                </button>
                <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium">
                  {t('swap.liquidity')}
                </button>
              </div>
            </div>

            {/* Right side - Language, Theme, Connect Wallet */}
            <div className="flex items-center space-x-3">
              {/* Language toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLanguageChange}
                className="text-sm px-3 py-1.5"
              >
                {language === 'en' ? 'VI' : 'EN'}
              </Button>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-sm px-3 py-1.5"
              >
                {theme.mode === 'light' ? '🌙' : '☀️'}
              </Button>

              {/* Connect Wallet */}
              <Button
                variant="primary"
                size="sm"
                onClick={handleConnectWallet}
                className={`text-sm px-4 py-1.5 font-medium ${
                  isConnected
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white'
                }`}
              >
                {isConnected ? (
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${
                      walletType === 'metamask' ? 'bg-orange-400' : 'bg-blue-400'
                    }`} />
                    <span>{formatAddress(address!)}</span>
                  </div>
                ) : (
                  t('swap.connectWallet')
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleWalletConnect}
      />

      {/* Wallet Assets Modal */}
      <WalletAssetsModal
        isOpen={showAssetsModal}
        onClose={() => setShowAssetsModal(false)}
        walletAddress={address || ''}
        walletType={walletType || 'metamask'}
        onDisconnect={handleDisconnect}
      />
    </>
  );
};

export default SwapHeader;
