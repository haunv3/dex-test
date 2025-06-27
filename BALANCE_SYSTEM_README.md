# Hệ thống Query Balance - OraiGold Frontend

## Tổng quan

Hệ thống query balance đã được cải thiện để hỗ trợ việc lấy thông tin balance từ nhiều mạng blockchain khác nhau, bao gồm BNB Smart Chain (BSC), Ethereum, và Polygon với hỗ trợ đầy đủ cho các token BEP20 và ERC20.

## Cải tiến mới

### ✅ Đã hoàn thành

1. **Hỗ trợ đa mạng mở rộng**:
   - BNB Smart Chain (BSC) - 7 tokens BEP20
   - Ethereum - 6 tokens ERC20
   - Polygon - 5 tokens ERC20

2. **Token phổ biến được hỗ trợ**:
   - **BSC (BEP20)**: USDT, USDC, BUSD, CAKE, ADA, DOGE, SHIB
   - **Ethereum (ERC20)**: USDT, USDC, DAI, LINK, UNI, AAVE
   - **Polygon (ERC20)**: USDT, USDC, DAI, WETH, QUICK

3. **Cải thiện performance**:
   - Retry mechanism với exponential backoff
   - Better error handling và logging
   - Memory leak prevention
   - Abort controller cho requests

4. **UI/UX cải thiện**:
   - BalanceOverview component mới
   - Better loading states
   - Error display với retry functionality
   - Last updated timestamp
   - Network switching buttons

5. **Demo component**: BalanceDemo để test toàn bộ hệ thống

## Cấu trúc hệ thống

### 1. Constants (`src/constants/networks.ts`)

Định nghĩa các mạng và token được hỗ trợ:

```typescript
// Các mạng được hỗ trợ
- BNB Smart Chain (BSC) - Chain ID: 0x38
- Ethereum - Chain ID: 0x01
- Polygon - Chain ID: 0x89

// Các token được hỗ trợ
- BSC: USDT, USDC, BUSD, CAKE, ADA, DOGE, SHIB
- Ethereum: USDT, USDC, DAI, LINK, UNI, AAVE
- Polygon: USDT, USDC, DAI, WETH, QUICK
```

### 2. Balance Service (`src/services/balanceService.ts`)

Service chính với các cải tiến:

```typescript
// Các method chính
- getNativeBalance(): Lấy balance của native token (BNB, ETH, MATIC)
- getTokenBalance(): Lấy balance của ERC20/BEP20 token
- getNetworkBalances(): Lấy tất cả balance của một mạng
- getAllBalances(): Lấy balance của tất cả mạng
- getTotalPortfolioValue(): Tính tổng giá trị portfolio
- getTokenBalanceBySymbol(): Lấy balance theo symbol và network
- retry(): Retry mechanism với exponential backoff
```

### 3. Balance Hook (`src/hooks/useBalance.ts`)

React hook với memory leak prevention:

```typescript
const {
  balances,
  totalValue,
  totalValueFormatted,
  isLoading,
  error,
  refreshBalances,
  lastUpdated
} = useBalance();
```

### 4. Balance Components

#### BalanceDisplay (`src/components/ui/BalanceDisplay.tsx`)
```typescript
<BalanceDisplay
  tokenSymbol="USDT"
  networkId="bsc"
  showValue={true}
  showNetwork={true}
  showLastUpdated={true}
/>
```

#### BalanceOverview (`src/components/ui/BalanceOverview.tsx`)
```typescript
<BalanceOverview
  showEmptyNetworks={false}
  maxNetworks={5}
/>
```

## Cách sử dụng

### 1. Hiển thị balance overview

```typescript
import { BalanceOverview } from '../components/ui';

const MyComponent = () => {
  return <BalanceOverview />;
};
```

### 2. Hiển thị individual token balance

```typescript
import { BalanceDisplay } from '../components/ui';

const MyComponent = () => {
  return (
    <div>
      <BalanceDisplay tokenSymbol="USDT" networkId="bsc" />
      <BalanceDisplay tokenSymbol="ETH" showNetwork={true} />
    </div>
  );
};
```

### 3. Lấy balance programmatically

```typescript
import { balanceService } from '../services/balanceService';

const getBalances = async (address: string) => {
  // Lấy tất cả balance
  const allBalances = await balanceService.getAllBalances(address);

  // Lấy portfolio value
  const portfolioValue = await balanceService.getTotalPortfolioValue(address);

  // Lấy specific token balance
  const usdtBalance = await balanceService.getTokenBalanceBySymbol('USDT', '0x38', address);

  console.log('All balances:', allBalances);
  console.log('Portfolio value:', portfolioValue);
  console.log('USDT balance:', usdtBalance);
};
```

### 4. Test với demo component

```typescript
import BalanceDemo from '../components/BalanceDemo';

const App = () => {
  return <BalanceDemo />;
};
```

## Tính năng chính

### ✅ Đã hoàn thành

1. **Hỗ trợ đa mạng**: BSC, Ethereum, Polygon
2. **Query native token balance**: BNB, ETH, MATIC
3. **Query ERC20/BEP20 token balance**: 18+ tokens
4. **Auto-refresh**: Tự động cập nhật balance mỗi 30 giây
5. **Network switching**: Chuyển đổi mạng trong ví
6. **Error handling**: Xử lý lỗi với retry mechanism
7. **Loading states**: Hiển thị trạng thái loading đẹp mắt
8. **Format balance**: Format số liệu đẹp mắt
9. **Real-time updates**: Cập nhật real-time khi wallet thay đổi
10. **Memory leak prevention**: Tránh memory leak trong React hooks
11. **Retry mechanism**: Tự động retry khi request thất bại
12. **Comprehensive logging**: Log chi tiết để debug

### 🔄 Đang phát triển

1. **Price API integration**: Tích hợp API giá thực tế (CoinGecko, CoinMarketCap)
2. **More networks**: Thêm các mạng khác (Arbitrum, Optimism, Avalanche)
3. **Transaction history**: Lịch sử giao dịch
4. **Portfolio analytics**: Phân tích portfolio chi tiết
5. **Token discovery**: Tự động phát hiện token mới
6. **Batch requests**: Tối ưu performance với batch requests

## Cấu hình

### Thêm mạng mới

```typescript
// Trong src/constants/networks.ts
export const SUPPORTED_NETWORKS: Network[] = [
  // ... existing networks
  {
    id: 'new-network',
    name: 'New Network',
    chainId: '0x...',
    rpcUrl: 'https://...',
    explorerUrl: 'https://...',
    nativeCurrency: {
      name: 'NEW',
      symbol: 'NEW',
      decimals: 18,
    },
    icon: '🆕',
  },
];
```

### Thêm token mới

```typescript
// Trong src/constants/networks.ts
export const SUPPORTED_TOKENS: Token[] = [
  // ... existing tokens
  {
    id: 'new-token-network',
    name: 'New Token',
    symbol: 'NEW',
    decimals: 18,
    contractAddress: '0x...',
    networkId: '0x...',
    icon: '🆕',
    price: 1.00,
  },
];
```

## Testing

### Chạy demo

```bash
# Import và sử dụng BalanceDemo component
import BalanceDemo from './components/BalanceDemo';
```

### Test balance service

```bash
# Test trong browser console
const address = '0x...'; // Your wallet address
const balances = await balanceService.getAllBalances(address);
console.log(balances);
```

## Troubleshooting

### Balance không hiển thị
1. Kiểm tra wallet đã connect chưa
2. Kiểm tra network đã đúng chưa
3. Kiểm tra RPC URL có hoạt động không
4. Kiểm tra console log để xem lỗi chi tiết
5. Thử refresh balance manually

### Network switching không hoạt động
1. Kiểm tra wallet có hỗ trợ network đó không
2. Thử add network trước khi switch
3. Kiểm tra chainId có đúng format không
4. Xem console log để debug

### Performance issues
1. Giảm frequency của auto-refresh (hiện tại 30s)
2. Implement caching cho balance
3. Sử dụng WebSocket thay vì polling
4. Batch requests thay vì individual calls

### Error handling
1. Kiểm tra console log để xem error chi tiết
2. Retry mechanism sẽ tự động thử lại 3 lần
3. Network errors sẽ được handle gracefully
4. UI sẽ hiển thị error message rõ ràng

## Logs và Debug

Hệ thống có comprehensive logging để debug:

```javascript
// Console logs sẽ hiển thị:
- Network connection status
- Balance fetch attempts
- Raw balance data
- Formatted balance results
- Error details
- Retry attempts
- Performance metrics
```

## Performance Metrics

- **Auto-refresh interval**: 30 giây
- **Retry attempts**: 3 lần
- **Retry delay**: 1 giây (exponential backoff)
- **Memory leak prevention**: ✅
- **Request cancellation**: ✅
- **Error recovery**: ✅
