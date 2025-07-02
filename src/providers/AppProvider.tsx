import React, { useEffect } from 'react';
import { useAppStore } from '../store';
import i18n from '../i18n';

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { theme, language } = useAppStore();

  // Sync language from store with i18next
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);

  // Apply theme to document body
  useEffect(() => {
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme.mode]);

  return <>{children}</>;
};

export default AppProvider;
