import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider from './providers/AppProvider';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Components from './pages/Components';
import Swap from './pages/Swap';
import MultiWalletDemo from './components/MultiWalletDemo';
import './i18n';
import { initializeOraidexCommon } from './initCommon';
import { useTokens } from './hooks/useTokens';
import { useEffect } from 'react';

function App() {
  const {
    allOraichainTokens,
    allOtherChainTokens,
  } = useTokens();

  useEffect(() => {
    initializeOraidexCommon(allOraichainTokens, allOtherChainTokens);
  }, []);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="components" element={<Components />} />
            <Route path="multi-wallet" element={<MultiWalletDemo />} />
          </Route>
          <Route path="/swap" element={<Swap />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
