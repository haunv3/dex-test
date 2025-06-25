import React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletType: 'metamask' | 'owallet') => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const { t } = useTranslation();

  const handleConnectMetaMask = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask connected:', accounts[0]);
        onConnect('metamask');
        onClose();
      } else {
        // MetaMask is not installed
        window.open('https://metamask.io/download/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const handleConnectOWallet = async () => {
    try {
      // Check if OWallet is installed
      if (typeof window.owallet !== 'undefined') {
        // Request account access
        const accounts = await window.owallet.request({ method: 'eth_requestAccounts' });
        console.log('OWallet connected:', accounts[0]);
        onConnect('owallet');
        onClose();
      } else {
        // OWallet is not installed
        window.open('https://owallet.app/', '_blank');
      }
    } catch (error) {
      console.error('Error connecting to OWallet:', error);
    }
  };

  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      description: 'Connect with MetaMask wallet',
      icon: '🦊',
      color: 'from-orange-400 to-orange-600',
      onClick: handleConnectMetaMask,
    },
    {
      id: 'owallet',
      name: 'OWallet',
      description: 'Connect with OWallet',
      icon: '🔵',
      color: 'from-blue-400 to-blue-600',
      onClick: handleConnectOWallet,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('wallet.connectWallet')}>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          {t('wallet.chooseWallet')}
        </p>

        <div className="space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={wallet.onClick}
              className="w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${wallet.color} flex items-center justify-center text-white text-xl`}>
                {wallet.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {wallet.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {wallet.description}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">{t('wallet.securityNote')}</p>
              <p className="mt-1">{t('wallet.securityDescription')}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WalletConnectModal;
