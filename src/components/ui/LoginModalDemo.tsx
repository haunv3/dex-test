import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LoginModal from './LoginModal';

const LoginModalDemo: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    // Simulate API call
    console.log('Login attempt:', { email, password });

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Close modal after successful login
    setIsModalOpen(false);

    // You can add your actual login logic here
    alert(t('auth.loginSuccess', { email }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Demo Login Modal
        </h1>
        <p className="text-gray-600 mb-8">
          {t('demo.clickToOpenLoginModal')}
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          {t('demo.openLoginModal')}
        </button>

        <LoginModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
};

export default LoginModalDemo;
