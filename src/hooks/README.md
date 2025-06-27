# Wallet Hook Documentation

## Tổng quan

`useWallet` hook được cập nhật để hỗ trợ nhiều loại wallet bao gồm MetaMask, OWallet và Keplr. Hook này cung cấp các tính năng:

- Kết nối wallet tự động
- Chuyển đổi chain cho Keplr
- Chọn địa chỉ tùy ý cho Keplr
- Quản lý trạng thái wallet
- Event listeners cho thay đổi account/chain

## Cách sử dụng

### 1. Basic Usage

```typescript
import { useWallet } from '../hooks/useWallet';

const MyComponent = () => {
  const {
    isConnected,
    walletType,
    connectWallet,
    disconnectWallet,
    getCurrentAddress,
    getCurrentChainId,
  } = useWallet();

  const handleConnect = async () => {
    try {
      // Connect to MetaMask
      await connectWallet('metamask');

      // Connect to OWallet
      await connectWallet('owallet');

      // Connect to Keplr with specific chain
      await connectWallet('keplr', 'cosmoshub-4');
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected to: {walletType}</p>
          <p>Address: {getCurrentAddress()}</p>
          <p>Chain: {getCurrentChainId()}</p>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
};
```

### 2. Keplr Specific Features

```typescript
const {
  // Keplr specific properties
  keplrAddress,
  keplrChainId,
  availableChains,
  switchKeplrChain,
} = useWallet();

// Switch to different chain
const handleSwitchChain = async (chainId: string) => {
  try {
    await switchKeplrChain(chainId);
  } catch (error) {
    console.error('Failed to switch chain:', error);
  }
};

// Get available chains
console.log('Available chains:', availableChains);
```

### 3. Using Components

```typescript
import WalletConnect from '../components/ui/WalletConnect';
import KeplrAccountSelector from '../components/ui/KeplrAccountSelector';

const WalletSection = () => {
  return (
    <div>
      {/* Main wallet connection */}
      <WalletConnect />

      {/* Keplr account selector (only shows when Keplr is connected) */}
      <KeplrAccountSelector
        onAccountSelect={(address) => {
          console.log('Selected account:', address);
        }}
      />
    </div>
  );
};
```

## API Reference

### State Properties

- `isConnected: boolean` - Trạng thái kết nối wallet
- `walletType: 'metamask' | 'owallet' | 'keplr' | null` - Loại wallet đang kết nối
- `address: string | null` - Địa chỉ EVM (cho MetaMask/OWallet)
- `chainId: string | null` - Chain ID EVM (cho MetaMask/OWallet)
- `provider: ethers.providers.Web3Provider | null` - Provider EVM
- `network: string | null` - Network name
- `isConnecting: boolean` - Trạng thái đang kết nối

### Keplr Specific Properties

- `keplrAddress: string | null` - Địa chỉ Keplr
- `keplrChainId: string | null` - Chain ID Keplr
- `availableChains: string[]` - Danh sách chain có sẵn trong Keplr

### Methods

- `connectWallet(walletType, chainId?)` - Kết nối wallet
- `disconnectWallet()` - Ngắt kết nối wallet
- `switchNetwork(chainId)` - Chuyển đổi network (EVM hoặc Keplr)
- `switchKeplrChain(chainId)` - Chuyển đổi chain Keplr
- `getSigner()` - Lấy signer cho EVM
- `getBalance()` - Lấy balance cho EVM
- `getCurrentAddress()` - Lấy địa chỉ hiện tại (EVM hoặc Keplr)
- `getCurrentChainId()` - Lấy chain ID hiện tại (EVM hoặc Keplr)

## Keplr Integration

### Default Chain
Keplr mặc định kết nối đến chain `noble-1` (Noble). Bạn có thể thay đổi chain mặc định bằng cách:

```typescript
// Connect to specific chain
await connectWallet('keplr', 'cosmoshub-4');
```

### Chain Switching
```typescript
// Switch to different chain
await switchKeplrChain('osmosis-1');
```

### Account Selection
Keplr hỗ trợ nhiều account. Sử dụng `KeplrAccountSelector` component để chọn account:

```typescript
<KeplrAccountSelector
  onAccountSelect={(address) => {
    // Handle account selection
    console.log('Selected:', address);
  }}
/>
```

## Supported Chains

### EVM Chains (MetaMask/OWallet)
- Ethereum Mainnet
- BSC
- Polygon
- Arbitrum
- Optimism
- Và các chain khác

### Cosmos Chains (Keplr)
- Noble (noble-1) - Default
- Cosmos Hub (cosmoshub-4)
- Osmosis (osmosis-1)
- Juno (juno-1)
- Và các chain khác có trong Keplr

## Error Handling

```typescript
try {
  await connectWallet('keplr');
} catch (error) {
  if (error.message.includes('not installed')) {
    // Wallet not installed
    alert('Please install Keplr extension');
  } else if (error.message.includes('No accounts found')) {
    // No accounts in wallet
    alert('Please add accounts to your Keplr wallet');
  } else {
    // Other errors
    console.error('Connection failed:', error);
  }
}
```

## Event Listeners

Hook tự động lắng nghe các sự kiện:

- **EVM Wallets**: `accountsChanged`, `chainChanged`
- **Keplr**: `keplr_keystorechange`

## Best Practices

1. **Always handle errors**: Wrap wallet operations in try-catch
2. **Check wallet availability**: Verify wallet is installed before connecting
3. **Use appropriate chain**: Select the right chain for your use case
4. **Handle loading states**: Use `isConnecting` to show loading indicators
5. **Clean up on unmount**: Disconnect wallet when component unmounts

## Example Implementation

Xem file `WalletDemo.tsx` để có ví dụ hoàn chỉnh về cách sử dụng tất cả tính năng.
