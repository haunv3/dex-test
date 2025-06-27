import React from 'react';
import { useTranslation } from 'react-i18next';
import MultiWalletDisplay from './ui/MultiWalletDisplay';
import { useWallet } from '../hooks/useWallet';
import Card from './ui/Card';

const MultiWalletDemo: React.FC = () => {
  const { t } = useTranslation();
  const {
    isConnected,
    connections,
    getAllAddresses,
  } = useWallet(false);

  const allAddresses = getAllAddresses();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Multi-Wallet Connection Demo
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Connect multiple wallets and view all addresses simultaneously
        </p>
      </div>

      {/* Multi-Wallet Display */}
      <Card>
        <MultiWalletDisplay />
      </Card>

      {/* Connection Status */}
      {isConnected && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total connections: {connections.length}
            </div>
          </div>
        </Card>
      )}

      {/* Address Details */}
      {isConnected && (allAddresses.evm.length > 0 || allAddresses.cosmos.length > 0) && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">All Connected Addresses</h2>
          <div className="space-y-4">
            {/* EVM Addresses */}
            {allAddresses.evm.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  EVM Addresses ({allAddresses.evm.length})
                </h3>
                <div className="space-y-2">
                  {allAddresses.evm.map((addr, index) => (
                    <div
                      key={`evm-${index}`}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {addr.walletType === 'metamask' ? '🦊' : '🔵'}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {addr.walletType === 'metamask' ? 'MetaMask' : 'OWallet'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Network: {addr.network} (Chain ID: {addr.chainId})
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                            {addr.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cosmos Addresses */}
            {allAddresses.cosmos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Cosmos Addresses ({allAddresses.cosmos.length})
                </h3>
                <div className="space-y-2">
                  {allAddresses.cosmos.map((addr, index) => (
                    <div
                      key={`cosmos-${index}`}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🔵</span>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              OWallet (Cosmos)
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Network: {addr.network} (Chain ID: {addr.chainId})
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                            {addr.address}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Connecting Wallets
            </h3>
            <ul className="space-y-1 ml-4">
              <li>• Click "Connect MetaMask" to connect your MetaMask wallet (EVM)</li>
              <li>• Click "Connect OWallet (EVM)" to connect OWallet for EVM chains</li>
              <li>• Click "Connect OWallet (Cosmos)" to connect OWallet for Cosmos chains</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Multiple Connections
            </h3>
            <ul className="space-y-1 ml-4">
              <li>• You can connect multiple wallets simultaneously</li>
              <li>• Each wallet type can be connected for different chain types</li>
              <li>• All addresses are displayed in organized sections</li>
              <li>• Click the "✕" button to disconnect individual wallets</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Supported Networks
            </h3>
            <ul className="space-y-1 ml-4">
              <li>• EVM: Ethereum, BSC, Polygon, and other EVM-compatible chains</li>
              <li>• Cosmos: Oraichain and other Cosmos SDK chains</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              🔗 Multi-Chain Support
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Connect to both EVM and Cosmos chains simultaneously
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">
              👥 Multiple Wallets
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Connect multiple wallet types at the same time
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
              📱 Responsive Design
            </h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Works seamlessly on desktop and mobile devices
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
              🔄 Real-time Updates
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Automatically detects wallet changes and updates
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MultiWalletDemo;
