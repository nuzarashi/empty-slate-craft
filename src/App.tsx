
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import Index from './pages/Index';
import RestaurantDetails from './pages/RestaurantDetails';
import NotFound from './pages/NotFound';
import LanguageProvider from './components/LanguageProvider';
import './App.css';

// Create a wrapper component for the redirect with proper typing
const OldRouteRedirect = () => {
  const location = useLocation();
  const id = location.pathname.split('/')[2];
  return <Navigate to={`/restaurant/${id}`} replace />;
};

function App() {
  return (
    <LanguageProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/restaurants" element={<Index />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        {/* Add redirect for old URL pattern */}
        <Route path="/details/:id" element={<OldRouteRedirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
