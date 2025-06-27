# Keplr Connection Debug Guide

## Vấn đề thường gặp và cách khắc phục

### 1. Keplr không được phát hiện

**Triệu chứng:**
- Console hiển thị "Keplr not detected"
- Không có nút Keplr trong wallet selector

**Nguyên nhân:**
- Keplr extension chưa được cài đặt
- Keplr extension bị vô hiệu hóa
- Trang web không có quyền truy cập Keplr

**Cách khắc phục:**
1. Cài đặt Keplr extension từ https://www.keplr.app/
2. Refresh trang web
3. Kiểm tra xem Keplr có bị vô hiệu hóa không
4. Đảm bảo trang web chạy trên HTTPS (localhost cũng được)

### 2. Keplr được phát hiện nhưng không kết nối được

**Triệu chứng:**
- Console hiển thị "Keplr detected" nhưng connection failed
- Lỗi "No accounts found in Keplr"

**Nguyên nhân:**
- Chưa có account nào trong Keplr
- Chain không được thêm vào Keplr
- User từ chối kết nối

**Cách khắc phục:**
1. Thêm account vào Keplr:
   - Mở Keplr extension
   - Click "Add Account"
   - Import từ seed phrase hoặc tạo account mới

2. Thêm Noble chain:
   - Mở Keplr extension
   - Click "Settings" > "Chain Management"
   - Tìm và thêm "Noble" chain

3. Chấp nhận kết nối:
   - Khi popup xuất hiện, click "Approve"

### 3. Chain không được hỗ trợ

**Triệu chứng:**
- Lỗi "Chain not found" hoặc "Chain not supported"
- Không thể switch chain

**Nguyên nhân:**
- Chain chưa được thêm vào Keplr
- Chain ID không đúng

**Cách khắc phục:**
1. Thêm chain vào Keplr:
   - Mở Keplr extension
   - Click "Settings" > "Chain Management"
   - Tìm và thêm chain cần thiết

2. Kiểm tra chain ID:
   - Noble: `noble-1`
   - Cosmos Hub: `cosmoshub-4`
   - Osmosis: `osmosis-1`

### 4. Account không hiển thị

**Triệu chứng:**
- Kết nối thành công nhưng không thấy account
- Account selector trống

**Nguyên nhân:**
- Account chưa được thêm vào chain hiện tại
- Chain không có account nào

**Cách khắc phục:**
1. Thêm account vào chain:
   - Mở Keplr extension
   - Chọn chain cần thiết
   - Click "Add Account" hoặc import account

2. Switch sang chain khác:
   - Thử switch sang chain khác có account

## Debug Steps

### Bước 1: Kiểm tra Keplr Installation
```javascript
// Mở browser console và chạy:
console.log('Keplr available:', typeof window.keplr !== 'undefined');
if (typeof window.keplr !== 'undefined') {
  console.log('Keplr version:', window.keplr.version);
}
```

### Bước 2: Kiểm tra Available Chains
```javascript
// Chạy trong console:
window.keplr.getChainInfosWithoutEndpoints().then(chains => {
  console.log('Available chains:', chains.map(c => c.chainId));
});
```

### Bước 3: Kiểm tra Accounts
```javascript
// Chạy trong console (thay 'noble-1' bằng chain ID):
window.keplr.enable('noble-1').then(() => {
  const signer = window.keplr.getOfflineSigner('noble-1');
  return signer.getAccounts();
}).then(accounts => {
  console.log('Accounts:', accounts);
});
```

### Bước 4: Test Connection
```javascript
// Chạy trong console:
window.keplr.enable('noble-1').then(() => {
  console.log('Keplr enabled for noble-1');
  const signer = window.keplr.getOfflineSigner('noble-1');
  return signer.getAccounts();
}).then(accounts => {
  if (accounts.length > 0) {
    console.log('Connected account:', accounts[0].address);
  } else {
    console.log('No accounts found');
  }
}).catch(error => {
  console.error('Connection failed:', error);
});
```

## Sử dụng KeplrTest Component

1. Import và sử dụng `KeplrTest` component:
```typescript
import KeplrTest from './components/KeplrTest';

// Trong component của bạn:
<KeplrTest />
```

2. Chạy các test theo thứ tự:
   - **Test Keplr Detection**: Kiểm tra Keplr có được phát hiện không
   - **Test Keplr Connection**: Thử kết nối Keplr
   - **Test Chain Switching**: Thử chuyển đổi chain
   - **Show Account Info**: Hiển thị thông tin account hiện tại

3. Xem kết quả trong "Test Results" section

## Console Logs

Khi debug, hãy mở browser console và tìm các log sau:

- `Checking wallet connection...`
- `Keplr detected` hoặc `Keplr not detected`
- `Attempting to enable Keplr for chain: noble-1`
- `Keplr enabled successfully`
- `Got offline signer`
- `Keplr accounts found: X`
- `Selected account: [address]`
- `Available chains for Keplr: [chains]`
- `Keplr connected successfully`

## Common Error Messages

| Error Message | Nguyên nhân | Cách khắc phục |
|---------------|-------------|----------------|
| "Keplr is not installed" | Keplr chưa cài đặt | Cài đặt Keplr extension |
| "No accounts found in Keplr" | Chưa có account | Thêm account vào Keplr |
| "User rejected" | User từ chối kết nối | Chấp nhận kết nối trong popup |
| "Chain not found" | Chain chưa thêm | Thêm chain vào Keplr |
| "already pending" | Có request đang chờ | Đợi hoặc refresh trang |

## Tips

1. **Luôn refresh trang** sau khi cài đặt Keplr
2. **Kiểm tra console** để xem log chi tiết
3. **Sử dụng KeplrTest component** để debug
4. **Đảm bảo HTTPS** hoặc localhost
5. **Kiểm tra popup blocker** có chặn Keplr không
