# Internationalization (i18n) Guide

This project uses `react-i18next` for internationalization support. The i18n configuration is set up to support both English and Vietnamese languages.

## Setup

The i18n configuration is located in `src/i18n/index.ts` and includes:

- **react-i18next**: React integration for i18next
- **i18next-browser-languagedetector**: Automatic language detection
- **Fallback language**: English (`en`)
- **Supported languages**: English (`en`) and Vietnamese (`vi`)

## Usage

### 1. Using Translation Hook

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('app.subtitle')}</p>
    </div>
  );
};
```

### 2. Translation Keys Structure

The translation keys are organized in a hierarchical structure:

```json
{
  "app": {
    "title": "OraiGold",
    "subtitle": "Bridge and manage your digital assets"
  },
  "nav": {
    "home": "Home",
    "components": "Components",
    "notifications": "Notifications"
  },
  "auth": {
    "login": "Login",
    "email": "Email",
    "password": "Password"
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success"
  }
}
```

### 3. Interpolation

For dynamic values, use interpolation:

```tsx
// In translation file
{
  "auth": {
    "loginSuccess": "Login successful with email: {{email}}"
  }
}

// In component
const { t } = useTranslation();
alert(t('auth.loginSuccess', { email: 'user@example.com' }));
```

### 4. Language Switching

The language can be changed using the store:

```tsx
import { useAppStore } from '../store';

const MyComponent = () => {
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
  };

  return (
    <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
      <option value="en">English</option>
      <option value="vi">Tiếng Việt</option>
    </select>
  );
};
```

## Translation Files

### English (`src/i18n/locales/en.json`)
Contains all English translations.

### Vietnamese (`src/i18n/locales/vi.json`)
Contains all Vietnamese translations.

## Adding New Translations

1. **Add the key to both language files** (`en.json` and `vi.json`)
2. **Use the key in your component** with the `t()` function
3. **Test both languages** to ensure proper translation

### Example:

```json
// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// vi.json
{
  "newFeature": {
    "title": "Tính năng mới",
    "description": "Đây là một tính năng mới"
  }
}
```

```tsx
// In component
const { t } = useTranslation();
return (
  <div>
    <h2>{t('newFeature.title')}</h2>
    <p>{t('newFeature.description')}</p>
  </div>
);
```

## Best Practices

1. **Use descriptive key names** that reflect the content structure
2. **Group related translations** under common namespaces
3. **Keep translations consistent** across the application
4. **Test with both languages** to ensure proper display
5. **Use interpolation** for dynamic content instead of concatenation
6. **Avoid hardcoding text** in components

## Language Detection

The application automatically detects the user's preferred language from:
1. Local storage (if previously set)
2. Browser language settings
3. HTML lang attribute

The detected language is persisted in local storage for future visits.

## Troubleshooting

### Translation not showing
- Check if the key exists in both language files
- Verify the key path is correct
- Ensure the component is wrapped in the i18n provider

### Language not switching
- Check if `setLanguage` is called correctly
- Verify the language code matches the available languages
- Check browser console for any errors

### Missing translations
- Add the missing key to both language files
- Use the same key structure in both files
- Test the translation in both languages
