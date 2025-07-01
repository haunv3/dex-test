# zKen Frontend

A modern React application built with TypeScript, Tailwind CSS, Zustand, and React i18n.

## 🚀 Features

- **React 19** with TypeScript
- **Tailwind CSS** for styling with dark mode support
- **Zustand** for state management
- **React i18n** for internationalization (English & Vietnamese)
- **Vite** for fast development and building
- **Modern UI Components** with theme support

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── layout/             # Layout components
│       ├── Header.tsx
│       └── Layout.tsx
├── i18n/                   # Internationalization
│   ├── index.ts           # i18n configuration
│   └── locales/           # Translation files
│       ├── en.json
│       └── vi.json
├── pages/                  # Page components
│   └── Home.tsx
├── store/                  # Zustand stores
│   └── index.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
├── App.tsx                 # Main App component
├── main.tsx               # App entry point
└── index.css              # Global styles
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React i18n** - Internationalization
- **Vite** - Build tool and dev server
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging utility

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd oraigold-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Theme System

The application supports both light and dark themes:

- **Light Theme**: Clean, modern design with light backgrounds
- **Dark Theme**: Dark backgrounds with proper contrast
- **Auto-switching**: Theme preference is saved in localStorage
- **Toggle**: Users can switch themes using the theme toggle button

### Theme Colors

The project uses a custom color palette defined in `tailwind.config.js`:

- **Primary**: Blue shades for main actions and branding
- **Secondary**: Gray shades for neutral elements
- **Semantic**: Red for errors, green for success, etc.

## 🌍 Internationalization

The application supports multiple languages:

- **English** (en) - Default language
- **Vietnamese** (vi) - Secondary language

### Adding New Languages

1. Create a new translation file in `src/i18n/locales/`
2. Add the language to the resources in `src/i18n/index.ts`
3. Update the language selector in the Header component

### Using Translations

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return <h1>{t('common.welcome')}</h1>;
};
```

## 📊 State Management

The application uses Zustand for state management with the following features:

- **Global App State**: User, theme, language, loading states
- **Persistence**: Theme and language preferences are saved
- **Type Safety**: Full TypeScript support
- **Simple API**: Easy to use and understand

### Store Structure

```typescript
interface AppState {
  user: User | null;
  theme: Theme;
  language: string;
  isLoading: boolean;
}
```

### Using the Store

```tsx
import { useAppStore } from './store';

const MyComponent = () => {
  const { user, theme, toggleTheme } = useAppStore();

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme.mode}
    </button>
  );
};
```

## 🧩 Component Library

The project includes a set of reusable UI components:

### Button Component

```tsx
<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes**: `sm`, `md`, `lg`

### Input Component

```tsx
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email"
/>
```

### Card Component

```tsx
<Card padding="md" shadow="sm">
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>
```

## 🎯 Best Practices

### Code Organization

- **Components**: Keep components small and focused
- **Types**: Define types in the `types/` directory
- **Stores**: Use Zustand for global state, local state for component-specific data
- **Styling**: Use Tailwind CSS classes, avoid custom CSS when possible

### Performance

- **Lazy Loading**: Use React.lazy for code splitting
- **Memoization**: Use React.memo for expensive components
- **Bundle Size**: Keep dependencies minimal

### Accessibility

- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add appropriate ARIA attributes
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
- **Color Contrast**: Maintain proper contrast ratios

## 🔧 Configuration Files

### Tailwind CSS (`tailwind.config.js`)

- Custom color palette
- Dark mode configuration
- Custom animations
- Font configuration

### TypeScript (`tsconfig.json`)

- Strict type checking
- Modern JavaScript features
- Path mapping for clean imports

### Vite (`vite.config.ts`)

- React plugin
- TypeScript support
- Development server configuration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support and questions, please open an issue on GitHub.

## 📄 Docker

### Production Build

Build and run the production Docker image:

```bash
# Build the image
docker build -t oraigold-frontend .

# Run the container
docker run -p 3000:80 oraigold-frontend
```

Or use Docker Compose:

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d
```

### Development

For development with hot reload:

```bash
# Build and run development container
docker-compose --profile dev up --build

# Or build manually
docker build -f Dockerfile.dev -t oraigold-frontend-dev .
docker run -p 3001:3000 -v $(pwd):/app oraigold-frontend-dev
```

### Docker Commands

```bash
# Build production image
docker build -t oraigold-frontend .

# Build development image
docker build -f Dockerfile.dev -t oraigold-frontend-dev .

# Run production container
docker run -p 3000:80 oraigold-frontend

# Run development container
docker run -p 3001:3000 -v $(pwd):/app oraigold-frontend-dev

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```
