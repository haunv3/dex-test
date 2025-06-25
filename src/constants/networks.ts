export interface Network {
  id: string;
  name: string;
  chainId: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  icon: string;
}

export interface Token {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  contractAddress: string;
  networkId: string;
  icon: string;
  price?: number;
}

// Supported Networks
export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    chainId: '0x38', // 56 in decimal
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    icon: '🟡',
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: '0x01', // 1 in decimal - correct format
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    icon: '🔷',
  },
];

// Supported Tokens
export const SUPPORTED_TOKENS: Token[] = [
  // BSC Tokens
  {
    id: 'usdt-bsc',
    name: 'USDT BSC',
    symbol: 'USDT',
    decimals: 18,
    contractAddress: '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC
    networkId: '0x38',
    icon: '💵',
    price: 1.00,
  },
  // Ethereum Tokens
  {
    id: 'ethereum-usdt',
    name: 'USDT ETH',
    symbol: 'USDT',
    decimals: 6, // USDT on Ethereum has 6 decimals
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
    networkId: '0x01', // Correct format
    icon: '💵',
    price: 1.00,
  },
];

// ERC20 ABI for balanceOf function
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
];

// Helper functions
export const getNetworkByChainId = (chainId: string): Network | undefined => {
  return SUPPORTED_NETWORKS.find(network => network.chainId === chainId);
};

export const getNetworkById = (networkId: string): Network | undefined => {
  return SUPPORTED_NETWORKS.find(network => network.id === networkId);
};

export const getTokensByNetwork = (networkId: string): Token[] => {
  return SUPPORTED_TOKENS.filter(token => token.networkId === networkId);
};

export const getTokenById = (tokenId: string): Token | undefined => {
  return SUPPORTED_TOKENS.find(token => token.id === tokenId);
};
