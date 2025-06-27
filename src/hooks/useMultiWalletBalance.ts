import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { balanceService, type WalletBalances } from '../services/balanceService';
import { useWallet } from './useWallet';

export interface MultiWalletBalanceReturn {
  evmBalances: WalletBalances[];
  cosmosBalances: WalletBalances[];
  totalValue: number;
  totalValueFormatted: string;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  lastUpdated: Date | null;
  walletCounts: {
    evm: number;
    cosmos: number;
    total: number;
  };
}

export const useMultiWalletBalance = (): MultiWalletBalanceReturn => {
  const { isConnected, connections, getAllAddresses } = useWallet();
  const [evmBalances, setEvmBalances] = useState<WalletBalances[]>([]);
  const [cosmosBalances, setCosmosBalances] = useState<WalletBalances[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalValueFormatted, setTotalValueFormatted] = useState('$0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Use ref to prevent unnecessary re-renders
  const lastFetchRef = useRef<{
    isConnected: boolean;
    connectionCount: number;
    addresses: { evm?: string; cosmos?: string };
  } | null>(null);

  // Memoize addresses to prevent unnecessary re-renders
  const addresses = useMemo(() => {
    if (!isConnected || connections.length === 0) {
      return { evm: undefined, cosmos: undefined };
    }

    const allAddresses = getAllAddresses();
    return {
      evm: allAddresses.evm.length > 0 ? allAddresses.evm[0].address : undefined,
      cosmos: allAddresses.cosmos.length > 0 ? allAddresses.cosmos[0].address : undefined,
    };
  }, [isConnected, connections.length, getAllAddresses]);

  // Memoize connection count to prevent unnecessary re-renders
  const connectionCount = useMemo(() => connections.length, [connections.length]);

  const fetchBalances = useCallback(async () => {
    // Check if we need to fetch (prevent duplicate fetches)
    const currentState = {
      isConnected,
      connectionCount,
      addresses,
    };

    if (lastFetchRef.current &&
        lastFetchRef.current.isConnected === currentState.isConnected &&
        lastFetchRef.current.connectionCount === currentState.connectionCount &&
        lastFetchRef.current.addresses.evm === currentState.addresses.evm &&
        lastFetchRef.current.addresses.cosmos === currentState.addresses.cosmos) {
      console.log('Skipping fetch - no changes detected');
      return;
    }

    if (!isConnected || connectionCount === 0) {
      console.log('No wallets connected');
      setEvmBalances([]);
      setCosmosBalances([]);
      setTotalValue(0);
      setTotalValueFormatted('$0.00');
      setError(null);
      setLastUpdated(null);
      lastFetchRef.current = currentState;
      return;
    }

    console.log(`Fetching multi-wallet balances for ${connectionCount} connections`);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching balances for addresses:', addresses);

      const multiWalletResult = await balanceService.getMultiWalletBalances(addresses);

      console.log('Multi-wallet balances fetched successfully:', multiWalletResult);

      setEvmBalances(multiWalletResult.evm);
      setCosmosBalances(multiWalletResult.cosmos);
      setTotalValue(multiWalletResult.totalValue);
      setTotalValueFormatted(multiWalletResult.totalValueFormatted);
      setLastUpdated(new Date());

      // Update last fetch ref
      lastFetchRef.current = currentState;

    } catch (err) {
      console.error('Error fetching multi-wallet balances:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      setEvmBalances([]);
      setCosmosBalances([]);
      setTotalValue(0);
      setTotalValueFormatted('$0.00');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, connectionCount, addresses]);

  // Fetch balances when wallet connections change
  useEffect(() => {
    console.log(`Wallet connections changed - isConnected: ${isConnected}, connections: ${connectionCount}`);
    fetchBalances();
  }, [isConnected, connectionCount, fetchBalances]);

  const refreshBalances = useCallback(async () => {
    console.log('Manual multi-wallet balance refresh requested');
    // Clear last fetch ref to force a new fetch
    lastFetchRef.current = null;
    await fetchBalances();
  }, [fetchBalances]);

  // Memoize wallet counts to prevent unnecessary re-renders
  const walletCounts = useMemo(() => ({
    evm: evmBalances.length,
    cosmos: cosmosBalances.length,
    total: evmBalances.length + cosmosBalances.length,
  }), [evmBalances.length, cosmosBalances.length]);

  return {
    evmBalances,
    cosmosBalances,
    totalValue,
    totalValueFormatted,
    isLoading,
    error,
    refreshBalances,
    lastUpdated,
    walletCounts,
  };
};
