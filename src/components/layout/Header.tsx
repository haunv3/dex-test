import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';
import Button from '../ui/Button';
import i18n from '../../i18n';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, setLanguage, user, logout } = useAppStore();

  const handleLanguageChange = () => {
    const newLanguage = language === 'en' ? 'vi' : 'en';
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              GOLD
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {t('navigation.home')}
            </a>
            <a
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              {t('navigation.dashboard')}
            </a>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageChange}
              className="text-sm"
            >
              {language === 'en' ? 'VI' : 'EN'}
            </Button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-sm"
            >
              {theme.mode === 'light' ? '🌙' : '☀️'}
            </Button>

            {/* User menu */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  {t('navigation.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                >
                  {t('navigation.login')}
                </a>
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors duration-200"
                >
                  {t('navigation.register')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
