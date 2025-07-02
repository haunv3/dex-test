import React, { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TokenSelector from './TokenSelector';
import AmountInput from './AmountInput';
import Button from '../ui/Button';
import BalanceDisplay from '../ui/BalanceDisplay';
import WalletInfo from './WalletInfo';
import { BROADCAST_POLL_INTERVAL, calculateTimeoutTimestamp, getCosmosGasPrice, toAmount as toAmountCommon } from '@oraichain/oraidex-common';
import { useTokens } from '../../hooks/useTokens';
import { useWallet } from '../../hooks/useWallet';
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
import { coin, GasPrice } from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { ethers } from "ethers";
import { ICS20I__factory } from './contract/typechain-types/factories/ICS20I__factory';
import { ethToExa } from './contract/convertAddress';

interface SwapCardProps {
  fromToken: string;
  toToken: string;
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
  const [isLoading, setIsLoading] = useState(false);

  const {
    allTokens,
  } = useTokens();

  const { isConnected } = useWallet();

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', message: string, title: string, link?: { url: string; text: string }) => {
    // Check if showToast function exists in window object
    if (typeof window !== 'undefined' && (window as any)?.showToast) {
      (window as any).showToast({
        type,
        message,
        title,
        duration: 4000,
        link,
      });
    } else {
      // Fallback to console or browser alert if showToast is not available
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

      // You can also use browser's native alert as fallback
      if (type === 'error') {
        alert(`Error: ${title}\n${message}`);
      } else if (type === 'success') {
        alert(`Success: ${title}\n${message}`);
      }
    }
  }

  const listToken = allTokens.filter((token) => token.coinGeckoId && (token.chainId === 'noble-1' || token.chainId === 'exachain-1'));

  // Get token info for display
  const fromTokenInfo = allTokens.find(token => token.denom === fromToken);
  const toTokenInfo = allTokens.find(token => token.denom === toToken);

  const handleSwap = async () => {
    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);
    try {
      if (!isConnected || !fromAmount || parseFloat(fromAmount) <= 0 || !fromToken || !toToken) {
        showToast('error', 'Please connect your wallet first', 'Invalid input');
        return;
      }

      if (!fromTokenInfo || !toTokenInfo) {
        showToast('error', 'Please select a valid token', 'Invalid token');
        return;
      }

      const nobleChainId = 'noble-1';
      const exachainChainId = "exachain-1";
      const sourcePort = "transfer";
      const [sourceChannel, targetChannel] = ["channel-155", "channel-0"];

      if (fromTokenInfo.chainId === nobleChainId && toTokenInfo.chainId === exachainChainId) {
        const tmClient = await Comet38Client.connect(fromTokenInfo.rpc);
        const optionsClient = {
          broadcastPollIntervalMs: BROADCAST_POLL_INTERVAL,
          gasPrice: GasPrice.fromString(`${getCosmosGasPrice(fromTokenInfo.gasPriceStep)}${fromTokenInfo?.feeCurrencies?.[0].coinMinimalDenom}`),
        };
        // @ts-ignore
        const wallet = await window.owallet.getOfflineSignerAuto(fromTokenInfo.chainId);
        const client = await SigningCosmWasmClient.createWithSigner(tmClient, wallet, optionsClient);
        const amount = toAmountCommon(fromAmount, fromTokenInfo.decimals).toString();
        const evmAddress = await window.ethereum?.request({ method: "eth_requestAccounts" });
        const exachainAddress = ethToExa(evmAddress[0]);
        const nobleAddress = await window.owallet?.getKey("noble-1");
        const memo = '';
        const msgTransferObj = {
          sourcePort,
          receiver: exachainAddress,
          sourceChannel,
          token: coin(amount, fromTokenInfo.denom),
          sender: nobleAddress?.bech32Address,
          memo,
          timeoutTimestamp: BigInt(calculateTimeoutTimestamp(3600))
        };

        const msgTransfer = MsgTransfer.fromPartial(msgTransferObj);
        const msgTransferEncodeObj = {
          typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
          value: msgTransfer
        };

        const res = await client.signAndBroadcast(nobleAddress?.bech32Address as string, [msgTransferEncodeObj], "auto");
        console.log({ res});

        if (res?.transactionHash) {
          const explorerUrl = `https://scanium.io/noble/tx/${res.transactionHash}`;
          showToast('success', 'transaction successful!', 'Bridge successful', {
            url: explorerUrl,
            text: 'View on Explorer'
          });
        }
      } else {
        // Get the first EVM connection for signing
        const amount = toAmountCommon(fromAmount);
        const nobleAddress = await window.owallet?.getKey("noble-1");
        if (!nobleAddress) {
          showToast('error', 'Please connect your wallet first', 'Invalid input');
          return;
        }

        const receiver = nobleAddress.bech32Address;
        const getSigner = new ethers.BrowserProvider(window.ethereum as any, 'any');
        const signer = await getSigner.getSigner();
        const Ics20Address = "0x0000000000000000000000000000000000000802";
        const precompile = ICS20I__factory.connect(Ics20Address, signer);
        const memo = '';
        const tx = await precompile.transfer(
          sourcePort,
          targetChannel,
          fromTokenInfo.denom,
          amount,
          signer.address,
          receiver,
          { revisionNumber: 1, revisionHeight: 10000000000 },
          BigInt(calculateTimeoutTimestamp(3600)),
          memo
        )

        const receipt = await tx.wait(1);

        if (receipt) {
          const explorerUrl = `https://scanium.io/Exachain/account/${ethToExa(signer.address)}`;
          showToast('success', 'Swap transaction successful!', 'Swap successful', {
            url: explorerUrl,
            text: 'View on Explorer'
          });
        }
      }
    } catch (error) {
      console.log({ error });
      showToast('error', `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Swap failed');
    } finally {
      setIsLoading(false);
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
          <BalanceDisplay tokenId={fromToken} />
        </div>

        <div className="flex space-x-3">
          <div className="flex-1">
            <AmountInput
              value={fromAmount}
              onChange={() => { }}
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
        disabled={!isConnected || !fromAmount || parseFloat(fromAmount) <= 0 || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </div>
        ) : !isConnected ? (
          'Connect Wallet to Swap'
        ) : (
          t('swap.swapTokens', {
            fromAmount,
            fromToken: fromTokenInfo?.name || fromToken,
            toAmount,
            toToken: toTokenInfo?.name || toToken,
          })
        )}
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
