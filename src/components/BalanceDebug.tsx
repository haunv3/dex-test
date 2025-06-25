import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { balanceService } from '../services/balanceService';
import { SUPPORTED_NETWORKS, SUPPORTED_TOKENS } from '../constants/networks';
import { BalanceTest } from '../utils/balanceTest';
import { EthereumTest } from '../utils/ethereumTest';

const BalanceDebug: React.FC = () => {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleConnect = async () => {
    try {
      addLog('Connecting wallet...');
      await connectWallet('metamask');
      addLog('Wallet connected successfully');
    } catch (error) {
      addLog(`Failed to connect wallet: ${error}`);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    addLog('Wallet disconnected');
  };

  const handleTestConfig = () => {
    addLog('=== Testing Configuration ===');

    // Test networks
    addLog(`Supported networks: ${SUPPORTED_NETWORKS.length}`);
    SUPPORTED_NETWORKS.forEach(network => {
      addLog(`  ${network.name} (${network.chainId})`);
    });

    // Test tokens
    addLog(`Supported tokens: ${SUPPORTED_TOKENS.length}`);
    SUPPORTED_TOKENS.forEach(token => {
      addLog(`  ${token.symbol} on ${token.networkId}`);
    });

    // Test tokens by network
    addLog('\n=== Tokens by Network ===');
    SUPPORTED_NETWORKS.forEach(network => {
      const tokens = SUPPORTED_TOKENS.filter(token => token.networkId === network.chainId);
      addLog(`${network.name}: ${tokens.length} tokens`);
      tokens.forEach(token => {
        addLog(`  - ${token.symbol} (${token.contractAddress.slice(0, 10)}...)`);
      });
    });
  };

  const handleQuickTest = async () => {
    if (!address) {
      addLog('No address available');
      return;
    }

    try {
      addLog('Running quick test...');
      const success = await BalanceTest.quickTest(address);
      if (success) {
        addLog('Quick test passed ✅');
      } else {
        addLog('Quick test failed ❌');
      }
    } catch (error) {
      addLog(`Quick test error: ${error}`);
    }
  };

  const handleTestBalance = async () => {
    if (!address) {
      addLog('No address available');
      return;
    }

    try {
      addLog('=== Testing Balance Service ===');
      addLog(`Address: ${address}`);

      // Test 1: Check supported networks
      const networks = balanceService.getSupportedNetworks();
      addLog(`Supported networks: ${networks.length}`);

      // Test 2: Check tokens for each network
      networks.forEach(network => {
        const tokens = balanceService.getSupportedTokens(network.chainId);
        addLog(`${network.name} tokens: ${tokens.length}`);
      });

      // Test 3: Get all balances
      addLog('Fetching all balances...');
      const allBalances = await balanceService.getAllBalances(address);
      addLog(`Found ${allBalances.length} networks with balance`);

      // Debug: Check balance structure
      allBalances.forEach((networkBalance, index) => {
        addLog(`Network ${index + 1}: ${networkBalance.network.name}`);
        addLog(`  Native: ${networkBalance.nativeBalanceFormatted}`);
        addLog(`  Token count: ${networkBalance.tokenBalances.length}`);
        networkBalance.tokenBalances.forEach((tokenBalance, tokenIndex) => {
          addLog(`    Token ${tokenIndex + 1}: ${tokenBalance.token.symbol} (ID: ${tokenBalance.token.id})`);
          addLog(`      Balance: ${tokenBalance.balanceFormatted}`);
          addLog(`      Value: ${tokenBalance.valueFormatted}`);
        });
      });

      // Test 4: Get portfolio value
      addLog('Fetching portfolio value...');
      const portfolioValue = await balanceService.getTotalPortfolioValue(address);
      addLog(`Portfolio value: ${portfolioValue.totalValueFormatted}`);

      addLog('=== Test completed ===');

    } catch (error) {
      addLog(`Balance test failed: ${error}`);
    }
  };

  const handleTestEthereum = async () => {
    if (!address) {
      addLog('No address available');
      return;
    }

    try {
      addLog('=== Testing Ethereum Network ===');

      // Test Ethereum configuration first
      const configOk = EthereumTest.testEthereumConfig();
      if (!configOk) {
        addLog('Ethereum configuration test failed');
        return;
      }
      addLog('Ethereum configuration test passed');

      // Test Ethereum balances
      const success = await EthereumTest.testEthereumBalances(address);
      if (success) {
        addLog('Ethereum balance test passed ✅');
      } else {
        addLog('Ethereum balance test failed ❌');
      }

    } catch (error) {
      addLog(`Ethereum test failed: ${error}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Balance Debug
      </h2>

      {/* Connection Status */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Connection Status</p>
            <p className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            {address && (
              <p className="text-sm text-gray-500 font-mono">{address}</p>
            )}
          </div>
          <div className="space-x-2">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-4 space-x-2">
        <button
          onClick={handleTestConfig}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
        >
          Test Config
        </button>
        <button
          onClick={handleQuickTest}
          disabled={!isConnected}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Quick Test
        </button>
        <button
          onClick={handleTestBalance}
          disabled={!isConnected}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Full Test
        </button>
        <button
          onClick={handleTestEthereum}
          disabled={!isConnected}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          Ethereum Test
        </button>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
        >
          Clear Logs
        </button>
      </div>

      {/* Logs */}
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Run tests to see results.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BalanceDebug;
