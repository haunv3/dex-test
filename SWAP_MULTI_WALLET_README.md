# Multi-Wallet Integration in Swap Interface

Hệ thống kết nối đa ví đã được tích hợp hoàn toàn vào màn hình swap, cho phép người dùng kết nối nhiều ví và thực hiện giao dịch swap với giao diện thân thiện.

## Tính năng chính

### 🔗 Kết nối đa ví trong Swap
- **Header**: Hiển thị tổng quan các ví đã kết nối
- **Swap Card**: Hiển thị chi tiết từng ví và trạng thái kết nối
- **Assets Modal**: Quản lý tài sản từ tất cả các ví

### 📱 Giao diện người dùng
- **Multi-wallet button**: Hiển thị số lượng ví đã kết nối
- **Wallet info panel**: Chi tiết từng ví (EVM/Cosmos)
- **Connection status**: Thông báo trạng thái kết nối
- **Network switching**: Chuyển đổi mạng dễ dàng

## Cấu trúc tích hợp

### 1. SwapHeader Component
```tsx
// Hiển thị button kết nối đa ví
<Button onClick={handleConnectWallet}>
  {isConnected ? (
    <div className="flex items-center space-x-2">
      {/* Hiển thị icons của các ví đã kết nối */}
      {connections.slice(0, 2).map((conn, index) => (
        <span key={index}>{getWalletIcon(conn.walletType)}</span>
      ))}
      <span>{formatAddress(primaryAddress)}</span>
      {totalConnections > 1 && (
        <span>+{totalConnections - 1}</span>
      )}
    </div>
  ) : (
    'Connect Wallet'
  )}
</Button>
```

### 2. SwapCard Component
```tsx
// Tích hợp multi-wallet vào swap logic
const { isConnected, connections, getEVMAddresses, getSigner } = useWallet();

const handleSwap = async () => {
  // Kiểm tra kết nối ví
  if (!isConnected) {
    alert('Please connect your wallet first');
    return;
  }

  // Lấy EVM wallet để ký giao dịch
  const evmAddresses = getEVMAddresses();
  if (evmAddresses.length === 0) {
    alert('No EVM wallet connected');
    return;
  }

  // Thực hiện swap
  const signer = await getSigner();
  // ... swap logic
};
```

### 3. WalletInfo Component
```tsx
// Hiển thị thông tin chi tiết các ví đã kết nối
const WalletInfo = () => {
  const { connections, getAllAddresses } = useWallet();
  const allAddresses = getAllAddresses();

  return (
    <div className="wallet-info-panel">
      {/* EVM Wallets */}
      {allAddresses.evm.map((addr, index) => (
        <div key={index}>
          {getWalletIcon(addr.walletType)} {getWalletName(addr.walletType)}
          {formatAddress(addr.address)}
        </div>
      ))}

      {/* Cosmos Wallets */}
      {allAddresses.cosmos.map((addr, index) => (
        <div key={index}>
          {getWalletIcon(addr.walletType)} {getWalletName(addr.walletType)}
          {formatAddress(addr.address)}
        </div>
      ))}
    </div>
  );
};
```

## Luồng hoạt động

### 1. Kết nối ví
```
User clicks "Connect Wallet"
→ Opens MultiWalletModal
→ User selects wallet types (MetaMask, OWallet EVM, OWallet Cosmos)
→ System connects to selected wallets
→ Updates header and swap card with connection status
```

### 2. Thực hiện swap
```
User enters swap details
→ System checks wallet connections
→ Validates EVM wallet availability
→ Uses primary EVM wallet for transaction signing
→ Executes swap transaction
→ Shows transaction result
```

### 3. Quản lý tài sản
```
User clicks connected wallet button
→ Opens WalletAssetsModal
→ Shows assets from all connected wallets
→ Allows individual wallet disconnection
→ Provides network switching options
```

## API Integration

### useWallet Hook trong Swap
```typescript
const {
  isConnected,           // Trạng thái kết nối tổng
  connections,           // Danh sách tất cả kết nối
  getEVMAddresses,       // Lấy địa chỉ EVM
  getCosmosAddresses,    // Lấy địa chỉ Cosmos
  getSigner,             // Lấy signer cho giao dịch
  disconnectConnection,  // Ngắt kết nối ví cụ thể
} = useWallet();
```

### Swap Transaction Flow
```typescript
const handleSwap = async () => {
  // 1. Kiểm tra kết nối
  if (!isConnected) return;

  // 2. Lấy EVM wallet
  const evmAddresses = getEVMAddresses();
  if (evmAddresses.length === 0) return;

  // 3. Lấy signer
  const signer = await getSigner();

  // 4. Thực hiện giao dịch
  const contract = Bridge__factory.connect(contractAddress, signer);
  const tx = await contract.sendToCosmos(tokenAddress, to, amount);
  await tx.wait();
};
```

## Giao diện người dùng

### Header Display
- **Chưa kết nối**: "Connect Wallet" button
- **Đã kết nối**: Hiển thị icons của các ví + địa chỉ chính + số lượng ví phụ

### Swap Card Status
- **Warning**: "Please connect your wallet to start swapping"
- **Success**: "X wallets connected (Y EVM, Z Cosmos)"
- **Wallet Info Panel**: Chi tiết từng ví đã kết nối

### Assets Modal
- **Multi-wallet header**: Tổng quan số lượng ví
- **Assets by network**: Tài sản theo từng mạng
- **Individual disconnect**: Ngắt kết nối từng ví riêng biệt

## Lợi ích

### 1. Trải nghiệm người dùng
- **Đơn giản**: Một nút kết nối cho tất cả ví
- **Rõ ràng**: Hiển thị trạng thái kết nối rõ ràng
- **Linh hoạt**: Kết nối/ngắt kết nối từng ví riêng biệt

### 2. Tính năng kỹ thuật
- **Multi-chain**: Hỗ trợ cả EVM và Cosmos
- **Auto-detection**: Tự động phát hiện ví đã kết nối
- **Error handling**: Xử lý lỗi kết nối và giao dịch

### 3. Bảo mật
- **Validation**: Kiểm tra loại ví trước khi thực hiện giao dịch
- **User control**: Người dùng kiểm soát hoàn toàn việc kết nối
- **Clear feedback**: Thông báo rõ ràng về trạng thái

## Cấu hình

### Environment Variables
```env
# Không cần thêm biến môi trường mới
# Sử dụng cấu hình hiện có của dự án
```

### Dependencies
```json
{
  "ethers": "^5.7.2",
  "@oraichain/oraidex-common": "latest"
}
```

## Troubleshooting

### Lỗi thường gặp

1. **"No EVM wallet connected"**
   - Kết nối MetaMask hoặc OWallet (EVM mode)
   - Kiểm tra ví đã được unlock

2. **"Unable to get wallet signer"**
   - Kiểm tra kết nối mạng
   - Thử kết nối lại ví

3. **"Swap failed"**
   - Kiểm tra số dư token
   - Kiểm tra gas fee
   - Kiểm tra slippage tolerance

### Debug
```typescript
// Bật debug mode
console.log('Wallet connections:', connections);
console.log('EVM addresses:', getEVMAddresses());
console.log('Cosmos addresses:', getCosmosAddresses());
```

## Roadmap

- [ ] Hỗ trợ Keplr wallet
- [ ] Auto-balance refresh
- [ ] Transaction history
- [ ] Cross-chain swap
- [ ] Batch transactions
- [ ] Wallet backup/restore
