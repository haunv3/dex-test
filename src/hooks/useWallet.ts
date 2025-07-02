import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getNetworkByChainId } from '../constants/networks';

// Polyfill for Buffer in browser
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = require('buffer').Buffer;
}

interface WalletConnection {
  type: 'evm' | 'cosmos';
  walletType: 'metamask' | 'owallet' | 'keplr';
  address: string;
  chainId: string;
  network: string;
  provider?: any;
}

interface WalletState {
  isConnected: boolean;
  connections: WalletConnection[];
  // Legacy support
  walletType: 'metamask' | 'owallet' | 'keplr' | null;
  address: string | null;
  chainId: string | null;
  provider: ethers.BrowserProvider | null;
  network: string | null;
  keplrAddress?: string | null;
  keplrChainId?: string | null;
  availableChains?: string[];
}

export const useWallet = (autoConnect: boolean = true) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    connections: [],
    walletType: null,
    address: null,
    chainId: null,
    provider: null,
    network: null,
    keplrAddress: null,
    keplrChainId: null,
    availableChains: [],
  });

  const [isConnecting, setIsConnecting] = useState(false);

  // Check if wallet is already connected on mount (only if autoConnect is true)
  useEffect(() => {
    if (autoConnect) {
      checkWalletConnection();
    }
  }, [autoConnect]);

  const checkWalletConnection = useCallback(async () => {
    console.log('Checking wallet connection...');
    const connections: WalletConnection[] = [];

    try {
      // Check MetaMask (EVM)
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        console.log('MetaMask detected');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        console.log({ accounts });
        if (accounts.length > 0) {
          console.log('MetaMask already connected:', accounts[0]);
          const network = await provider.getNetwork();
          const networkInfo = getNetworkByChainId(network.chainId.toString());
          connections.push({
            type: 'evm',
            walletType: 'metamask',
            address: accounts?.[0]?.address,
            chainId: network.chainId.toString(),
            network: networkInfo?.id || 'unknown',
            provider,
          });
        }
      }

      // Check OWallet (both EVM and Cosmos)
      if (typeof window.owallet !== 'undefined') {
        console.log('OWallet detected');

        // Check EVM connection
        try {
          const provider = new ethers.BrowserProvider(window.owallet);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            console.log('OWallet EVM already connected:', accounts[0]);
            const network = await provider.getNetwork();
            const networkInfo = getNetworkByChainId(network.chainId.toString());
            connections.push({
              type: 'evm',
              walletType: 'owallet',
              address: accounts[0]?.address,
              chainId: network.chainId.toString(),
              network: networkInfo?.id || 'unknown',
              provider,
            });
          }
        } catch (error) {
          console.log('OWallet EVM not connected:', error);
        }

        // Check Cosmos connection
        try {
          const { bech32Address } = await window.owallet.getKey('Oraichain');
          if (bech32Address) {
            console.log('OWallet Cosmos already connected:', bech32Address);
            connections.push({
              type: 'cosmos',
              walletType: 'owallet',
              address: bech32Address,
              chainId: 'Oraichain',
              network: 'oraichain',
              provider: window.owallet,
            });
          }
        } catch (error) {
          console.log('OWallet Cosmos not connected:', error);
        }
      }

      // Update state if connections found
      if (connections.length > 0) {
        const isConnected = connections.length > 0;
        const primaryConnection = connections[0]; // Use first connection as primary for legacy support

        setWalletState({
          isConnected,
          connections,
          walletType: primaryConnection.walletType,
          address: primaryConnection.type === 'evm' ? primaryConnection.address : null,
          chainId: primaryConnection.chainId,
          provider: primaryConnection.type === 'evm' ? primaryConnection.provider : null,
          network: primaryConnection.network,
          keplrAddress: primaryConnection.type === 'cosmos' ? primaryConnection.address : null,
          keplrChainId: primaryConnection.type === 'cosmos' ? primaryConnection.chainId : null,
          availableChains: [],
        });
      }

    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }, []);

  const connectWallet = useCallback(async (walletType: 'metamask' | 'owallet', chainId?: string) => {
    console.log('Connecting wallet:', walletType, 'with chainId:', chainId);
    setIsConnecting(true);
    try {
      if (walletType === 'owallet') {
        await connectOWallet(chainId);
      } else {
        await connectEVMWallet(walletType);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectEVMWallet = useCallback(async (walletType: 'metamask' | 'owallet') => {
    console.log('Connecting to EVM wallet:', walletType);

    let provider: ethers.BrowserProvider;
    let accounts: string[];

    if (walletType === 'metamask') {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed');
      }
      provider = new ethers.BrowserProvider(window.ethereum);
      accounts = await provider.send('eth_requestAccounts', []);
    } else if (walletType === 'owallet') {
      if (typeof window.owallet === 'undefined') {
        throw new Error('OWallet is not installed');
      }
      provider = new ethers.BrowserProvider(window.owallet);
      accounts = await provider.send('eth_requestAccounts', []);
    } else {
      throw new Error('Unsupported wallet type');
    }

    if (accounts.length > 0) {
      const network = await provider.getNetwork();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const networkInfo = getNetworkByChainId(network.chainId.toString());

      const newConnection: WalletConnection = {
        type: 'evm',
        walletType,
        address,
        chainId: network.chainId.toString(),
        network: networkInfo?.id || 'unknown',
        provider,
      };

      // Add event listeners for account and chain changes
      if (walletType === 'metamask' && window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          const handleAccountsChanged = (accounts: string[]) => {
            console.log('MetaMask accounts changed:', accounts);
            if (accounts.length === 0) {
              // User disconnected
              disconnectWallet();
            } else {
              // Update connection with new address
              setWalletState(prev => ({
                ...prev,
                connections: prev.connections.map(conn =>
                  conn.walletType === 'metamask' && conn.type === 'evm'
                    ? { ...conn, address: accounts[0] }
                    : conn
                ),
                address: accounts[0],
              }));
            }
          };
          handleAccountsChanged(accounts);
        });

        window.ethereum.on('chainChanged', (chainId: string) => {
          const handleChainChanged = (chainId: string) => {
            console.log('MetaMask chain changed:', chainId);
            const networkInfo = getNetworkByChainId(chainId);
            setWalletState(prev => ({
              ...prev,
              connections: prev.connections.map(conn =>
                conn.walletType === 'metamask' && conn.type === 'evm'
                  ? { ...conn, chainId, network: networkInfo?.id || 'unknown' }
                  : conn
              ),
              chainId,
              network: networkInfo?.id || 'unknown',
            }));
          };
          handleChainChanged(chainId);
        });
      }

      // Update state with new connection
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        connections: [...prev.connections.filter(conn =>
          !(conn.walletType === walletType && conn.type === 'evm')
        ), newConnection],
        walletType: newConnection.walletType,
        address: newConnection.address,
        chainId: newConnection.chainId,
        provider: newConnection.provider,
        network: newConnection.network,
      }));
    }
  }, []);

  const connectOWallet = useCallback(async (chainId?: string) => {
    console.log('Connecting to OWallet with chainId:', chainId);

    if (typeof window.owallet === 'undefined') {
      throw new Error('OWallet is not installed');
    }

    try {
      // Connect to Cosmos
      const { bech32Address } = await window.owallet.getKey('Oraichain');
      if (bech32Address) {
        const cosmosConnection: WalletConnection = {
          type: 'cosmos',
          walletType: 'owallet',
          address: bech32Address,
          chainId: 'Oraichain',
          network: 'oraichain',
          provider: window.owallet,
        };

        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          connections: [...prev.connections.filter(conn =>
            !(conn.walletType === 'owallet' && conn.type === 'cosmos')
          ), cosmosConnection],
          keplrAddress: bech32Address,
          keplrChainId: 'Oraichain',
        }));
      }
    } catch (error) {
      console.error('Error connecting to OWallet Cosmos:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    console.log('Disconnecting all wallets');
    setWalletState({
      isConnected: false,
      connections: [],
      walletType: null,
      address: null,
      chainId: null,
      provider: null,
      network: null,
      keplrAddress: null,
      keplrChainId: null,
      availableChains: [],
    });
  }, []);

  const disconnectConnection = useCallback((type: 'evm' | 'cosmos', walletType: string) => {
    console.log(`Disconnecting ${type} ${walletType} wallet`);
    setWalletState(prev => {
      const filteredConnections = prev.connections.filter(conn =>
        !(conn.type === type && conn.walletType === walletType)
      );

      const isConnected = filteredConnections.length > 0;
      const primaryConnection = filteredConnections[0];

      return {
        ...prev,
        isConnected,
        connections: filteredConnections,
        walletType: primaryConnection?.walletType || null,
        address: primaryConnection?.type === 'evm' ? primaryConnection.address : null,
        chainId: primaryConnection?.chainId || null,
        provider: primaryConnection?.type === 'evm' ? primaryConnection.provider : null,
        network: primaryConnection?.network || null,
        keplrAddress: primaryConnection?.type === 'cosmos' ? primaryConnection.address : null,
        keplrChainId: primaryConnection?.type === 'cosmos' ? primaryConnection.chainId : null,
      };
    });
  }, []);

  const switchNetwork = useCallback(async (chainId: string) => {
    console.log('Switching network to:', chainId);
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      }
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }, []);

  const getSigner = useCallback(() => {
    const evmConnection = walletState.connections.find(conn => conn.type === 'evm');
    if (!evmConnection?.provider) {
      throw new Error('No EVM wallet connected');
    }
    return evmConnection.provider.getSigner();
  }, [walletState.connections]);

  const getCurrentAddress = useCallback(() => {
    const evmConnection = walletState.connections.find(conn => conn.type === 'evm');
    return evmConnection?.address || null;
  }, [walletState.connections]);

  const getCurrentChainId = useCallback(() => {
    const evmConnection = walletState.connections.find(conn => conn.type === 'evm');
    return evmConnection?.chainId || null;
  }, [walletState.connections]);

  const getEVMAddresses = useCallback(() => {
    return walletState.connections
      .filter(conn => conn.type === 'evm')
      .map(conn => ({
        address: conn.address,
        walletType: conn.walletType,
        chainId: conn.chainId,
        network: conn.network,
      }));
  }, [walletState.connections]);

  const getCosmosAddresses = useCallback(() => {
    return walletState.connections
      .filter(conn => conn.type === 'cosmos')
      .map(conn => ({
        address: conn.address,
        walletType: conn.walletType,
        chainId: conn.chainId,
        network: conn.network,
      }));
  }, [walletState.connections]);

  const getAllAddresses = useCallback(() => {
    return {
      evm: getEVMAddresses(),
      cosmos: getCosmosAddresses(),
    };
  }, [getEVMAddresses, getCosmosAddresses]);

  return {
    ...walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    disconnectConnection,
    switchNetwork,
    checkWalletConnection,
    getSigner,
    getCurrentAddress,
    getCurrentChainId,
    getEVMAddresses,
    getCosmosAddresses,
    getAllAddresses,
  };
};
