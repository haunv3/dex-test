import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import BridgeTab from '../components/tabs/BridgeTab';
import PortfolioTab from '../components/tabs/PortfolioTab';
import TabNavigation from '../components/ui/TabNavigation';
import Button from '../components/ui/Button';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'bridge' | 'portfolio'>('bridge');

  const tabs = [
    {
      id: 'bridge',
      label: t('tabs.bridge'),
      icon: '🌉',
    },
    {
      id: 'portfolio',
      label: t('tabs.portfolio'),
      icon: '💼',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {t('app.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          {t('app.subtitle')}
        </p>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <Link to="/swap">
            <Button variant="primary" size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600">
              🚀 Start Swapping
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as 'bridge' | 'portfolio')}
      />

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'bridge' && <BridgeTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
      </div>
    </div>
  );
};

export default Home;
