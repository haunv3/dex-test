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
  const { isConnected, address } = useWallet();
  const [balances, setBalances] = useState<WalletBalances[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalValueFormatted, setTotalValueFormatted] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address) {
      console.log('Wallet not connected or no address');
      setBalances([]);
      setTotalValue(0);
      setTotalValueFormatted('$0.00');
      setError(null);
      setLastUpdated(null);
      return;
    }

    console.log(`Fetching balances for address: ${address}`);
    setIsLoading(true);
    setError(null);

    try {
      const allBalances = await balanceService.getAllBalances(address);
      const portfolioValue = await balanceService.getTotalPortfolioValue(address);

      console.log('Balances fetched successfully:', allBalances);

      setBalances(allBalances);
      setTotalValue(portfolioValue.totalValue);
      setTotalValueFormatted(portfolioValue.totalValueFormatted);
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
  }, [isConnected, address]);

  // Fetch balances when wallet connection changes
  useEffect(() => {
    console.log(`Wallet connection changed - isConnected: ${isConnected}, address: ${address}`);
    fetchBalances();
  }, [isConnected, address, fetchBalances]);

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
