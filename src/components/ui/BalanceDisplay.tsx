import React from 'react';
import { useBalance } from '../../hooks/useBalance';
import { getTokenById, getNetworkByChainId } from '../../constants/networks';
import { formatBalance, formatUSDValue } from '../../utils';

interface BalanceDisplayProps {
  tokenSymbol?: string;
  tokenId?: string;
  networkId?: string;
  showValue?: boolean;
  className?: string;
  showNetwork?: boolean;
  showLastUpdated?: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  tokenSymbol,
  tokenId,
  networkId,
  showValue = true,
  className = '',
  showNetwork = false,
  showLastUpdated = false,
}) => {
  const { balances, isLoading, error, lastUpdated } = useBalance();

  const getBalance = () => {
    if (isLoading) return { balance: '0', value: 0, network: null, tokenSymbol: '' };

    // If tokenId is provided, get token info first
    let targetToken = null;
    if (tokenId) {
      targetToken = getTokenById(tokenId);
      if (targetToken) {
        tokenSymbol = targetToken.symbol;
        console.log('BalanceDisplay: Found target token:', {
          id: targetToken.id,
          symbol: targetToken.symbol,
          networkId: targetToken.networkId
        });
      }
    }

    // Find the token balance
    for (const networkBalance of balances) {
      console.log('BalanceDisplay: Checking network:', {
        networkId: networkBalance.network.id,
        chainId: networkBalance.network.chainId,
        targetTokenNetworkId: targetToken?.networkId
      });

      // If networkId is specified, only look in that network
      if (networkId && networkBalance.network.id !== networkId) {
        console.log('BalanceDisplay: Skipping network - networkId mismatch');
        continue;
      }

      // If we have a targetToken, check if this is the right network
      if (targetToken && networkBalance.network.chainId !== targetToken.networkId) {
        console.log('BalanceDisplay: Skipping network - chainId mismatch');
        continue;
      }

      // Check native token
      if (networkBalance.network.nativeCurrency.symbol === tokenSymbol) {
        console.log('BalanceDisplay: Found native token balance');
        return {
          balance: networkBalance.nativeBalanceFormatted,
          value: networkBalance.nativeValue,
          network: networkBalance.network,
          tokenSymbol: networkBalance.network.nativeCurrency.symbol,
        };
      }

      // Check token balances - use token ID if available
      let tokenBalance = null;
      if (targetToken) {
        // Find by token ID (more specific)
        tokenBalance = networkBalance.tokenBalances.find(
          tb => tb.token.id === targetToken.id
        );
        if (tokenBalance) {
          console.log('BalanceDisplay: Found token by ID');
        }
      }

      if (!tokenBalance) {
        // Fallback to symbol matching
        tokenBalance = networkBalance.tokenBalances.find(
          tb => tb.token.symbol === tokenSymbol
        );
        if (tokenBalance) {
          console.log('BalanceDisplay: Found token by symbol');
        }
      }

      if (tokenBalance) {
        console.log('BalanceDisplay: Returning token balance:', {
          symbol: tokenBalance.token.symbol,
          id: tokenBalance.token.id,
          balance: tokenBalance.balanceFormatted
        });
        return {
          balance: tokenBalance.balanceFormatted,
          value: tokenBalance.value,
          network: networkBalance.network,
          tokenSymbol: tokenBalance.token.symbol,
        };
      }
    }

    console.log('BalanceDisplay: No balance found for token:', { tokenId, tokenSymbol });
    return { balance: '0', value: 0, network: null, tokenSymbol: tokenSymbol || '' };
  };

  const { balance, value, network, tokenSymbol: displaySymbol } = getBalance();

  if (isLoading) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>
        <span title={error}>Error loading balance</span>
      </div>
    );
  }

  const hasBalance = parseFloat(balance) > 0;

  return (
    <div className={`text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <span className={`${hasBalance ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {formatBalance(balance)} {displaySymbol}
        </span>

        {showValue && value > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            ({formatUSDValue(value)})
          </span>
        )}

        {showNetwork && network && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            on {network.name}
          </span>
        )}
      </div>

      {showLastUpdated && lastUpdated && hasBalance && (
        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
