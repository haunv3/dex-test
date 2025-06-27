import { useState, useEffect, useCallback } from 'react';
import { balanceService, type WalletBalances } from '../services/balanceService';
import { useWallet } from './useWallet';

export interface UseBalanceReturn {
  balances: WalletBalances[];
  totalValue: number;
  totalValueFormatted: string;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useBalance = (): UseBalanceReturn => {
  const { isConnected, connections, getAllAddresses } = useWallet();
  const [balances, setBalances] = useState<WalletBalances[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalValueFormatted, setTotalValueFormatted] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || connections.length === 0) {
      console.log('No wallets connected');
      setBalances([]);
      setTotalValue(0);
      setTotalValueFormatted('$0.00');
      setError(null);
      setLastUpdated(null);
      return;
    }

    console.log(`Fetching balances for ${connections.length} connected wallets`);
    setIsLoading(true);
    setError(null);

    try {
      const allAddresses = getAllAddresses();
      let allBalances: WalletBalances[] = [];
      let totalPortfolioValue = 0;

      // Fetch balances for EVM wallets
      if (allAddresses.evm.length > 0) {
        for (const evmAddress of allAddresses.evm) {
          console.log(`Fetching EVM balances for address: ${evmAddress.address}`);
          const evmBalances = await balanceService.getAllBalances(evmAddress.address, 'evm');
          const evmPortfolio = await balanceService.getTotalPortfolioValue(evmAddress.address, 'evm');

          allBalances = [...allBalances, ...evmBalances];
          totalPortfolioValue += evmPortfolio.totalValue;
        }
      }

      // Fetch balances for Cosmos wallets
      if (allAddresses.cosmos.length > 0) {
        for (const cosmosAddress of allAddresses.cosmos) {
          console.log(`Fetching Cosmos balances for address: ${cosmosAddress.address}`);
          const cosmosBalances = await balanceService.getAllBalances(cosmosAddress.address, 'cosmos');
          const cosmosPortfolio = await balanceService.getTotalPortfolioValue(cosmosAddress.address, 'cosmos');

          allBalances = [...allBalances, ...cosmosBalances];
          totalPortfolioValue += cosmosPortfolio.totalValue;
        }
      }

      console.log('All balances fetched successfully:', allBalances);

      setBalances(allBalances);
      setTotalValue(totalPortfolioValue);
      setTotalValueFormatted(`$${totalPortfolioValue.toFixed(2)}`);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Error fetching balances:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      setBalances([]);
      setTotalValue(0);
      setTotalValueFormatted('$0.00');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, connections, getAllAddresses]);

  // Fetch balances when wallet connections change
  useEffect(() => {
    console.log(`Wallet connections changed - isConnected: ${isConnected}, connections: ${connections.length}`);
    fetchBalances();
  }, [isConnected, connections, fetchBalances]);

  const refreshBalances = useCallback(async () => {
    console.log('Manual balance refresh requested');
    await fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    totalValue,
    totalValueFormatted,
    isLoading,
    error,
    refreshBalances,
    lastUpdated,
  };
};
