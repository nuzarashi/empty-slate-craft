
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import Index from './pages/Index';
import RestaurantDetails from './pages/RestaurantDetails';
import NotFound from './pages/NotFound';
import LanguageProvider from './components/LanguageProvider';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/restaurants" element={<Index />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        {/* Add redirect for old URL pattern */}
        <Route path="/details/:id" element={<Navigate to={location => `/restaurant/${location.pathname.split('/')[2]}`} replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
