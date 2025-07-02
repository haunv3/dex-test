import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useBalance } from '../../hooks/useBalance';
import { useTokens } from '../../hooks/useTokens';
import { useWallet } from '../../hooks/useWallet';
import type { TokenItemType } from '@oraichain/oraidex-common';

interface BalanceDisplayProps {
    className?: string;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = React.memo(({ className = '' }) => {
    const { t } = useTranslation();
    const { isConnected } = useWallet();
    const { allTokens } = useTokens();
    const {
        balances,
        isLoading,
        getBalance,
        getExchainTokens,
        getNobleTokens,
        fetchAllBalances,
    } = useBalance();

    const [showAllBalances, setShowAllBalances] = useState(false);

    // Memoize token arrays to prevent unnecessary re-renders
    const exchainTokens = useMemo(() => getExchainTokens(), [getExchainTokens]);
    const nobleTokens = useMemo(() => getNobleTokens(), [getNobleTokens]);

    const formatBalance = useCallback((balance: string, decimals: number = 6) => {
        const num = parseFloat(balance);
        if (isNaN(num)) return '0.00';

        if (num === 0) return '0.00';
        if (num < 0.0001) return '< 0.0001';

        return (num / 10 ** decimals).toFixed(6);
    }, []);

    const getTokenIcon = useCallback((token: TokenItemType) => {
        return token.icon || '🪙';
    }, []);

    const getNetworkIcon = useCallback((chainId: string | number) => {
        switch (chainId) {
            case 20250626:
                return '🟢';
            case 'noble-1':
                return '🔷';
            default:
                return '⭕';
        }
    }, []);

    const getNetworkName = useCallback((chainId: string | number) => {
        switch (chainId) {
            case 20250626:
                return 'Exchain';
            case 'noble-1':
                return 'Noble';
            default:
                return chainId;
        }
    }, []);

    const handleRefresh = useCallback(() => {
        fetchAllBalances();
    }, [fetchAllBalances]);

    const handleToggleShowAll = useCallback(() => {
        setShowAllBalances(prev => !prev);
    }, []);

    if (!isConnected) {
        return null;
    }

    const allSupportedTokens = [...exchainTokens, ...nobleTokens];
    const displayedTokens =
        showAllBalances ? allSupportedTokens : allSupportedTokens.slice(0, 3)


    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('balance.title', 'Wallet Balances')}
                </h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleRefresh}
                        disabled={Object.values(isLoading).some(Boolean)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                        title="Refresh balances"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    {allSupportedTokens.length > 3 && (
                        <button
                            onClick={handleToggleShowAll}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            {showAllBalances ? 'Show Less' : `Show All (${allSupportedTokens.length})`}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                {displayedTokens.map((token: TokenItemType) => {
                    const balance = getBalance(token.denom);
                    const loading = isLoading[token.denom];
                    const networkIcon = getNetworkIcon(token.chainId);
                    const networkName = getNetworkName(token.chainId);
                    console.log({balance});

                    return (
                        <div
                            key={token.denom}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm">{networkIcon}</span>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                        {token.name || token.denom}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {networkName} • {token.name || token.denom}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        <span className="text-sm text-gray-500">Loading...</span>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                            {formatBalance(balance, token.decimals)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {token.name || token.denom}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {displayedTokens.length === 0 && (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                        <div className="text-lg mb-2">💼</div>
                        <p>No supported tokens found</p>
                        <p className="text-sm">Connect your wallet to see balances</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {displayedTokens.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                            Total Tokens: {allSupportedTokens.length}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
});

BalanceDisplay.displayName = 'BalanceDisplay';

export default BalanceDisplay;
