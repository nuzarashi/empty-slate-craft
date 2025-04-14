
import React, { createContext } from 'react';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Language = 'en' | 'ja';

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

// Create the context with a default value
export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: keyof typeof translations.en) => key.toString(),
});

// Define translations
export const translations = {
  en: {
    // General
    restaurants: 'Restaurants',
    home: 'Home',
    loading: 'Loading',
    no_results: 'No results found',
    error: 'Error',
    close: 'Close',
    
    // Location
    location_not_available: 'Location not available',
    use_my_location: 'Use my location',
    allow_location: 'Please allow location access',
    
    // Landing Page
    tagline: 'Find restaurants near you',
    get_started: 'Get Started',
    subtitle: 'Discover delicious places to eat right around the corner',
    
    // Filters
    filters: 'Filters',
    open_now: 'Open Now',
    sort_by: 'Sort by',
    distance: 'Distance',
    rating: 'Rating',
    price_low_to_high: 'Price: Low to High',
    price_high_to_low: 'Price: High to Low',
    meal_type: 'Meal Type',
    main_meal: 'Main Meal',
    drinks: 'Drinks',
    dietary: 'Dietary',
    none: 'None',
    vegetarian: 'Vegetarian',
    vegan: 'Vegan',
    gluten_free: 'Gluten-free',
    halal: 'Halal',
    price_level: 'Price Level',
    min_rating: 'Minimum Rating',
    apply_filters: 'Apply Filters',
    reset_filters: 'Reset Filters',
    
    // Restaurant Details
    back_to_restaurants: 'Back to restaurants',
    restaurant_not_found: 'Restaurant not found',
    loading_restaurant_details: 'Loading restaurant details...',
    view_on_google_maps: 'View on Google Maps',
    reviews: 'Reviews',
    sort_reviews_by: 'Sort reviews by',
    most_recent: 'Most Recent',
    most_helpful: 'Most Helpful',
    helpful: 'Helpful',
    generating_ai_summary: 'Generating AI summary...',
    generating_summary: 'Generating summary...',
    ai_review_summary: 'AI Review Summary',
    closed: 'Closed',
    
    // Not Found
    page_not_found: 'Page not found',
    page_not_exist: 'The page you are looking for does not exist.',
    return_home: 'Return Home',
    
    // Language
    language: 'Language',
    english: 'English',
    japanese: 'Japanese',
  },
  ja: {
    // General
    restaurants: 'レストラン',
    home: 'ホーム',
    loading: '読み込み中',
    no_results: '結果が見つかりません',
    error: 'エラー',
    close: '閉じる',
    
    // Location
    location_not_available: '位置情報が利用できません',
    use_my_location: '現在地を使用',
    allow_location: '位置情報へのアクセスを許可してください',
    
    // Landing Page
    tagline: '近くのレストランを探す',
    get_started: '始める',
    subtitle: 'すぐ近くにある美味しい場所を発見しよう',
    
    // Filters
    filters: 'フィルター',
    open_now: '営業中',
    sort_by: '並び替え',
    distance: '距離',
    rating: '評価',
    price_low_to_high: '価格: 安い順',
    price_high_to_low: '価格: 高い順',
    meal_type: '食事タイプ',
    main_meal: 'メインミール',
    drinks: 'ドリンク',
    dietary: '食事制限',
    none: 'なし',
    vegetarian: 'ベジタリアン',
    vegan: 'ビーガン',
    gluten_free: 'グルテンフリー',
    halal: 'ハラール',
    price_level: '価格帯',
    min_rating: '最低評価',
    apply_filters: 'フィルターを適用',
    reset_filters: 'フィルターをリセット',
    
    // Restaurant Details
    back_to_restaurants: 'レストラン一覧に戻る',
    restaurant_not_found: 'レストランが見つかりません',
    loading_restaurant_details: 'レストラン情報を読み込み中...',
    view_on_google_maps: 'Google マップで見る',
    reviews: 'レビュー',
    sort_reviews_by: 'レビューの並び替え',
    most_recent: '最新順',
    most_helpful: '参考になった順',
    helpful: '参考になった',
    generating_ai_summary: 'AI要約を生成中...',
    generating_summary: '要約を生成中...',
    ai_review_summary: 'AIレビュー要約',
    closed: '閉店',
    
    // Not Found
    page_not_found: 'ページが見つかりません',
    page_not_exist: 'お探しのページは存在しません。',
    return_home: 'ホームに戻る',
    
    // Language
    language: '言語',
    english: '英語',
    japanese: '日本語',
  }
};

interface LanguageSelectorProps {}

export const LanguageSelector: React.FC<LanguageSelectorProps> = () => {
  const { language, setLanguage } = React.useContext(LanguageContext);
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
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
