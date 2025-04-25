
import React, { useContext } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageContext, Language } from '../contexts/LanguageContext';

export interface LanguageSelectorProps {
  onLanguageChange?: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { language, setLanguage } = useContext(LanguageContext);
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    
    // Call the optional callback if provided
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center text-sm text-muted-foreground">
          <Globe className="w-5 h-5 mr-1" />
          <span className="capitalize">{language === 'en' ? 'English' : '日本語'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('ja')}>
          日本語
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
