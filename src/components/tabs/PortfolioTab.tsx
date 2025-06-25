import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import { cn } from '../../utils';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: number;
  price: number;
  change24h: number;
  value: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'bridge' | 'swap';
  asset: string;
  amount: number;
  value: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

const PortfolioTab: React.FC = () => {
  const { t } = useTranslation();
  const [activeTimeframe, setActiveTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

  const assets: Asset[] = [
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      icon: '💵',
      balance: 1000.50,
      price: 1.00,
      change24h: 0.02,
      value: 1000.50,
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: '🔷',
      balance: 2.5,
      price: 2500.00,
      change24h: 3.5,
      value: 6250.00,
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      balance: 0.1,
      price: 45000.00,
      change24h: 2.1,
      value: 4500.00,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'bridge',
      asset: 'ETH',
      amount: 1.0,
      value: 2500.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'completed',
    },
    {
      id: '2',
      type: 'swap',
      asset: 'USDT',
      amount: 500.00,
      value: 500.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      status: 'completed',
    },
    {
      id: '3',
      type: 'buy',
      asset: 'BTC',
      amount: 0.05,
      value: 2250.00,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      status: 'completed',
    },
  ];

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange24h = assets.reduce((sum, asset) => sum + (asset.value * asset.change24h / 100), 0);

  const timeframes = ['1D', '1W', '1M', '3M', '1Y'] as const;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('portfolio.totalValue')}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${totalValue.toLocaleString()}
            </p>
            <div className={cn(
              'text-sm mt-2',
              totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {totalChange24h >= 0 ? '+' : ''}{totalChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('portfolio.assets')}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {assets.length}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('portfolio.activeAssets')}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('portfolio.transactions')}
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {transactions.length}
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t('portfolio.last30Days')}
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('portfolio.performance')}
          </h2>
          <div className="flex space-x-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setActiveTimeframe(timeframe)}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  activeTimeframe === timeframe
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* Placeholder Chart */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📈</div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('portfolio.chartPlaceholder')}
            </p>
          </div>
        </div>
      </Card>

      {/* Assets List */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('portfolio.assets')}
        </h2>

        <div className="space-y-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{asset.icon}</div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {asset.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {asset.balance.toFixed(4)} {asset.symbol}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  ${asset.value.toLocaleString()}
                </p>
                <p className={cn(
                  'text-sm',
                  asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('portfolio.recentTransactions')}
        </h2>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium',
                  tx.type === 'buy' ? 'bg-green-500' :
                  tx.type === 'sell' ? 'bg-red-500' :
                  tx.type === 'bridge' ? 'bg-blue-500' : 'bg-purple-500'
                )}>
                  {tx.type === 'buy' ? '📈' :
                   tx.type === 'sell' ? '📉' :
                   tx.type === 'bridge' ? '🌉' : '🔄'}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {tx.type} {tx.asset}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {tx.amount.toFixed(4)} {tx.asset}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ${tx.value.toLocaleString()}
                </p>
                <span className={cn(
                  'inline-block px-2 py-1 rounded-full text-xs font-medium',
                  tx.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                )}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PortfolioTab;
