import { useCallback, useEffect, useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "./useWallet";
import { useBalanceStore } from "../store";
import { useTokens } from "./useTokens";

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
];

export const useBalance = () => {
  const { connections, getEVMAddresses, getCosmosAddresses } = useWallet();
  const { allTokens } = useTokens();
  const {
    balances,
    lastUpdated,
    isLoading,
    updateBalance,
    updateBalances,
    setLoading,
    getBalance,
    getAllBalances,
  } = useBalanceStore();

  // Memoize token filtering to prevent unnecessary re-renders
  const exchainTokens = useMemo(
    () => allTokens.filter((token) => token.chainId === 20250626),
    [allTokens]
  );

  const nobleTokens = useMemo(
    () => allTokens.filter((token) => token.chainId === "noble-1" && token.coinGeckoId === 'usd-coin'),
    [allTokens]
  );

  const getExchainTokens = useCallback(() => {
    return exchainTokens;
  }, [exchainTokens]);

  const getNobleTokens = useCallback(() => {
    return nobleTokens;
  }, [nobleTokens]);

  const fetchEVMBalance = useCallback(
    async (address: string, tokenDenom: string, contractAddress?: string) => {
      try {
        setLoading(tokenDenom, true);

        const evmConnection = connections.find((conn) => conn.type === "evm");
        if (!evmConnection?.provider) {
          throw new Error("No EVM wallet connected");
        }

        const provider = evmConnection.provider;

        if (contractAddress) {
          // ERC20 token
          const contract = new ethers.Contract(
            contractAddress,
            ERC20_ABI,
            provider
          );
          const balance = await contract.balanceOf(address);
          // const decimals = await contract.decimals();
          // const formattedBalance = ethers.formatUnits(balance, decimals);
          updateBalance(tokenDenom, balance);
        } else {
          // Native token
          const balance = await provider.getBalance(address);
          // const formattedBalance = ethers.formatEther(balance);
          updateBalance(tokenDenom, balance.toString());
        }
      } catch (error) {
        console.error(`Error fetching EVM balance for ${tokenDenom}:`, error);
        updateBalance(tokenDenom, "0");
      } finally {
        setLoading(tokenDenom, false);
      }
    },
    [connections, setLoading, updateBalance]
  );

  // Fetch Cosmos balance (Noble)
  const fetchCosmosBalance = useCallback(
    async (address: string, tokenDenom: string, lcdUrl: string) => {
      try {
        setLoading(tokenDenom, true);

        // Fetch balance using Cosmos RPC
        const response = await fetch(
          `${lcdUrl}/cosmos/bank/v1beta1/balances/${address}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const balance = data.balances?.find((b: any) => b.denom === tokenDenom);
        const amount = balance?.amount || "0";

        updateBalance(tokenDenom, amount);
      } catch (error) {
        console.error(
          `Error fetching Cosmos balance for ${tokenDenom}:`,
          error
        );
        updateBalance(tokenDenom, "0");
      } finally {
        setLoading(tokenDenom, false);
      }
    },
    [setLoading, updateBalance]
  );

  // Fetch all balances for connected wallets
  const fetchAllBalances = useCallback(async () => {
    const evmAddresses = getEVMAddresses();
    const cosmosAddresses = getCosmosAddresses();

    if (evmAddresses.length === 0 && cosmosAddresses.length === 0) {
      console.log("No wallets connected");
      return;
    }


    // Fetch Exchain balances
    for (const evmAddress of evmAddresses) {
      for (const token of exchainTokens) {
        await fetchEVMBalance(
          evmAddress.address,
          token.denom,
          token.contractAddress
        );
      }
    }

    // Fetch Noble balances
    const nobleKey = await window.owallet?.getKey("noble-1");
    if (!nobleKey) {
      throw new Error("No noble address found");
    }
    const bech32Address = nobleKey.bech32Address;

    for (const token of nobleTokens) {
      await fetchCosmosBalance(
        bech32Address,
        token.denom,
        // @ts-ignore
        token.lcd
      );
    }
  }, [
    getEVMAddresses,
    getCosmosAddresses,
    exchainTokens,
    nobleTokens,
    fetchEVMBalance,
    fetchCosmosBalance,
  ]);

  // Fetch balance for specific token
  const fetchTokenBalance = useCallback(
    async (tokenDenom: string) => {
      const token = allTokens.find((t) => t.denom === tokenDenom);
      if (!token) {
        console.error(`Token not found: ${tokenDenom}`);
        return;
      }

      const evmAddresses = getEVMAddresses();
      const cosmosAddresses = getCosmosAddresses();

      if (token.chainId === "20250626" || token.chainId === 20250626) {
        // Exchain token
        if (evmAddresses.length > 0) {
          await fetchEVMBalance(
            evmAddresses[0].address,
            token.denom,
            token.contractAddress
          );
        }
      } else if (token.chainId === "noble-1") {
        // Noble token
        if (cosmosAddresses.length > 0) {
          await fetchCosmosBalance(
            cosmosAddresses[0].address,
            token.denom,
            token.rpc || "https://noble-rpc.zken.com"
          );
        }
      }
    },
    [
      allTokens,
      getEVMAddresses,
      getCosmosAddresses,
      fetchEVMBalance,
      fetchCosmosBalance,
    ]
  );

  // Auto-refresh balances when wallet connections change
  useEffect(() => {
    if (connections.length > 0) {
      fetchAllBalances();
    }
  }, [connections, fetchAllBalances]);

  return {
    // State
    balances,
    lastUpdated,
    isLoading,

    // Actions
    fetchAllBalances,
    fetchTokenBalance,
    getBalance,
    getAllBalances,

    // Token helpers
    getExchainTokens,
    getNobleTokens,
  };
};
