import { balanceService } from '../services/balanceService';
import { SUPPORTED_NETWORKS, SUPPORTED_TOKENS } from '../constants/networks';

/**
 * Test utility for balance system
 */
export class BalanceTest {
  /**
   * Test all networks and tokens configuration
   */
  static testConfiguration() {
    console.log('=== Testing Balance System Configuration ===');

    // Test networks
    console.log(`\n📡 Networks (${SUPPORTED_NETWORKS.length}):`);
    SUPPORTED_NETWORKS.forEach(network => {
      console.log(`  ${network.icon} ${network.name} (${network.chainId})`);
    });

    // Test tokens by network
    console.log(`\n🪙 Tokens (${SUPPORTED_TOKENS.length}):`);
    SUPPORTED_NETWORKS.forEach(network => {
      const tokens = SUPPORTED_TOKENS.filter(token => token.networkId === network.chainId);
      console.log(`  ${network.icon} ${network.name}: ${tokens.length} tokens`);
      tokens.forEach(token => {
        console.log(`    ${token.icon} ${token.symbol} (${token.contractAddress.slice(0, 10)}...)`);
      });
    });

    console.log('\n✅ Configuration test completed');
  }

  /**
   * Test balance service with a sample address
   */
  static async testBalanceService(address: string) {
    console.log(`\n=== Testing Balance Service for ${address} ===`);

    try {
      // Test getting all balances
      console.log('\n📊 Fetching all balances...');
      const allBalances = await balanceService.getAllBalances(address);
      console.log(`Found ${allBalances.length} networks with balance`);

      allBalances.forEach(networkBalance => {
        console.log(`\n${networkBalance.network.icon} ${networkBalance.network.name}:`);
        console.log(`  Native: ${networkBalance.nativeBalanceFormatted} ${networkBalance.network.nativeCurrency.symbol}`);
        console.log(`  Tokens: ${networkBalance.tokenBalances.length}`);
        networkBalance.tokenBalances.forEach(token => {
          console.log(`    ${token.token.icon} ${token.token.symbol}: ${token.balanceFormatted}`);
        });
      });

      // Test portfolio value
      console.log('\n💰 Fetching portfolio value...');
      const portfolioValue = await balanceService.getTotalPortfolioValue(address);
      console.log(`Total portfolio value: ${portfolioValue.totalValueFormatted}`);

      console.log('\n✅ Balance service test completed');

    } catch (error) {
      console.error('❌ Balance service test failed:', error);
    }
  }

  /**
   * Quick test - just check if service is working
   */
  static async quickTest(address: string) {
    console.log('🚀 Quick balance test...');

    try {
      const balances = await balanceService.getAllBalances(address);
      console.log(`✅ Found ${balances.length} networks with balance`);
      return true;
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      return false;
    }
  }
}

/**
 * Quick test function for browser console
 */
export const quickTest = (address: string) => {
  console.log('Quick test for address:', address);
  BalanceTest.testBalanceService(address);
};

/**
 * Configuration test function for browser console
 */
export const configTest = () => {
  BalanceTest.testConfiguration();
};
