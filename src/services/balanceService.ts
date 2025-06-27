import { ethers } from 'ethers';
import type { Network, Token } from '../constants/networks';
import {
  SUPPORTED_NETWORKS,
  SUPPORTED_TOKENS,
  ERC20_ABI,
  getNetworkByChainId,
  getTokensByNetwork
} from '../constants/networks';
import { formatBalance, formatUSDValue } from '../utils';

export interface BalanceInfo {
  token: Token;
  balance: string;
  balanceFormatted: string;
  value: number;
  valueFormatted: string;
}

export interface WalletBalances {
  network: Network;
  nativeBalance: string;
  nativeBalanceFormatted: string;
  nativeValue: number;
  nativeValueFormatted: string;
  tokenBalances: BalanceInfo[];
  totalValue: number;
  totalValueFormatted: string;
}

// Abstract base class for balance providers
export abstract class BalanceProvider {
  abstract getProvider(network: Network): any;
  abstract getNativeBalance(network: Network, address: string): Promise<{
    balance: string;
    balanceFormatted: string;
    value: number;
    valueFormatted: string;
  }>;
  abstract getTokenBalance(token: Token, address: string): Promise<BalanceInfo>;
  abstract getNetworkBalances(network: Network, address: string): Promise<WalletBalances>;
}

// EVM Balance Provider
export class EVMBalanceProvider extends BalanceProvider {
  private providers: Map<string, ethers.providers.JsonRpcProvider> = new Map();
  private retryAttempts = 3;
  private retryDelay = 1000;

  getProvider(network: Network): ethers.providers.JsonRpcProvider {
    if (!this.providers.has(network.id)) {
      console.log(`Creating EVM provider for network: ${network.name} (${network.id})`);
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      this.providers.set(network.id, provider);
    }
    return this.providers.get(network.id)!;
  }

  private async retry<T>(fn: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        console.warn(`EVM attempt ${i + 1} failed, retrying in ${this.retryDelay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
    throw new Error('Max retry attempts reached');
  }

  async getNativeBalance(network: Network, address: string): Promise<{
    balance: string;
    balanceFormatted: string;
    value: number;
    valueFormatted: string;
  }> {
    console.log(`Fetching EVM native balance for ${network.name} (${network.nativeCurrency.symbol})`);

    try {
      const provider = this.getProvider(network);

      const balance = await this.retry(async () => {
        const bal = await provider.getBalance(address);
        console.log(`Raw EVM native balance for ${network.name}: ${bal.toString()}`);
        return bal;
      });

      const balanceFormatted = ethers.utils.formatEther(balance);
      console.log(`Formatted EVM native balance for ${network.name}: ${balanceFormatted}`);

      const price = this.getEstimatedPrice(network.nativeCurrency.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        balance: balance.toString(),
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`EVM native balance result for ${network.name}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting EVM native balance for ${network.name}:`, error);
      return {
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  async getTokenBalance(token: Token, address: string): Promise<BalanceInfo> {
    console.log(`Fetching EVM token balance for ${token.symbol} on ${token.networkId}`);

    try {
      const network = getNetworkByChainId(token.networkId);
      console.log({
        network: network?.name,
        token: {
          symbol: token.symbol,
          contractAddress: token.contractAddress,
          decimals: token.decimals,
        },
        address,
      });

      if (!network) {
        throw new Error(`Network not found for token ${token.id} (networkId: ${token.networkId})`);
      }

      const provider = this.getProvider(network);
      const contract = new ethers.Contract(token.contractAddress, ERC20_ABI, provider);

      const balance = await this.retry(async () => {
        const bal = await contract.balanceOf(address);
        console.log(`Raw EVM token balance for ${token.symbol}: ${bal.toString()}`);
        return bal;
      });

      const balanceFormatted = ethers.utils.formatUnits(balance, token.decimals);
      console.log(`Formatted EVM token balance for ${token.symbol}: ${balanceFormatted}`);

      const price = token.price || this.getEstimatedPrice(token.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        token,
        balance: balance.toString(),
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`EVM token balance result for ${token.symbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting EVM token balance for ${token.symbol}:`, error);
      return {
        token,
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  async getNetworkBalances(network: Network, address: string): Promise<WalletBalances> {
    console.log(`Fetching EVM network balances for: ${network.name}`);

    try {
      const nativeBalance = await this.getNativeBalance(network, address);
      const tokens = getTokensByNetwork(network.chainId);

      const tokenBalances = await Promise.all(
        tokens.map(token => this.getTokenBalance(token, address))
      );

      const totalValue = nativeBalance.value + tokenBalances.reduce((sum, token) => sum + token.value, 0);

      const result = {
        network,
        nativeBalance: nativeBalance.balance,
        nativeBalanceFormatted: nativeBalance.balanceFormatted,
        nativeValue: nativeBalance.value,
        nativeValueFormatted: nativeBalance.valueFormatted,
        tokenBalances: tokenBalances,
        totalValue,
        totalValueFormatted: formatUSDValue(totalValue),
      };

      console.log(`EVM network balances result for ${network.name}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting EVM network balances for ${network.name}:`, error);
      return {
        network,
        nativeBalance: '0',
        nativeBalanceFormatted: '0',
        nativeValue: 0,
        nativeValueFormatted: '$0.00',
        tokenBalances: [],
        totalValue: 0,
        totalValueFormatted: '$0.00',
      };
    }
  }

  private getEstimatedPrice(symbol: string): number {
    // TODO: Replace with real price API
    const prices: { [key: string]: number } = {
      'BNB': 300,
      'ETH': 2000,
      'MATIC': 1,
      'USDT': 1,
      'USDC': 1,
      'DAI': 1,
    };
    return prices[symbol] || 0;
  }
}

// Cosmos Balance Provider
export class CosmosBalanceProvider extends BalanceProvider {
  private retryAttempts = 3;
  private retryDelay = 1000;

  getProvider(network: Network): any {
    // For Cosmos, we might use different providers like CosmJS
    // For now, we'll use a simple HTTP client
    return {
      getBalance: async (address: string) => {
        // TODO: Implement Cosmos balance fetching
        console.log(`Cosmos balance fetch for ${address} on ${network.name}`);
        return '0';
      }
    };
  }

  private async retry<T>(fn: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        console.warn(`Cosmos attempt ${i + 1} failed, retrying in ${this.retryDelay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
    throw new Error('Max retry attempts reached');
  }

  async getNativeBalance(network: Network, address: string): Promise<{
    balance: string;
    balanceFormatted: string;
    value: number;
    valueFormatted: string;
  }> {
    console.log(`Fetching Cosmos native balance for ${network.name} (${network.nativeCurrency.symbol})`);

    try {
      // TODO: Implement actual Cosmos balance fetching
      const balance = '0';
      const balanceFormatted = '0';
      const price = this.getEstimatedPrice(network.nativeCurrency.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        balance,
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`Cosmos native balance result for ${network.name}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting Cosmos native balance for ${network.name}:`, error);
      return {
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  async getTokenBalance(token: Token, address: string): Promise<BalanceInfo> {
    console.log(`Fetching Cosmos token balance for ${token.symbol} on ${token.networkId}`);

    try {
      // TODO: Implement actual Cosmos token balance fetching
      const balance = '0';
      const balanceFormatted = '0';
      const price = token.price || this.getEstimatedPrice(token.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        token,
        balance,
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`Cosmos token balance result for ${token.symbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting Cosmos token balance for ${token.symbol}:`, error);
      return {
        token,
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  async getNetworkBalances(network: Network, address: string): Promise<WalletBalances> {
    console.log(`Fetching Cosmos network balances for: ${network.name}`);

    try {
      const nativeBalance = await this.getNativeBalance(network, address);
      const tokens = getTokensByNetwork(network.chainId);

      const tokenBalances = await Promise.all(
        tokens.map(token => this.getTokenBalance(token, address))
      );

      const totalValue = nativeBalance.value + tokenBalances.reduce((sum, token) => sum + token.value, 0);

      const result = {
        network,
        nativeBalance: nativeBalance.balance,
        nativeBalanceFormatted: nativeBalance.balanceFormatted,
        nativeValue: nativeBalance.value,
        nativeValueFormatted: nativeBalance.valueFormatted,
        tokenBalances: tokenBalances,
        totalValue,
        totalValueFormatted: formatUSDValue(totalValue),
      };

      console.log(`Cosmos network balances result for ${network.name}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting Cosmos network balances for ${network.name}:`, error);
      return {
        network,
        nativeBalance: '0',
        nativeBalanceFormatted: '0',
        nativeValue: 0,
        nativeValueFormatted: '$0.00',
        tokenBalances: [],
        totalValue: 0,
        totalValueFormatted: '$0.00',
      };
    }
  }

  private getEstimatedPrice(symbol: string): number {
    // TODO: Replace with real price API
    const prices: { [key: string]: number } = {
      'ORAI': 5,
      'ATOM': 10,
      'OSMO': 1,
      'USDT': 1,
      'USDC': 1,
    };
    return prices[symbol] || 0;
  }
}

// Factory for creating balance providers
export class BalanceProviderFactory {
  static createProvider(walletType: 'evm' | 'cosmos'): BalanceProvider {
    switch (walletType) {
      case 'evm':
        return new EVMBalanceProvider();
      case 'cosmos':
        return new CosmosBalanceProvider();
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }
}

// Main Balance Service using abstract providers
export class BalanceService {
  private evmProvider: EVMBalanceProvider;
  private cosmosProvider: CosmosBalanceProvider;

  constructor() {
    this.evmProvider = new EVMBalanceProvider();
    this.cosmosProvider = new CosmosBalanceProvider();
  }

  /**
   * Get all balances for a specific network using appropriate provider
   */
  async getNetworkBalances(network: Network, address: string, walletType: 'evm' | 'cosmos'): Promise<WalletBalances> {
    const provider = BalanceProviderFactory.createProvider(walletType);
    return provider.getNetworkBalances(network, address);
  }

  /**
   * Get all balances for all supported networks
   */
  async getAllBalances(address: string, walletType: 'evm' | 'cosmos'): Promise<WalletBalances[]> {
    console.log(`Fetching all balances for ${walletType} wallet: ${address}`);

    try {
      const provider = BalanceProviderFactory.createProvider(walletType);
      const balances = await Promise.all(
        SUPPORTED_NETWORKS.map(network =>
          provider.getNetworkBalances(network, address)
        )
      );

      // Filter out networks with zero total value for cleaner display
      const nonZeroBalances = balances.filter(
        balance => balance.totalValue > 0
      );

      console.log(`Found ${nonZeroBalances.length} networks with balances for ${walletType} wallet`);
      return nonZeroBalances;
    } catch (error) {
      console.error(`Error getting all balances for ${walletType} wallet:`, error);
      return [];
    }
  }

  /**
   * Get total portfolio value across all networks
   */
  async getTotalPortfolioValue(address: string, walletType: 'evm' | 'cosmos'): Promise<{
    totalValue: number;
    totalValueFormatted: string;
    networkCount: number;
  }> {
    console.log(`Calculating total portfolio value for ${walletType} wallet: ${address}`);

    try {
      const allBalances = await this.getAllBalances(address, walletType);
      const totalValue = allBalances.reduce((sum, balance) => sum + balance.totalValue, 0);
      const networkCount = allBalances.length;

      const result = {
        totalValue,
        totalValueFormatted: formatUSDValue(totalValue),
        networkCount,
      };

      console.log(`Total portfolio value for ${walletType} wallet:`, result);
      return result;
    } catch (error) {
      console.error(`Error calculating total portfolio value for ${walletType} wallet:`, error);
      return {
        totalValue: 0,
        totalValueFormatted: '$0.00',
        networkCount: 0,
      };
    }
  }

  /**
   * Get balances for multiple wallet types
   */
  async getMultiWalletBalances(addresses: { evm?: string; cosmos?: string }): Promise<{
    evm: WalletBalances[];
    cosmos: WalletBalances[];
    totalValue: number;
    totalValueFormatted: string;
  }> {
    console.log('Fetching multi-wallet balances:', addresses);

    try {
      const [evmBalances, cosmosBalances] = await Promise.all([
        addresses.evm ? this.getAllBalances(addresses.evm, 'evm') : Promise.resolve([]),
        addresses.cosmos ? this.getAllBalances(addresses.cosmos, 'cosmos') : Promise.resolve([]),
      ]);

      const totalValue = [
        ...evmBalances,
        ...cosmosBalances
      ].reduce((sum, balance) => sum + balance.totalValue, 0);

      const result = {
        evm: evmBalances,
        cosmos: cosmosBalances,
        totalValue,
        totalValueFormatted: formatUSDValue(totalValue),
      };

      console.log('Multi-wallet balances result:', result);
      return result;
    } catch (error) {
      console.error('Error getting multi-wallet balances:', error);
      return {
        evm: [],
        cosmos: [],
        totalValue: 0,
        totalValueFormatted: '$0.00',
      };
    }
  }

  // Legacy methods for backward compatibility
  async switchNetwork(network: Network): Promise<void> {
    console.log(`Switching to network: ${network.name}`);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        console.log(`Successfully switched to ${network.name}`);
      }
    } catch (error: any) {
      console.error(`Error switching network: ${error.message}`);
      throw error;
    }
  }

  async addNetwork(network: Network): Promise<void> {
    console.log(`Adding network: ${network.name}`);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : [],
          }],
        });
        console.log(`Successfully added ${network.name}`);
      }
    } catch (error: any) {
      console.error(`Error adding network: ${error.message}`);
      throw error;
    }
  }

  async getTokenBalanceBySymbol(symbol: string, networkId: string, address: string, walletType: 'evm' | 'cosmos'): Promise<BalanceInfo | null> {
    console.log(`Getting token balance by symbol: ${symbol} on ${networkId} for ${walletType} wallet`);

    try {
      const tokens = getTokensByNetwork(networkId);
      const token = tokens.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());

      if (!token) {
        console.log(`Token not found: ${symbol} on ${networkId}`);
        return null;
      }

      const provider = BalanceProviderFactory.createProvider(walletType);
      return await provider.getTokenBalance(token, address);
    } catch (error) {
      console.error(`Error getting token balance by symbol: ${error}`);
      return null;
    }
  }

  getSupportedTokens(networkId: string): Token[] {
    return getTokensByNetwork(networkId);
  }

  getSupportedNetworks(): Network[] {
    return SUPPORTED_NETWORKS;
  }
}

// Export singleton instance
export const balanceService = new BalanceService();
