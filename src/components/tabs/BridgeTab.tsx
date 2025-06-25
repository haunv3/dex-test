import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { cn } from '../../utils';

interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  balance: number;
  price: number;
}

const BridgeTab: React.FC = () => {
  const { t } = useTranslation();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const tokens: Token[] = [
    {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      icon: '💵',
      balance: 1000.50,
      price: 1.00,
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: '🔷',
      balance: 2.5,
      price: 2500.00,
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      balance: 0.1,
      price: 45000.00,
    },
  ];

  const handleBridge = async () => {
    if (!fromToken || !toToken || !amount) return;

    setIsLoading(true);
    // Simulate bridge transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);

    // Reset form
    setAmount('');
    setFromToken(null);
    setToToken(null);
  };

  const estimatedAmount = fromToken && toToken && amount
    ? (parseFloat(amount) * fromToken.price / toToken.price).toFixed(6)
    : '0';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('bridge.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('bridge.subtitle')}
          </p>
        </div>

        {/* From Token Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('bridge.from')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {tokens.map((token) => (
              <button
                key={token.id}
                onClick={() => setFromToken(token)}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all',
                  fromToken?.id === token.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <span className="text-2xl">{token.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {token.balance.toFixed(4)} {token.symbol}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <Input
            label={t('bridge.amount')}
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!fromToken}
          />
          {fromToken && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('bridge.balance')}: {fromToken.balance.toFixed(4)} {fromToken.symbol}
            </div>
          )}
        </div>

        {/* To Token Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('bridge.to')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {tokens.filter(token => token.id !== fromToken?.id).map((token) => (
              <button
                key={token.id}
                onClick={() => setToToken(token)}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all',
                  toToken?.id === token.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <span className="text-2xl">{token.icon}</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {token.symbol}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {token.balance.toFixed(4)} {token.symbol}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated Amount */}
        {fromToken && toToken && amount && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('bridge.estimated')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {estimatedAmount} {toToken.symbol}
              </span>
            </div>
          </div>
        )}

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={!fromToken || !toToken || !amount || isLoading}
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? t('bridge.processing') : t('bridge.bridge')}
        </Button>

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('bridge.info')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default BridgeTab;
