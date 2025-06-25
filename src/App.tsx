import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider from './providers/AppProvider';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Components from './pages/Components';
import Swap from './pages/Swap';
import './i18n';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="components" element={<Components />} />
          </Route>
          <Route path="/swap" element={<Swap />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
