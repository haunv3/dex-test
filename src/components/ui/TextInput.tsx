import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled' | 'underlined';
  showCharacterCount?: boolean;
  maxLength?: number;
  isPassword?: boolean;
  isSearch?: boolean;
  onClear?: () => void;
  onSearch?: (value: string) => void;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'outlined',
  showCharacterCount = false,
  maxLength,
  isPassword = false,
  isSearch = false,
  onClear,
  onSearch,
  className,
  id,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(e);
    }

    if (onSearch) {
      onSearch(newValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    if (onClear) {
      onClear();
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    outlined: 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700',
    filled: 'border-0 bg-gray-100 dark:bg-gray-800',
    underlined: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none',
  };

  const baseClasses = 'w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const stateClasses = error
    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500';

  const themeClasses = 'text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400';

  const iconClasses = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';

  const inputClasses = twMerge(
    clsx(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      stateClasses,
      themeClasses,
      iconClasses,
      className
    )
  );

  const characterCount = typeof inputValue === 'string' ? inputValue.length : 0;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          id={inputId}
          type={isPassword && !showPassword ? 'password' : 'text'}
          className={inputClasses}
          value={inputValue}
          onChange={handleInputChange}
          maxLength={maxLength}
          {...props}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}

          {isSearch && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {rightIcon && !isPassword && !isSearch && (
            <div className="h-5 w-5 text-gray-400 dark:text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {helperText && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {helperText}
            </p>
          )}
        </div>

        {showCharacterCount && maxLength && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {characterCount}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextInput;
