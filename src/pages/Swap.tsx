import React, { useEffect, useState } from 'react';
import SwapCard from '../components/swap/SwapCard';
import SwapHeader from '../components/swap/SwapHeader';

const Swap: React.FC = () => {
  const [fromToken, setFromToken] = useState('');
  const [toToken, setToToken] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');

  const handleFromAmountChange = (amount: string) => {
    setFromAmount(amount);
    setToAmount((parseFloat(amount)).toFixed(2));
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <SwapHeader />

      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-md">
          <SwapCard
            fromToken={fromToken}
            toToken={toToken}
            fromAmount={fromAmount}
            toAmount={toAmount}
            onFromTokenChange={setFromToken}
            onToTokenChange={setToToken}
            onFromAmountChange={handleFromAmountChange}
            onSwapTokens={handleSwapTokens}
          />
        </div>
      </div>
    </div>
  );
};

export default Swap;
