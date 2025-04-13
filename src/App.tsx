
import { Routes, Route } from 'react-router-dom';
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
