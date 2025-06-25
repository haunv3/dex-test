import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';
import Button from '../ui/Button';
import BalanceDisplay from '../ui/BalanceDisplay';
import { ethers } from 'ethers';
import { Bridge__factory, USDT_BSC_CONTRACT, toAmount as toAmountCommon } from '@oraichain/oraidex-common';
import { getTokenById } from '../../constants/networks';

interface SwapCardProps {
  fromToken: string; // This should be token.id now
  toToken: string; // This should be token.id now
  fromAmount: string;
  toAmount: string;
  onFromTokenChange: (tokenId: string) => void;
  onToTokenChange: (tokenId: string) => void;
  onFromAmountChange: (amount: string) => void;
  onSwapTokens: () => void;
}

const SwapCard: React.FC<SwapCardProps> = ({
  fromToken,
  toToken,
  fromAmount,
  toAmount,
  onFromTokenChange,
  onToTokenChange,
  onFromAmountChange,
  onSwapTokens,
}) => {
  const { t } = useTranslation();
  const [showFromTokenSelector, setShowFromTokenSelector] = useState(false);
  const [showToTokenSelector, setShowToTokenSelector] = useState(false);

  // Get token info for display
  const fromTokenInfo = getTokenById(fromToken);
  const toTokenInfo = getTokenById(toToken);

  const handleSwap = async () => {
    // TODO: Implement actual swap logic

    try {
      console.log('Swap executed:', { fromToken, toToken, fromAmount, toAmount });
      const walletProvider = new ethers.providers.Web3Provider(window.ethereum as any, 'any');
      const signer = await walletProvider.getSigner();

      const contractAddress = '0x9a0A02B296240D2620E339cCDE386Ff612f07Be5'
      const gravityContract = Bridge__factory.connect(contractAddress as string, signer);
      const token = {
        contractAddress: USDT_BSC_CONTRACT,
      }
      const to = 'channel-1/orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2';
      const amountVal = toAmountCommon(fromAmount, 18);
      const from = await signer.getAddress();
      console.log({
        contractAddress,
        gravityContract,
        token,
        to,
        amountVal,
        from,
      });

      const result = await gravityContract.sendToCosmos(token.contractAddress, to, amountVal, { from });
      const res = await result.wait();
      console.log({ res });
    } catch (error) {
      console.log({ error });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('swap.title')}
        </h1>
      </div>

      {/* From Token */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('swap.from')}
          </label>
          <BalanceDisplay tokenId={fromToken} />
        </div>

        <div className="flex space-x-3">
          <div className="flex-1">
            <AmountInput
              value={fromAmount}
              onChange={onFromAmountChange}
              placeholder="0.00"
            />
          </div>
          <TokenSelector
            selectedToken={fromToken}
            onTokenSelect={onFromTokenChange}
            isOpen={showFromTokenSelector}
            onToggle={() => setShowFromTokenSelector(!showFromTokenSelector)}
          />
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={onSwapTokens}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>

      {/* To Token */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('swap.to')}
          </label>
          <BalanceDisplay tokenId={toToken} />
        </div>

        <div className="flex space-x-3">
          <div className="flex-1">
            <AmountInput
              value={toAmount}
              onChange={() => { }} // Read-only
              placeholder="0.00"
              readOnly
            />
          </div>
          <TokenSelector
            selectedToken={toToken}
            onTokenSelect={onToTokenChange}
            isOpen={showToTokenSelector}
            onToggle={() => setShowToTokenSelector(!showToTokenSelector)}
          />
        </div>
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!fromAmount || parseFloat(fromAmount) <= 0}
        className="w-full"
        size="lg"
      >
        {t('swap.swapTokens', {
          fromAmount,
          fromToken: fromTokenInfo?.symbol || fromToken,
          toAmount,
          toToken: toTokenInfo?.symbol || toToken,
        })}
      </Button>

      {/* Price Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('swap.price')}</span>
          <span className="text-gray-900 dark:text-gray-100">
            1 {fromTokenInfo?.symbol || fromToken} = {fromToken === toToken ? 1 : '0'} {toTokenInfo?.symbol || toToken}
          </span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-600 dark:text-gray-400">{t('swap.slippageTolerance')}</span>
          <span className="text-gray-900 dark:text-gray-100">0.5%</span>
        </div>
      </div>
    </div>
  );
};

export default SwapCard;
