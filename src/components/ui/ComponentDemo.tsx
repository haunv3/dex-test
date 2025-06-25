import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, TextInput } from './index';

const ComponentDemo: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: t('toast.successTitle'), message: t('toast.successMessage') },
      error: { title: t('toast.errorTitle'), message: t('toast.errorMessage') },
      warning: { title: t('toast.warningTitle'), message: t('toast.warningMessage') },
      info: { title: t('toast.infoTitle'), message: t('toast.infoMessage') },
    };

    (window as any).showToast({
      type,
      ...messages[type],
      duration: 4000,
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('demo.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('demo.subtitle')}
        </p>
      </div>

      {/* Button Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('demo.buttons')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="danger">Danger Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="md">Medium Button</Button>
          <Button size="lg">Large Button</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading Button</Button>
          <Button disabled>Disabled Button</Button>
        </div>
      </div>

      {/* TextInput Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('demo.textInputs')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput
            label={t('demo.basicInput')}
            placeholder={t('demo.enterInfo')}
            helperText={t('demo.helperText')}
          />

          <TextInput
            label={t('demo.inputWithError')}
            placeholder={t('demo.enterInfo')}
            error={t('errors.pleaseEnterValidInfo')}
          />

          <TextInput
            label={t('demo.searchInput')}
            placeholder={t('demo.searchPlaceholder')}
            isSearch
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={(value) => console.log('Searching for:', value)}
            onClear={() => setSearchValue('')}
          />

          <TextInput
            label={t('demo.passwordInput')}
            placeholder={t('demo.enterPasswordPlaceholder')}
            isPassword
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
          />

          <TextInput
            label={t('demo.characterCount')}
            placeholder={t('demo.enterMax50Chars')}
            maxLength={50}
            showCharacterCount
          />

          <TextInput
            label={t('demo.filledVariant')}
            placeholder={t('demo.filledInput')}
            variant="filled"
          />
        </div>
      </div>

      {/* Modal Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('demo.modal')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setIsModalOpen(true)}>
            {t('demo.openModal')}
          </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('demo.demoModal')}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {t('demo.modalContent')}
            </p>

            <div className="space-y-3">
              <TextInput
                label={t('auth.email')}
                type="email"
                placeholder={t('demo.exampleEmail')}
              />

              <TextInput
                label={t('auth.password')}
                type="password"
                placeholder={t('demo.enterPasswordModal')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setIsModalOpen(false)}>
                {t('common.submit')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* Toast Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('demo.toastNotifications')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => showToast('success')}>
            {t('demo.successToast')}
          </Button>
          <Button onClick={() => showToast('error')}>
            {t('demo.errorToast')}
          </Button>
          <Button onClick={() => showToast('warning')}>
            {t('demo.warningToast')}
          </Button>
          <Button onClick={() => showToast('info')}>
            {t('demo.infoToast')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComponentDemo;
