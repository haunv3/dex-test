import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../../hooks/useWallet';

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
  const { connections, getAllAddresses, disconnectConnection } = useWallet();

  console.log('Wallet connections:', connections);

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

  if (!isOpen) return null;

  const allAddresses = getAllAddresses();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('wallet.assets')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Wallet Connections */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">{t('wallet.connections')}</h3>

          {connections.length === 0 ? (
            <p className="text-gray-500">{t('wallet.noConnections')}</p>
          ) : (
            <div className="space-y-3">
              {connections.map((connection, index) => (
                <div
                  key={`${connection.type}-${connection.walletType}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getWalletIcon(connection.walletType)}
                    </span>
                    <div>
                      <div className="font-medium">
                        {getWalletName(connection.walletType)} ({connection.type.toUpperCase()})
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatAddress(connection.address)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {connection.network} ({connection.chainId})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDisconnectSpecific(connection.type, connection.walletType)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    {t('wallet.disconnect')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Addresses Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">{t('wallet.addresses')}</h3>

          {allAddresses.evm.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-700 mb-2">EVM Addresses ({allAddresses.evm.length})</h4>
              {allAddresses.evm.map((addr, index) => (
                <div key={index} className="text-sm text-gray-600 mb-1">
                  {addr.walletType}: {formatAddress(addr.address)} ({addr.network})
                </div>
              ))}
            </div>
          )}

          {allAddresses.cosmos.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Cosmos Addresses ({allAddresses.cosmos.length})</h4>
              {allAddresses.cosmos.map((addr, index) => (
                <div key={index} className="text-sm text-gray-600 mb-1">
                  {addr.walletType}: {formatAddress(addr.address)} ({addr.network})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDisconnect}
            className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            {t('wallet.disconnectAll')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletAssetsModal;
