import { balanceService } from '../services/balanceService';
import { SUPPORTED_NETWORKS, SUPPORTED_TOKENS } from '../constants/networks';

/**
 * Test utility specifically for Ethereum network
 */
export class EthereumTest {
  /**
   * Test Ethereum network configuration
   */
  static testEthereumConfig() {
    console.log('=== Testing Ethereum Configuration ===');

    // Find Ethereum network
    const ethereumNetwork = SUPPORTED_NETWORKS.find(n => n.id === 'ethereum');
    if (!ethereumNetwork) {
      console.error('❌ Ethereum network not found in configuration');
      return false;
    }

    console.log('✅ Ethereum network found:', {
      name: ethereumNetwork.name,
      chainId: ethereumNetwork.chainId,
      rpcUrl: ethereumNetwork.rpcUrl,
      nativeCurrency: ethereumNetwork.nativeCurrency.symbol
    });

    // Find Ethereum tokens
    const ethereumTokens = SUPPORTED_TOKENS.filter(token => token.networkId === ethereumNetwork.chainId);
    console.log(`✅ Found ${ethereumTokens.length} tokens on Ethereum:`);
    ethereumTokens.forEach(token => {
      console.log(`  ${token.symbol}: ${token.contractAddress}`);
    });

    return true;
  }

  /**
   * Test Ethereum balance fetching
   */
  static async testEthereumBalances(address: string) {
    console.log(`\n=== Testing Ethereum Balances for ${address} ===`);

    try {
      // Find Ethereum network
      const ethereumNetwork = SUPPORTED_NETWORKS.find(n => n.id === 'ethereum');
      if (!ethereumNetwork) {
        throw new Error('Ethereum network not found');
      }

      // Test native ETH balance
      console.log('\n🔷 Testing ETH balance...');
      const ethBalance = await balanceService.getNativeBalance(ethereumNetwork, address);
      console.log('ETH balance result:', {
        balance: ethBalance.balanceFormatted,
        value: ethBalance.valueFormatted
      });

      // Test USDT balance on Ethereum
      console.log('\n💵 Testing USDT balance on Ethereum...');
      const usdtBalance = await balanceService.getTokenBalanceBySymbol('USDT', '0x01', address);
      if (usdtBalance) {
        console.log('USDT balance result:', {
          balance: usdtBalance.balanceFormatted,
          value: usdtBalance.valueFormatted
        });
      } else {
        console.log('USDT balance: Not found or zero');
      }

      // Test network balances
      console.log('\n📊 Testing full network balances...');
      const networkBalances = await balanceService.getNetworkBalances(ethereumNetwork, address);
      console.log('Network balances result:', {
        nativeBalance: networkBalances.nativeBalanceFormatted,
        tokenCount: networkBalances.tokenBalances.length,
        totalValue: networkBalances.totalValueFormatted
      });

      console.log('\n✅ Ethereum balance test completed');
      return true;

    } catch (error) {
      console.error('❌ Ethereum balance test failed:', error);
      return false;
    }
  }

  /**
   * Quick Ethereum test
   */
  static async quickEthereumTest(address: string) {
    console.log('🚀 Quick Ethereum test...');

    try {
      const ethereumNetwork = SUPPORTED_NETWORKS.find(n => n.id === 'ethereum');
      if (!ethereumNetwork) {
        console.error('Ethereum network not found');
        return false;
      }

      const networkBalances = await balanceService.getNetworkBalances(ethereumNetwork, address);
      console.log(`✅ Ethereum test passed - Total value: ${networkBalances.totalValueFormatted}`);
      return true;
    } catch (error) {
      console.error('❌ Quick Ethereum test failed:', error);
      return false;
    }
  }
}

/**
 * Quick test functions for browser console
 */
export const testEthereumConfig = () => {
  EthereumTest.testEthereumConfig();
};

export const testEthereumBalances = (address: string) => {
  EthereumTest.testEthereumBalances(address);
};

export const quickEthereumTest = (address: string) => {
  EthereumTest.quickEthereumTest(address);
};
