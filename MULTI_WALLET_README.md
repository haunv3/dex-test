# Multi-Wallet Connection System

Hệ thống kết nối đa ví cho phép người dùng kết nối nhiều ví cùng lúc và hiển thị tất cả địa chỉ EVM và Cosmos.

## Tính năng chính

### 🔗 Kết nối đa chuỗi
- **EVM Chains**: MetaMask, OWallet (EVM mode)
- **Cosmos Chains**: OWallet (Cosmos mode)
- Hỗ trợ kết nối đồng thời nhiều ví

### 📱 Hiển thị địa chỉ
- Hiển thị tất cả địa chỉ EVM và Cosmos cùng lúc
- Phân loại theo loại chuỗi (EVM/Cosmos)
- Hiển thị thông tin network và chain ID
- Format địa chỉ ngắn gọn (6 ký tự đầu...4 ký tự cuối)

### 🔄 Quản lý kết nối
- Kết nối từng ví riêng biệt
- Ngắt kết nối từng ví riêng biệt
- Tự động phát hiện ví đã kết nối
- Cập nhật real-time khi thay đổi tài khoản

## Cách sử dụng

### 1. Kết nối ví

#### MetaMask (EVM)
```typescript
import { useWallet } from '../hooks/useWallet';

const { connectWallet } = useWallet();

// Kết nối MetaMask
await connectWallet('metamask');
```

#### OWallet (EVM)
```typescript
// Kết nối OWallet cho EVM chains
await connectWallet('owallet');
```

#### OWallet (Cosmos)
```typescript
// Kết nối OWallet cho Cosmos chains
await connectWallet('owallet', 'Oraichain');
```

### 2. Lấy thông tin địa chỉ

```typescript
const { getAllAddresses, getEVMAddresses, getCosmosAddresses } = useWallet();

// Lấy tất cả địa chỉ
const allAddresses = getAllAddresses();
console.log('EVM addresses:', allAddresses.evm);
console.log('Cosmos addresses:', allAddresses.cosmos);

// Lấy riêng từng loại
const evmAddresses = getEVMAddresses();
const cosmosAddresses = getCosmosAddresses();
```

### 3. Ngắt kết nối

```typescript
const { disconnectConnection } = useWallet();

// Ngắt kết nối MetaMask
disconnectConnection('evm', 'metamask');

// Ngắt kết nối OWallet Cosmos
disconnectConnection('cosmos', 'owallet');
```

## Component sử dụng

### MultiWalletDisplay
Component chính để hiển thị và quản lý đa ví:

```tsx
import MultiWalletDisplay from './ui/MultiWalletDisplay';

<MultiWalletDisplay />
```

### MultiWalletDemo
Demo page hoàn chỉnh:

```tsx
import MultiWalletDemo from './components/MultiWalletDemo';

// Trong App.tsx
<Route path="/multi-wallet" element={<MultiWalletDemo />} />
```

## API Reference

### useWallet Hook

#### State Properties
```typescript
interface WalletState {
  isConnected: boolean;
  connections: WalletConnection[];
  walletType: 'metamask' | 'owallet' | 'keplr' | null;
  address: string | null;
  chainId: string | null;
  provider: ethers.providers.Web3Provider | null;
  network: string | null;
  keplrAddress?: string | null;
  keplrChainId?: string | null;
  availableChains?: string[];
}
```

#### Methods
- `connectWallet(walletType, chainId?)` - Kết nối ví
- `disconnectWallet()` - Ngắt kết nối tất cả ví
- `disconnectConnection(type, walletType)` - Ngắt kết nối ví cụ thể
- `getAllAddresses()` - Lấy tất cả địa chỉ
- `getEVMAddresses()` - Lấy địa chỉ EVM
- `getCosmosAddresses()` - Lấy địa chỉ Cosmos

### WalletConnection Interface
```typescript
interface WalletConnection {
  type: 'evm' | 'cosmos';
  walletType: 'metamask' | 'owallet' | 'keplr';
  address: string;
  chainId: string;
  network: string;
  provider?: any;
}
```

## Cấu trúc file

```
src/
├── hooks/
│   └── useWallet.ts              # Hook chính cho đa ví
├── components/
│   ├── ui/
│   │   └── MultiWalletDisplay.tsx # Component hiển thị đa ví
│   └── MultiWalletDemo.tsx       # Demo page
├── types/
│   └── window.d.ts               # Type definitions cho OWallet
└── i18n/
    └── locales/
        ├── en.json               # English translations
        └── vi.json               # Vietnamese translations
```

## Ví dụ sử dụng

### Kết nối nhiều ví cùng lúc
```typescript
const { connectWallet, getAllAddresses } = useWallet();

// Kết nối MetaMask
await connectWallet('metamask');

// Kết nối OWallet EVM
await connectWallet('owallet');

// Kết nối OWallet Cosmos
await connectWallet('owallet', 'Oraichain');

// Lấy tất cả địa chỉ
const addresses = getAllAddresses();
console.log('All addresses:', addresses);
```

### Hiển thị trong component
```tsx
const MultiWalletComponent = () => {
  const { isConnected, connections, getAllAddresses } = useWallet();
  const allAddresses = getAllAddresses();

  return (
    <div>
      <h2>Connected Wallets: {connections.length}</h2>

      {allAddresses.evm.length > 0 && (
        <div>
          <h3>EVM Addresses</h3>
          {allAddresses.evm.map((addr, index) => (
            <div key={index}>
              {addr.walletType}: {addr.address} ({addr.network})
            </div>
          ))}
        </div>
      )}

      {allAddresses.cosmos.length > 0 && (
        <div>
          <h3>Cosmos Addresses</h3>
          {allAddresses.cosmos.map((addr, index) => (
            <div key={index}>
              {addr.walletType}: {addr.address} ({addr.network})
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Lưu ý bảo mật

1. **Private Keys**: Không bao giờ chia sẻ private keys hoặc seed phrase
2. **Kết nối an toàn**: Chỉ kết nối với các ứng dụng đáng tin cậy
3. **Kiểm tra địa chỉ**: Luôn kiểm tra địa chỉ trước khi thực hiện giao dịch
4. **Ngắt kết nối**: Ngắt kết nối ví khi không sử dụng

## Hỗ trợ mạng

### EVM Networks
- Ethereum Mainnet
- BSC (Binance Smart Chain)
- Polygon
- Các mạng EVM khác

### Cosmos Networks
- Oraichain
- Cosmos Hub
- Osmosis
- Các mạng Cosmos SDK khác

## Troubleshooting

### Lỗi thường gặp

1. **"MetaMask is not installed"**
   - Cài đặt MetaMask extension
   - Kiểm tra MetaMask đã được unlock

2. **"OWallet is not installed"**
   - Cài đặt OWallet extension
   - Kiểm tra OWallet đã được unlock

3. **"No accounts found"**
   - Thêm tài khoản vào ví
   - Unlock ví và chọn tài khoản

4. **"User rejected"**
   - Người dùng từ chối kết nối
   - Thử kết nối lại

### Debug
```typescript
// Bật debug mode
const { checkWalletConnection } = useWallet();

// Kiểm tra kết nối hiện tại
await checkWalletConnection();
```

## Roadmap

- [ ] Hỗ trợ Keplr wallet
- [ ] Hỗ trợ WalletConnect
- [ ] Lưu trạng thái kết nối
- [ ] Auto-reconnect
- [ ] Chain switching
- [ ] Balance display
- [ ] Transaction history
