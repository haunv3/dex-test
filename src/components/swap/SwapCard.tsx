import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';
import Button from '../ui/Button';
import BalanceDisplay from '../ui/BalanceDisplay';
import WalletInfo from './WalletInfo';
import { BROADCAST_POLL_INTERVAL, Bridge__factory, USDT_BSC_CONTRACT, calculateTimeoutTimestamp, getCosmosGasPrice, toAmount as toAmountCommon } from '@oraichain/oraidex-common';
import { useTokens } from '../../hooks/useTokens';
import { useWallet } from '../../hooks/useWallet';
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { coin, GasPrice } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

interface SwapCardProps {
  fromToken: string; // This should be token.denom now
  toToken: string; // This should be token.denom now
  fromAmount: string;
  toAmount: string;
  onFromTokenChange: (tokenDenom: string) => void;
  onToTokenChange: (tokenDenom: string) => void;
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

  const {
    allTokens,
  } = useTokens();

  const { isConnected, connections, getEVMAddresses, getSigner } = useWallet();

  const listToken = allTokens.filter((token) => token.coinGeckoId && (token.chainId === 'noble-1' || token.chainId === 'exachain-1'));

  // Get token info for display
  const fromTokenInfo = allTokens.find(token => token.denom === fromToken);
  const toTokenInfo = allTokens.find(token => token.denom === toToken);

  const handleSwap = async () => {
    try {
      if (!isConnected || !fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
        alert('Please connect your wallet first');
        return;
      }

      if (fromTokenInfo?.chainId === 'noble-1' && toTokenInfo?.chainId === 'exachain-1') {
        const tmClient = await Tendermint37Client.connect(fromTokenInfo.rpc);
        const optionsClient = {
          broadcastPollIntervalMs: BROADCAST_POLL_INTERVAL,
          gasPrice: GasPrice.fromString(`${getCosmosGasPrice(fromTokenInfo.gasPriceStep)}${fromTokenInfo?.feeCurrencies?.[0].coinMinimalDenom}`),
        };
        // @ts-ignore
        const wallet = window.owallet.getOfflineSignerAuto(fromTokenInfo.chainId);
        const client = await SigningCosmWasmClient.createWithSigner(tmClient, wallet, optionsClient);
        const amount = toAmountCommon(fromAmount, fromTokenInfo.decimals).toString();
        const oraiAddress = await window.owallet?.getKey("Oraichain");
        const nobleAddress = await window.owallet?.getKey("noble-1");
        const msgTransferObj = {
          sourcePort: '',
          receiver: oraiAddress?.bech32Address,
          sourceChannel: '',
          token: coin(amount, fromTokenInfo.denom),
          sender: '',
          memo: '',
          timeoutTimestamp: BigInt(calculateTimeoutTimestamp(3600))
        };

        const msgTransfer = MsgTransfer.fromPartial(msgTransferObj);
        const msgTransferEncodeObj = {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: msgTransfer
        };

        const res = await client.signAndBroadcast(nobleAddress?.bech32Address as string, [msgTransferEncodeObj], "auto");
        console.log({ res });
      } else {
        // Get the first EVM connection for signing
        const evmAddresses = getEVMAddresses();
        if (evmAddresses.length === 0) {
          alert('No EVM wallet connected. Please connect an EVM wallet (MetaMask or OWallet)');
          return;
        }

        const signer = await getSigner();
        if (!signer) {
          alert('Unable to get wallet signer');
          return;
        }

        const contractAddress = '0x9a0A02B296240D2620E339cCDE386Ff612f07Be5'
        const gravityContract = Bridge__factory.connect(contractAddress as string, signer);
        const token = {
          contractAddress: USDT_BSC_CONTRACT,
        }
        const to = 'channel-1/orai1hvr9d72r5um9lvt0rpkd4r75vrsqtw6yujhqs2';
        const amountVal = toAmountCommon(fromAmount, 18);
        const from = await signer.getAddress();
        const result = await gravityContract.sendToCosmos(token.contractAddress, to, amountVal, { from });
        const res = await result.wait();
        console.log({ res });
      }
    } catch (error) {
      console.log({ error });
      alert(`Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('swap.title')}
        </h1>
      </div>

      {/* Wallet Info */}
      <WalletInfo />

      {/* Wallet Connection Status */}
      {!isConnected && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Please connect your wallet to start swapping
            </span>
          </div>
        </div>
      )}
{/*
      {isConnected && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-600 dark:text-green-400">✅</span>
              <span className="text-sm text-green-800 dark:text-green-200">
                {connections.length} wallet{connections.length !== 1 ? 's' : ''} connected
              </span>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">
              {getEVMAddresses().length} EVM, {connections.length - getEVMAddresses().length} Cosmos
            </div>
          </div>
        </div>
      )} */}

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
            tokens={listToken}
            placeholder="Select token"
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
            tokens={listToken}
            placeholder="Select token"
          />
        </div>
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!isConnected || !fromAmount || parseFloat(fromAmount) <= 0}
        className="w-full"
        size="lg"
      >
        {!isConnected
          ? 'Connect Wallet to Swap'
          : t('swap.swapTokens', {
            fromAmount,
            fromToken: fromTokenInfo?.name || fromToken,
            toAmount,
            toToken: toTokenInfo?.name || toToken,
          })
        }
      </Button>

      {/* Price Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{t('swap.price')}</span>
          {fromToken && toToken && (
            <span className="text-gray-900 dark:text-gray-100">
              1 {fromTokenInfo?.name || fromToken} = 1 {toTokenInfo?.name || toToken}
            </span>
          )}
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
