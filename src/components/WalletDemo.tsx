import React, { useState } from 'react';
import WalletConnect from './ui/WalletConnect';
import KeplrAccountSelector from './ui/KeplrAccountSelector';
import { useWallet } from '../hooks/useWallet';
import Card from './ui/Card';

const WalletDemo: React.FC = () => {
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
  } = useWallet(false); // Disable auto-connect for demo purposes

  const [selectedKeplrAccount, setSelectedKeplrAccount] = useState<string>('');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Wallet Connection Demo</h1>

      {/* Wallet Connect Component */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Connect Wallet</h2>
        <WalletConnect />
      </Card>

      {/* Wallet Info */}
      {isConnected && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Wallet Type
                </label>
                <p className="text-gray-900 dark:text-gray-100">{walletType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address
                </label>
                <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">
                  {getCurrentAddress()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chain ID
                </label>
                <p className="text-gray-900 dark:text-gray-100">{getCurrentChainId()}</p>
              </div>
            </div>

            {/* Keplr Account Selector */}
            {walletType === 'keplr' && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Select Account
                </label>
                <KeplrAccountSelector onAccountSelect={setSelectedKeplrAccount} />
                {selectedKeplrAccount && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Selected: {selectedKeplrAccount}
                  </p>
                )}
              </div>
            )}

            {/* Available Chains for Keplr */}
            {walletType === 'keplr' && availableChains && availableChains.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Available Chains
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableChains.map((chainId) => (
                    <span
                      key={chainId}
                      className={`px-2 py-1 text-xs rounded-full ${
                        getCurrentChainId() === chainId
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {chainId}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">MetaMask</h3>
            <p>Click MetaMask button to connect your MetaMask wallet</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">OWallet</h3>
            <p>Click OWallet button to connect your OWallet</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Keplr</h3>
            <p>
              Click Keplr button to connect your Keplr wallet.
              By default, it will connect to Noble chain (noble-1).
              You can switch between different chains and select different accounts.
            </p>
          </div>
        </div>
      </Card>

      {/* Features */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>✅ Support for MetaMask, OWallet, and Keplr</li>
          <li>✅ Automatic wallet detection on page load</li>
          <li>✅ Chain switching for Keplr</li>
          <li>✅ Account selection for Keplr</li>
          <li>✅ Address formatting and display</li>
          <li>✅ Dark mode support</li>
          <li>✅ Responsive design</li>
        </ul>
      </Card>
    </div>
  );
};

export default WalletDemo;
