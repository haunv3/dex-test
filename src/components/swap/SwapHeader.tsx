import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import { useWallet } from '../../hooks/useWallet';
import Button from '../ui/Button';
import MultiWalletDisplay from '../ui/MultiWalletDisplay';
import WalletAssetsModal from './WalletAssetsModal';
import i18n from '../../i18n';

const SwapHeader: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const {
    isConnected,
    connections,
    getAllAddresses,
    disconnectWallet
  } = useWallet();

  const [showMultiWalletModal, setShowMultiWalletModal] = useState(false);
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
      setShowMultiWalletModal(true);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowAssetsModal(false);
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

  const allAddresses = getAllAddresses();
  const totalConnections = connections.length;
  const primaryAddress = connections.length > 0 ? connections[0].address : null;
  const primaryWalletType = connections.length > 0 ? connections[0].walletType : null;

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
                  zken
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

              {/* Multi-Wallet Connect Button */}
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
                    {/* Show multiple wallet indicators */}
                    <div className="flex items-center space-x-1">
                      {connections.slice(0, 2).map((conn, index) => (
                        <span key={index} className="text-xs">
                          {getWalletIcon(conn.walletType)}
                        </span>
                      ))}
                      {connections.length > 2 && (
                        <span className="text-xs">+{connections.length - 2}</span>
                      )}
                    </div>
                    <span>{formatAddress(primaryAddress!)}</span>
                    {totalConnections > 1 && (
                      <span className="text-xs bg-white/20 px-1 rounded">
                        +{totalConnections - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  t('swap.connectWallet')
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Multi-Wallet Modal */}
      {showMultiWalletModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('wallet.connectWallets')}
                </h2>
                <button
                  onClick={() => setShowMultiWalletModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <MultiWalletDisplay />
            </div>
          </div>
        </div>
      )}

      {/* Wallet Assets Modal */}
      <WalletAssetsModal
        isOpen={showAssetsModal}
        onClose={() => setShowAssetsModal(false)}
        walletAddress={primaryAddress || ''}
        walletType={(primaryWalletType || 'metamask') as any}
        onDisconnect={handleDisconnect}
      />
    </>
  );
};

export default SwapHeader;
