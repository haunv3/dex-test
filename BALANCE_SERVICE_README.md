# Abstract Balance Service Architecture

Hệ thống balance service đã được refactor để sử dụng abstract pattern, cho phép hỗ trợ cả EVM và Cosmos wallets một cách linh hoạt và mở rộng.

## 🏗️ Kiến trúc

### Abstract Base Class
```typescript
export abstract class BalanceProvider {
  abstract getProvider(network: Network): any;
  abstract getNativeBalance(network: Network, address: string): Promise<...>;
  abstract getTokenBalance(token: Token, address: string): Promise<BalanceInfo>;
  abstract getNetworkBalances(network: Network, address: string): Promise<WalletBalances>;
}
```

### Concrete Implementations

#### 1. EVMBalanceProvider
- **Provider**: Ethers.js JsonRpcProvider
- **Networks**: BSC, Ethereum, Polygon, etc.
- **Tokens**: ERC20/BEP20 tokens
- **Features**: Retry logic, error handling, price estimation

#### 2. CosmosBalanceProvider
- **Provider**: CosmJS (planned) / HTTP client
- **Networks**: OraiChain, Cosmos Hub, Osmosis, etc.
- **Tokens**: IBC tokens, native tokens
- **Features**: Cosmos-specific balance fetching

## 🔧 Factory Pattern

```typescript
export class BalanceProviderFactory {
  static createProvider(walletType: 'evm' | 'cosmos'): BalanceProvider {
    switch (walletType) {
      case 'evm':
        return new EVMBalanceProvider();
      case 'cosmos':
        return new CosmosBalanceProvider();
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  }
}
```

## 📊 Main Balance Service

### Multi-Wallet Support
```typescript
export class BalanceService {
  // Get balances for specific wallet type
  async getAllBalances(address: string, walletType: 'evm' | 'cosmos'): Promise<WalletBalances[]>

  // Get balances for multiple wallet types
  async getMultiWalletBalances(addresses: { evm?: string; cosmos?: string }): Promise<{
    evm: WalletBalances[];
    cosmos: WalletBalances[];
    totalValue: number;
    totalValueFormatted: string;
  }>
}
```

## 🎣 React Hooks

### useBalance (Legacy)
```typescript
// Backward compatible hook
const { balances, totalValue, isLoading, error, refreshBalances } = useBalance();
```

### useMultiWalletBalance (New)
```typescript
// New hook for multi-wallet support
const {
  evmBalances,
  cosmosBalances,
  totalValue,
  walletCounts,
  isLoading,
  error,
  refreshBalances
} = useMultiWalletBalance();
```

## 🔄 Luồng hoạt động

### 1. Single Wallet Balance
```
User connects wallet
→ useBalance detects wallet type
→ Creates appropriate provider (EVM/Cosmos)
→ Fetches balances for all supported networks
→ Returns combined results
```

### 2. Multi-Wallet Balance
```
User connects multiple wallets
→ useMultiWalletBalance gets all addresses
→ Creates providers for each wallet type
→ Fetches balances in parallel
→ Combines and aggregates results
```

### 3. Network-Specific Balance
```
User requests specific network
→ BalanceService.getNetworkBalances()
→ Factory creates appropriate provider
→ Provider fetches native + token balances
→ Returns formatted results
```

## 📈 Tính năng

### EVM Provider Features
- **Multi-network support**: BSC, Ethereum, Polygon
- **ERC20 token support**: Standard token contracts
- **Retry logic**: Exponential backoff for failed requests
- **Price estimation**: Mock prices (TODO: real API)
- **Error handling**: Graceful fallbacks

### Cosmos Provider Features
- **IBC support**: Cross-chain token balances
- **Native token support**: Chain-specific tokens
- **HTTP client**: REST API integration
- **Retry logic**: Consistent with EVM provider
- **Price estimation**: Cosmos-specific tokens

### Common Features
- **Abstract interface**: Consistent API across providers
- **Type safety**: Full TypeScript support
- **Error handling**: Comprehensive error management
- **Logging**: Detailed console logging for debugging
- **Caching**: Provider instance caching

## 🛠️ Sử dụng

### Basic Usage
```typescript
import { balanceService } from '../services/balanceService';

// Get EVM balances
const evmBalances = await balanceService.getAllBalances(address, 'evm');

// Get Cosmos balances
const cosmosBalances = await balanceService.getAllBalances(address, 'cosmos');

// Get multi-wallet balances
const multiBalances = await balanceService.getMultiWalletBalances({
  evm: evmAddress,
  cosmos: cosmosAddress
});
```

### React Component Usage
```typescript
import { useMultiWalletBalance } from '../hooks/useMultiWalletBalance';

const MyComponent = () => {
  const {
    evmBalances,
    cosmosBalances,
    totalValue,
    isLoading
  } = useMultiWalletBalance();

  return (
    <div>
      <h3>EVM Networks: {evmBalances.length}</h3>
      <h3>Cosmos Networks: {cosmosBalances.length}</h3>
      <h3>Total Value: {totalValue}</h3>
    </div>
  );
};
```

## 🔧 Cấu hình

### Network Configuration
```typescript
// Add new EVM network
{
  id: 'polygon',
  name: 'Polygon',
  chainId: '0x89',
  rpcUrl: 'https://polygon-rpc.com',
  explorerUrl: 'https://polygonscan.com',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  icon: '🟣',
  isEvm: true,
}
```

### Token Configuration
```typescript
// Add new token
{
  id: 'usdc-polygon',
  name: 'USDC Polygon',
  symbol: 'USDC',
  decimals: 6,
  contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  networkId: '0x89',
  icon: '💵',
  price: 1.00,
}
```

## 🚀 Mở rộng

### Thêm Provider mới
```typescript
export class SolanaBalanceProvider extends BalanceProvider {
  getProvider(network: Network): any {
    // Solana-specific provider
  }

  async getNativeBalance(network: Network, address: string): Promise<...> {
    // Solana balance fetching
  }

  // ... implement other abstract methods
}

// Update factory
export class BalanceProviderFactory {
  static createProvider(walletType: 'evm' | 'cosmos' | 'solana'): BalanceProvider {
    switch (walletType) {
      case 'solana':
        return new SolanaBalanceProvider();
      // ... existing cases
    }
  }
}
```

### Thêm Network mới
```typescript
// 1. Add to SUPPORTED_NETWORKS
// 2. Add tokens to SUPPORTED_TOKENS
// 3. Provider automatically supports new network
```

## 🐛 Troubleshooting

### Common Issues

1. **"Provider not found"**
   - Check network configuration
   - Verify RPC URL is accessible
   - Check chainId format

2. **"Token balance failed"**
   - Verify contract address
   - Check token decimals
   - Ensure network supports token

3. **"Price estimation failed"**
   - Check price configuration
   - Verify symbol matches

### Debug Mode
```typescript
// Enable detailed logging
console.log('Provider creation:', network.name);
console.log('Balance fetching:', address);
console.log('Token balance:', token.symbol);
```

## 📋 Roadmap

- [ ] Real price API integration
- [ ] CosmJS implementation for Cosmos
- [ ] Solana provider
- [ ] Balance caching
- [ ] Real-time balance updates
- [ ] Transaction history
- [ ] Portfolio analytics
- [ ] Multi-language support

## 🔒 Bảo mật

- **No private key storage**: Only public addresses
- **Read-only operations**: No transaction signing
- **Error sanitization**: No sensitive data in logs
- **Rate limiting**: Built-in retry logic
- **Network validation**: ChainId verification
