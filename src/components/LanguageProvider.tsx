
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner'; 
import { LanguageContext, Language, translations } from '../contexts/LanguageContext';

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize with the stored language preference or default to English
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('preferredLanguage');
    return (stored === 'en' || stored === 'ja') ? stored : 'en';
  });

  // Update document language when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    
    // Log when language changes to help with debugging
    console.log('Language changed to:', language);

    // Notify users when language changes
    toast.success(language === 'en' ? 'Language changed to English' : '言語が日本語に変更されました');
  }, [language]);

  // Set language method with additional safety
  const setAppLanguage = (newLanguage: Language) => {
    if (newLanguage === 'en' || newLanguage === 'ja') {
      setLanguage(newLanguage);
      localStorage.setItem('preferredLanguage', newLanguage);
    } else {
      console.error('Invalid language selected:', newLanguage);
      setLanguage('en'); // Default to English on invalid selection
    }
  };

  // Translation function
  const t = (key: keyof typeof translations.en): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setAppLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
