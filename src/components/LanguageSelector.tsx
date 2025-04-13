
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export type Language = 'en' | 'ja';

interface LanguageSelectorProps {
  onLanguageChange: (language: Language) => void;
}

const languageNames: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
};

// Sample translations for demonstration
export const translations = {
  en: {
    nearbySpots: 'Nearby Spots',
    filter: 'Filter',
    hide: 'Hide',
    mealType: 'Meal Type',
    mainMeal: 'Main Meal',
    drinking: 'Drinking',
    dietary: 'Dietary Restrictions',
    anyDiet: 'Any Diet',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    glutenFree: 'Gluten Free',
    halal: 'Halal',
    sortBy: 'Sort By',
    distance: 'Distance',
    rating: 'Rating',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    openNow: 'Open Now',
    minRating: 'Minimum Rating',
    priceRange: 'Price Range',
    loading: 'Loading...',
    findingLocation: 'Finding your location...',
    allowAccess: 'Please allow location access if prompted',
    findingPlaces: 'Finding delicious places nearby...',
    noResults: 'No restaurants match your filters.',
    resetFilters: 'Reset Filters',
    loadMore: 'Load More',
    reviews: 'Reviews',
    mostRecent: 'Most Recent',
    mostHelpful: 'Most Helpful',
    generatingSummary: 'Generating AI summary...',
    viewOnMaps: 'View on Google Maps',
    reviewSummary: 'AI Review Summary',
  },
  ja: {
    nearbySpots: '近くのスポット',
    filter: 'フィルター',
    hide: '隠す',
    mealType: '食事タイプ',
    mainMeal: 'メインの食事',
    drinking: '飲み物',
    dietary: '食事制限',
    anyDiet: '制限なし',
    vegetarian: 'ベジタリアン',
    vegan: 'ビーガン',
    glutenFree: 'グルテンフリー',
    halal: 'ハラール',
    sortBy: '並び替え',
    distance: '距離',
    rating: '評価',
    priceLowToHigh: '価格: 安い順',
    priceHighToLow: '価格: 高い順',
    openNow: '営業中',
    minRating: '最低評価',
    priceRange: '価格帯',
    loading: '読み込み中...',
    findingLocation: '位置情報を取得中...',
    allowAccess: '位置情報へのアクセスを許可してください',
    findingPlaces: '近くの美味しいお店を探しています...',
    noResults: 'フィルターに一致するレストランがありません。',
    resetFilters: 'フィルターをリセット',
    loadMore: 'もっと読み込む',
    reviews: 'レビュー',
    mostRecent: '最新順',
    mostHelpful: '役立つ順',
    generatingSummary: 'AIサマリーを生成中...',
    viewOnMaps: 'Googleマップで見る',
    reviewSummary: 'AIレビュー要約',
  },
};

// Create a context for language
export const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key as string,
});

// Custom hook to use the language context
export const useLanguage = () => {
  return React.useContext(LanguageContext);
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onLanguageChange }) => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange(lang);
    // Store the selected language in localStorage for persistence
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white">
        {Object.entries(languageNames).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code as Language)}
            className={language === code ? "bg-muted" : ""}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
