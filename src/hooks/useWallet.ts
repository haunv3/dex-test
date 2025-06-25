import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getNetworkByChainId } from '../constants/networks';

// Polyfill for Buffer in browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = require('buffer').Buffer;
}

interface WalletState {
  isConnected: boolean;
  walletType: 'metamask' | 'owallet' | null;
  address: string | null;
  chainId: string | null;
  provider: ethers.providers.Web3Provider | null;
  network: string | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    walletType: null,
    address: null,
    chainId: null,
    provider: null,
    network: null,
  });

  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check MetaMask
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const networkInfo = getNetworkByChainId(network.chainId.toString());
          setWalletState({
            isConnected: true,
            walletType: 'metamask',
            address: accounts[0],
            chainId: network.chainId.toString(),
            provider,
            network: networkInfo?.id || null,
          });
          return;
        }
      }

      // Check OWallet
      if (typeof window.owallet !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.owallet);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const networkInfo = getNetworkByChainId(network.chainId.toString());
          setWalletState({
            isConnected: true,
            walletType: 'owallet',
            address: accounts[0],
            chainId: network.chainId.toString(),
            provider,
            network: networkInfo?.id || null,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async (walletType: 'metamask' | 'owallet') => {
    setIsConnecting(true);
    try {
      let provider: ethers.providers.Web3Provider;
      let accounts: string[];

      if (walletType === 'metamask') {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('MetaMask is not installed');
        }
        provider = new ethers.providers.Web3Provider(window.ethereum);
        accounts = await provider.send('eth_requestAccounts', []);
      } else if (walletType === 'owallet') {
        if (typeof window.owallet === 'undefined') {
          throw new Error('OWallet is not installed');
        }
        provider = new ethers.providers.Web3Provider(window.owallet);
        accounts = await provider.send('eth_requestAccounts', []);
      } else {
        throw new Error('Unsupported wallet type');
      }

      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const networkInfo = getNetworkByChainId(network.chainId.toString());

        setWalletState({
          isConnected: true,
          walletType,
          address,
          chainId: network.chainId.toString(),
          provider,
          network: networkInfo?.id || null,
        });

        // Listen for account changes
        const ethereumProvider = walletType === 'metamask' ? window.ethereum : window.owallet;
        if (ethereumProvider) {
          const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length === 0) {
              // User disconnected
              disconnectWallet();
            } else {
              // User switched accounts
              setWalletState(prev => ({
                ...prev,
                address: accounts[0],
              }));
            }
          };

          const handleChainChanged = (chainId: string) => {
            const networkInfo = getNetworkByChainId(chainId);
            setWalletState(prev => ({
              ...prev,
              chainId,
              network: networkInfo?.id || null,
            }));
          };

          ethereumProvider.on('accountsChanged', handleAccountsChanged);
          ethereumProvider.on('chainChanged', handleChainChanged);
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      walletType: null,
      address: null,
      chainId: null,
      provider: null,
      network: null,
    });

    // Remove event listeners
    if (window.ethereum) {
      // Note: In a real app, you'd want to store the callback references
      // and remove them specifically. For now, we'll just clear the state.
    }
    if (window.owallet) {
      // Note: In a real app, you'd want to store the callback references
      // and remove them specifically. For now, we'll just clear the state.
    }
  };

  const switchNetwork = async (chainId: string) => {
    try {
      const ethereumProvider = walletState.walletType === 'metamask' ? window.ethereum : window.owallet;
      if (ethereumProvider) {
        await ethereumProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  };

  const getSigner = async () => {
    if (walletState.provider) {
      return await walletState.provider.getSigner();
    }
    return null;
  };

  const getBalance = async () => {
    if (walletState.provider && walletState.address) {
      return await walletState.provider.getBalance(walletState.address);
    }
    return null;
  };

  return {
    ...walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    checkWalletConnection,
    getSigner,
    getBalance,
  };
};
