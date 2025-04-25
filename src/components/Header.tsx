
import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import LanguageSelector, { LanguageSelectorProps } from './LanguageSelector';
import PreferencesMenu, { DiningPreferences } from './PreferencesMenu';
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

interface HeaderProps {
  locationName?: string;
}

const defaultPreferences: DiningPreferences = {
  budget: [1, 4], // Min and max budget
  maxDistance: [15], // Max distance in minutes
  mealType: 'main'
};

const Header: React.FC<HeaderProps> = ({ locationName }) => {
  const { t } = useContext(LanguageContext);
  
  const handleLanguageChange = (language: import('../contexts/LanguageContext').Language) => {
    console.log('Language changed to:', language);
    // TODO: Implement language change functionality
  };

  const handlePreferencesChange = (preferences: DiningPreferences) => {
    console.log('Preferences changed:', preferences);
    // TODO: Connect this to the restaurant filtering logic
  };

  return (
    <header className="sticky top-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Map className="h-6 w-6 text-food-orange" />
          <h1 className="text-xl font-bold font-display text-food-dark">
            {locationName ? `${t('restaurants')} ${t('nearby')}` : t('what_to_eat')}
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <PreferencesMenu 
            initialPreferences={defaultPreferences} 
            onPreferencesChange={handlePreferencesChange} 
          />
          <LanguageSelector onLanguageChange={handleLanguageChange} />
        </div>
      </div>
    </header>
  );
};

export default Header;
