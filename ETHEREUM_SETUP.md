# Ethereum Network Setup

## ✅ Đã thêm support cho Ethereum network

## Supported Networks

The application currently supports the following networks:

### BNB Smart Chain (BSC)
- **Chain ID**: `0x38` (56 in decimal)
- **RPC URL**: `https://bsc-dataseed1.binance.org/`
- **Explorer**: `https://bscscan.com`
- **Native Token**: BNB

### Ethereum Mainnet
- **Chain ID**: `0x01` (1 in decimal)
- **RPC URL**: `https://eth.llamarpc.com`
- **Explorer**: `https://etherscan.io`
- **Native Token**: ETH

## Supported Tokens

### USDT Tokens
- **USDT on BSC**: `usdt-bsc`
  - Contract: `0x55d398326f99059fF775485246999027B3197955`
  - Decimals: 18
  - Network: BSC (`0x38`)

- **USDT on Ethereum**: `ethereum-usdt`
  - Contract: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
  - Decimals: 6
  - Network: Ethereum (`0x1`)

## 🧪 Cách test:

### 1. Test Configuration:
```javascript
// Trong browser console
import { testEthereumConfig } from './utils/ethereumTest';
testEthereumConfig();
```

### 2. Test Balances:
```javascript
// Trong browser console
import { testEthereumBalances } from './utils/ethereumTest';
testEthereumBalances('YOUR_WALLET_ADDRESS');
```

### 3. Quick Test:
```javascript
// Trong browser console
import { quickEthereumTest } from './utils/ethereumTest';
quickEthereumTest('YOUR_WALLET_ADDRESS');
```

### 4. Sử dụng UI:
1. Mở BalanceDemo component
2. Connect wallet
3. Click "Test Config" để kiểm tra configuration
4. Click "Ethereum Test" để test riêng Ethereum
5. Click "Full Test" để test tất cả networks

## 🔧 Configuration:

### Networks (src/constants/networks.ts):
```typescript
export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    // ...
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: '0x01',
    rpcUrl: 'https://eth.llamarpc.com',
    // ...
  },
];
```

### Tokens (src/constants/networks.ts):
```typescript
export const SUPPORTED_TOKENS: Token[] = [
  // BSC USDT
  {
    id: 'usdt-bsc',
    name: 'USDT BSC',
    symbol: 'USDT',
    networkId: '0x38',
    contractAddress: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18,
  },
  // Ethereum USDT
  {
    id: 'ethereum-usdt',
    name: 'USDT ETH',
    symbol: 'USDT',
    networkId: '0x01',
    contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
  },
];
```

## 🚨 Lưu ý quan trọng:

### 1. Token Identification:
- **Trước đây:** Sử dụng `token.symbol` (USDT) → Không phân biệt được network
- **Bây giờ:** Sử dụng `token.id` (usdt-bsc, ethereum-usdt) → Phân biệt rõ ràng

### 2. TokenSelector Updates:
- Hiển thị: `USDT (BSC)` và `USDT (ETH)`
- Search: Có thể tìm theo symbol, name, hoặc network name
- Selection: Sử dụng `token.id` thay vì `token.symbol`

### 3. BalanceDisplay Updates:
- Support cả `tokenSymbol` và `tokenId`
- Tự động resolve token info từ `tokenId`

### 4. Decimals khác nhau:
- USDT trên BSC: 18 decimals
- USDT trên Ethereum: 6 decimals

### 5. RPC URL:
- Sử dụng LlamaRPC cho Ethereum (free, reliable)
- Có thể thay đổi thành endpoint khác nếu cần

## 🐛 Troubleshooting:

### 1. Network không tìm thấy:
- Kiểm tra chainId có đúng format không (0x1, 0x38)
- Kiểm tra RPC URL có hoạt động không

### 2. Token balance = 0:
- Kiểm tra contract address có đúng không
- Kiểm tra wallet có token trên network đó không
- Kiểm tra decimals có đúng không

### 3. TokenSelector không phân biệt được tokens:
- Đảm bảo sử dụng `token.id` thay vì `token.symbol`
- Kiểm tra token IDs có unique không

### 4. RPC errors:
- Thử đổi RPC URL
- Kiểm tra rate limits
- Thử lại sau vài giây

## 📊 Expected Results:

### Test Config:
```
✅ Ethereum network found: {
  name: "Ethereum",
  chainId: "0x01",
  rpcUrl: "https://eth.llamarpc.com",
  nativeCurrency: "ETH"
}
✅ Found 1 tokens on Ethereum:
  USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
```

### Test Balances:
```
🔷 Testing ETH balance...
ETH balance result: {
  balance: "0.1234",
  value: "$308.50"
}

💵 Testing USDT balance on Ethereum...
USDT balance result: {
  balance: "100.000000",
  value: "$100.00"
}
```

### TokenSelector Display:
```
USDT (BSC) - USDT BSC • BNB Smart Chain
USDT (ETH) - USDT ETH • Ethereum
```

## 🎯 Next Steps:

1. **Thêm more tokens**: USDC, DAI, WETH, etc.
2. **Thêm more networks**: Polygon, Arbitrum, etc.
3. **Real price API**: Thay thế estimated prices
4. **Caching**: Cache balance results
5. **WebSocket**: Real-time balance updates
