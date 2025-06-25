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

export class BalanceService {
  private providers: Map<string, ethers.providers.JsonRpcProvider> = new Map();
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 second

  private getProvider(network: Network): ethers.providers.JsonRpcProvider {
    if (!this.providers.has(network.id)) {
      console.log(`Creating provider for network: ${network.name} (${network.id})`);
      const provider = new ethers.providers.JsonRpcProvider(network.rpcUrl);
      this.providers.set(network.id, provider);
    }
    return this.providers.get(network.id)!;
  }

  /**
   * Retry function with exponential backoff
   */
  private async retry<T>(fn: () => Promise<T>, attempts: number = this.retryAttempts): Promise<T> {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        console.warn(`Attempt ${i + 1} failed, retrying in ${this.retryDelay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
    throw new Error('Max retry attempts reached');
  }

  /**
   * Get native token balance (BNB, ETH, MATIC, etc.)
   */
  async getNativeBalance(network: Network, address: string): Promise<{
    balance: string;
    balanceFormatted: string;
    value: number;
    valueFormatted: string;
  }> {
    console.log(`Fetching native balance for ${network.name} (${network.nativeCurrency.symbol})`);

    try {
      const provider = this.getProvider(network);

      const balance = await this.retry(async () => {
        const bal = await provider.getBalance(address);
        console.log(`Raw native balance for ${network.name}: ${bal.toString()}`);
        return bal;
      });

      const balanceFormatted = ethers.utils.formatEther(balance);
      console.log(`Formatted native balance for ${network.name}: ${balanceFormatted}`);

      // TODO: Get real price from API
      const price = this.getEstimatedPrice(network.nativeCurrency.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        balance: balance.toString(),
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`Native balance result for ${network.name}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting native balance for ${network.name}:`, error);
      return {
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  /**
   * Get ERC20/BEP20 token balance
   */
  async getTokenBalance(token: Token, address: string): Promise<BalanceInfo> {
    console.log(`Fetching token balance for ${token.symbol} on ${token.networkId}`);

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
        console.log(`Raw token balance for ${token.symbol}: ${bal.toString()}`);
        return bal;
      });

      const balanceFormatted = ethers.utils.formatUnits(balance, token.decimals);
      console.log(`Formatted token balance for ${token.symbol}: ${balanceFormatted}`);

      const price = token.price || this.getEstimatedPrice(token.symbol);
      const value = parseFloat(balanceFormatted) * price;

      const result = {
        token,
        balance: balance.toString(),
        balanceFormatted: formatBalance(balanceFormatted),
        value,
        valueFormatted: formatUSDValue(value),
      };

      console.log(`Token balance result for ${token.symbol}:`, result);
      return result;
    } catch (error) {
      console.error(`Error getting token balance for ${token.symbol}:`, error);
      return {
        token,
        balance: '0',
        balanceFormatted: '0',
        value: 0,
        valueFormatted: '$0.00',
      };
    }
  }

  /**
   * Get all balances for a specific network
   */
  async getNetworkBalances(network: Network, address: string): Promise<WalletBalances> {
    console.log(`Fetching all balances for network: ${network.name}`);

    try {
      // Get native balance
      const nativeBalance = await this.getNativeBalance(network, address);

      // Get token balances - use chainId instead of network.id
      const tokens = getTokensByNetwork(network.chainId);

      const tokenBalances = await Promise.all(
        tokens.map(token => this.getTokenBalance(token, address))
      );

      // Filter out zero balances for cleaner display
      // const nonZeroTokenBalances = tokenBalances.filter(
      //   token => parseFloat(token.balance) > 0
      // );

      // Calculate total value
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

      console.log(`Network balances result for ${network.name}:`, {
        nativeBalance: result.nativeBalanceFormatted,
        tokenCount: result.tokenBalances.length,
        totalValue: result.totalValueFormatted,
      });

      return result;
    } catch (error) {
      console.error(`Error getting network balances for ${network.name}:`, error);
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

  /**
   * Get balances for all supported networks
   */
  async getAllBalances(address: string): Promise<WalletBalances[]> {
    console.log(`Fetching all balances for address: ${address}`);
    console.log(`Supported networks:`, SUPPORTED_NETWORKS.map(n => n.name));

    const balances = await Promise.all(
      SUPPORTED_NETWORKS.map(network => this.getNetworkBalances(network, address))
    );

    // Filter networks with any balance (native or tokens)
    // const networksWithBalance = balances.filter(balance => {
    //   const hasNativeBalance = parseFloat(balance.nativeBalance) > 0;
    //   const hasTokenBalance = balance.tokenBalances.some(token => parseFloat(token.balance) > 0);
    //   return hasNativeBalance || hasTokenBalance;
    // });

    const networksWithBalance = balances;

    console.log(`Networks with balance: ${networksWithBalance.length}/${balances.length}`);
    return networksWithBalance;
  }

  /**
   * Get total portfolio value across all networks
   */
  async getTotalPortfolioValue(address: string): Promise<{
    totalValue: number;
    totalValueFormatted: string;
    networkCount: number;
  }> {
    const allBalances = await this.getAllBalances(address);
    const totalValue = allBalances.reduce((sum, network) => sum + network.totalValue, 0);

    const result = {
      totalValue,
      totalValueFormatted: formatUSDValue(totalValue),
      networkCount: allBalances.length,
    };

    console.log(`Total portfolio value:`, result);
    return result;
  }

  /**
   * Get estimated price for tokens (placeholder - should be replaced with real API)
   */
  private getEstimatedPrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BNB': 300, // Example price
      'ETH': 2500, // Example price
      'USDT': 1.00,
      'USDC': 1.00,
      'BUSD': 1.00,
    };

    const price = prices[symbol] || 0;
    console.log(`Estimated price for ${symbol}: $${price}`);
    return price;
  }

  /**
   * Switch network in wallet
   */
  async switchNetwork(network: Network): Promise<void> {
    console.log(`Switching to network: ${network.name}`);

    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: network.chainId }],
        });
        console.log(`Successfully switched to ${network.name}`);
      } else {
        throw new Error('MetaMask or compatible wallet not found');
      }
    } catch (error) {
      console.error(`Error switching to network ${network.name}:`, error);
      throw error;
    }
  }

  /**
   * Add network to wallet if not exists
   */
  async addNetwork(network: Network): Promise<void> {
    console.log(`Adding network to wallet: ${network.name}`);

    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: network.chainId,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorerUrl],
          }],
        });
        console.log(`Successfully added ${network.name} to wallet`);
      } else {
        throw new Error('MetaMask or compatible wallet not found');
      }
    } catch (error) {
      console.error(`Error adding network ${network.name}:`, error);
      throw error;
    }
  }

  /**
   * Get specific token balance by symbol and network
   */
  async getTokenBalanceBySymbol(symbol: string, networkId: string, address: string): Promise<BalanceInfo | null> {
    const tokens = this.getSupportedTokens(networkId);
    const token = tokens.find(t => t.symbol === symbol);

    if (!token) {
      console.warn(`Token ${symbol} not found on network ${networkId}`);
      return null;
    }

    return await this.getTokenBalance(token, address);
  }

  /**
   * Get all tokens for a specific network
   */
  getSupportedTokens(networkId: string): Token[] {
    // networkId can be either network.id or chainId, try both
    const tokensById = getTokensByNetwork(networkId);
    if (tokensById.length > 0) {
      return tokensById;
    }

    // If no tokens found by id, try to find network by id and use its chainId
    const network = SUPPORTED_NETWORKS.find(n => n.id === networkId);
    if (network) {
      return getTokensByNetwork(network.chainId);
    }

    return [];
  }

  /**
   * Get all supported networks
   */
  getSupportedNetworks(): Network[] {
    return SUPPORTED_NETWORKS;
  }
}

// Export singleton instance
export const balanceService = new BalanceService();
