# LoginModal Component

Một modal đăng nhập đẹp và hiện đại được xây dựng với React, TypeScript và Tailwind CSS.

## Tính năng

- ✅ Thiết kế responsive và hiện đại
- ✅ Form validation cơ bản
- ✅ Hiển thị/ẩn mật khẩu
- ✅ Loading state với spinner
- ✅ Social login buttons (Google, Facebook)
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Sign up link
- ✅ Backdrop click để đóng
- ✅ Keyboard accessibility
- ✅ Smooth animations và transitions

## Cách sử dụng

### 1. Import component

```tsx
import LoginModal from './components/ui/LoginModal';
```

### 2. Sử dụng trong component

```tsx
import React, { useState } from 'react';
import LoginModal from './components/ui/LoginModal';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Gọi API đăng nhập của bạn ở đây
      const response = await loginAPI(email, password);

      if (response.success) {
        setIsModalOpen(false);
        // Xử lý sau khi đăng nhập thành công
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Đăng nhập
      </button>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Trạng thái hiển thị modal |
| `onClose` | `() => void` | ✅ | Callback khi đóng modal |
| `onLogin` | `(email: string, password: string) => Promise<void>` | ✅ | Callback khi submit form đăng nhập |

## Demo

Để xem demo, import và sử dụng `LoginModalDemo`:

```tsx
import LoginModalDemo from './components/ui/LoginModalDemo';

// Trong App.tsx hoặc component khác
<LoginModalDemo />
```

## Tùy chỉnh

### Thay đổi màu sắc

Modal sử dụng Tailwind CSS classes. Bạn có thể thay đổi màu sắc bằng cách:

1. Thay đổi `blue-600` thành màu khác trong các class
2. Hoặc tùy chỉnh trong `tailwind.config.js`

### Thêm validation

Bạn có thể thêm validation logic trong `handleSubmit` function:

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Thêm validation
  if (!email.includes('@')) {
    alert('Email không hợp lệ');
    return;
  }

  if (password.length < 6) {
    alert('Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }

  setIsLoading(true);
  // ... rest of the logic
};
```

### Tùy chỉnh social login

Để thêm social login thực tế, thay thế các button trong phần "Social Login Buttons" với logic của bạn.

## Dependencies

- React 19+
- TypeScript
- Tailwind CSS

Không cần thêm dependencies nào khác vì tất cả icons đều sử dụng SVG inline.
