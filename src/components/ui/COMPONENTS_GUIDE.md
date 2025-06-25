# UI Components Guide

Hướng dẫn sử dụng các component dùng chung trong dự án.

## Modal Component

Modal component với các tính năng:
- Backdrop click để đóng
- ESC key để đóng
- Responsive design
- Multiple sizes
- Customizable header

### Usage

```tsx
import { Modal } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <p>Modal content goes here</p>
</Modal>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Trạng thái hiển thị modal |
| `onClose` | `() => void` | - | Callback khi đóng modal |
| `title` | `string` | - | Tiêu đề modal |
| `children` | `ReactNode` | - | Nội dung modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Kích thước modal |
| `showCloseButton` | `boolean` | `true` | Hiển thị nút đóng |
| `closeOnBackdropClick` | `boolean` | `true` | Đóng khi click backdrop |
| `closeOnEscape` | `boolean` | `true` | Đóng khi nhấn ESC |

## Toast Notification

Toast notification với các loại thông báo khác nhau và animation.

### Usage

```tsx
import { ToastContainer } from '@/components/ui';

// Thêm ToastContainer vào App
<ToastContainer position="top-right" />

// Hiển thị toast từ bất kỳ đâu
(window as any).showToast({
  type: 'success',
  title: 'Thành công!',
  message: 'Thao tác đã được thực hiện.',
  duration: 4000,
});
```

### Toast Types

- `success`: Thông báo thành công (màu xanh)
- `error`: Thông báo lỗi (màu đỏ)
- `warning`: Thông báo cảnh báo (màu vàng)
- `info`: Thông báo thông tin (màu xanh dương)

### Positions

- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`
- `top-center`
- `bottom-center`

## TextInput Component

Input component cải tiến với nhiều tính năng:
- Validation states
- Character count
- Password visibility toggle
- Search functionality
- Multiple variants

### Usage

```tsx
import { TextInput } from '@/components/ui';

// Basic input
<TextInput
  label="Email"
  placeholder="Enter your email"
  helperText="We'll never share your email"
/>

// Password input
<TextInput
  label="Password"
  type="password"
  isPassword
  placeholder="Enter password"
/>

// Search input
<TextInput
  label="Search"
  isSearch
  placeholder="Search..."
  onSearch={(value) => console.log(value)}
/>

// Input with character count
<TextInput
  label="Description"
  maxLength={100}
  showCharacterCount
  placeholder="Enter description"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label cho input |
| `error` | `string` | - | Thông báo lỗi |
| `helperText` | `string` | - | Text hỗ trợ |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Kích thước input |
| `variant` | `'outlined' \| 'filled' \| 'underlined'` | `'outlined'` | Kiểu dáng input |
| `isPassword` | `boolean` | `false` | Input mật khẩu |
| `isSearch` | `boolean` | `false` | Input tìm kiếm |
| `showCharacterCount` | `boolean` | `false` | Hiển thị đếm ký tự |
| `maxLength` | `number` | - | Số ký tự tối đa |
| `onSearch` | `(value: string) => void` | - | Callback khi search |
| `onClear` | `() => void` | - | Callback khi clear |

## Button Component

Button component với nhiều variant và states.

### Usage

```tsx
import { Button } from '@/components/ui';

// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading>Loading...</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

## Demo Component

Để test tất cả các component, sử dụng `ComponentDemo`:

```tsx
import ComponentDemo from '@/components/ui/ComponentDemo';

// Trong route hoặc page
<ComponentDemo />
```

## Styling

Tất cả các component đều sử dụng Tailwind CSS và hỗ trợ dark mode. Các component có thể được customize thông qua:

1. **Props**: Sử dụng các prop có sẵn
2. **className**: Thêm custom classes
3. **CSS Variables**: Override các biến CSS
4. **Tailwind Config**: Tùy chỉnh theme trong `tailwind.config.js`

## Best Practices

1. **Accessibility**: Tất cả component đều có ARIA labels và keyboard navigation
2. **Responsive**: Components tự động responsive trên mobile
3. **Performance**: Sử dụng React.memo và useCallback khi cần thiết
4. **TypeScript**: Full TypeScript support với type definitions
5. **Testing**: Components có thể dễ dàng test với testing library
