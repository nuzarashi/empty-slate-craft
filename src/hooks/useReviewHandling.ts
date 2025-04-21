import { useState, useCallback, useEffect, useContext } from 'react';
import { generateReviewSummary } from '@/utils/review';
import { createLocalSummary } from '@/utils/review/localSummary';
import { isJapaneseText } from '@/utils/review/languageUtils';
import type { Review, ReviewSortOption, Restaurant } from '@/types';
import type { CategorySummary } from '@/utils/review/types';
import { LanguageContext } from '@/components/LanguageSelector';
import { toast } from 'sonner';

interface UseReviewHandlingProps {
  restaurant: Restaurant | null;
  fetchRestaurantDetails: (id: string, sortOption: ReviewSortOption) => Promise<Restaurant | null>;
}

export const useReviewHandling = ({ restaurant, fetchRestaurantDetails }: UseReviewHandlingProps) => {
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('recent');
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<{[key: string]: string}>({});
  const [isGeneratingMainSummary, setIsGeneratingMainSummary] = useState<boolean>(false);
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const [isLoadingNewReviews, setIsLoadingNewReviews] = useState<boolean>(false);
  const { language } = useContext(LanguageContext);

  // Generate a summary for all reviews
  const generateAllReviewsSummary = async (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return;
    
    setIsGeneratingMainSummary(true);
    try {
      // First try the API
      try {
        const summary = await generateReviewSummary(reviews, language);
        setCategorySummary(summary);
        return;
      } catch (error) {
        console.error('Error with API review summary, falling back to local:', error);
        // Fall back to local summary generation
        const localSummary = createLocalSummary(reviews, language);
        setCategorySummary(localSummary);
      }
    } catch (error) {
      console.error('Error generating all reviews summary:', error);
    } finally {
      setIsGeneratingMainSummary(false);
    }
  };

  // Generate individual review summary with fallback
  const getReviewSummary = async (reviewIndex: number, reviewText: string) => {
    if (reviewSummaries[reviewIndex] || !reviewText) return;
    
    // Check if review text is in Japanese
    const isJapanese = isJapaneseText(reviewText);
    console.log(`Review ${reviewIndex} language detection: isJapanese=${isJapanese}, UI language=${language}`);
    
    // Skip translation if the review is already in the target language
    if (language === 'ja' && isJapanese) {
      console.log("Review is already in Japanese, skipping translation for index:", reviewIndex);
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: reviewText
      }));
      return;
    }
    
    // For English target language, if the text is in Japanese, we should translate
    if (language === 'en' && isJapanese) {
      // Need translation from Japanese to English
      // Continue to the API call below
    } else if (language === 'en' && !isJapanese) {
      // Already in English, no translation needed
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: reviewText
      }));
      return;
    }
    
    try {
      // First try the API
      try {
        const summary = await generateReviewSummary([{ 
          author_name: '', 
          rating: 0, 
          text: reviewText,
          time: 0,
          relative_time_description: ''
        }], language);
        
        setReviewSummaries(prev => ({
          ...prev,
          [reviewIndex]: summary.summary
        }));
      } catch (error) {
        console.error('Error with API review summary for single review, handling locally:', error);
        
        // For Japanese, try a simple local handling
        if (language === 'ja') {
          // Simple marker for Japanese fallback
          setReviewSummaries(prev => ({
            ...prev,
            [reviewIndex]: `🇯🇵 ${reviewText.substring(0, 100)}...`
          }));
        } else {
          // For English, just use the original
          setReviewSummaries(prev => ({
            ...prev,
            [reviewIndex]: reviewText
          }));
        }
      }
    } catch (error) {
      console.error('Error generating review summary:', error);
    }
  };

  // Handle sort change - improved to prioritize API-based sorting
  const handleSortChange = useCallback(async (value: string) => {
    console.log("Sorting changed to:", value);
    
    if (value === reviewSort) {
      console.log("Sort value unchanged, skipping refetch");
      return;
    }
    
    // Update the sort option state immediately
    setReviewSort(value as ReviewSortOption);
    setIsLoadingNewReviews(true);
    setReviewSummaries({}); // Clear existing summaries when sort changes
    
    if (!restaurant || !restaurant.place_id) {
      console.error("Cannot sort reviews: Missing restaurant data or place_id");
      setIsLoadingNewReviews(false);
      return;
    }
    
    try {
      // Format the restaurant ID correctly for the API
      let restaurantId = restaurant.place_id;
      if (!restaurantId.startsWith('place_id:')) {
        restaurantId = `place_id:${restaurantId}`;
      }
      
      console.log(`Fetching reviews with sort option: ${value}, language: ${language}, restaurantId: ${restaurantId}`);
      
      // Always attempt to fetch from the API first
      const details = await fetchRestaurantDetails(restaurantId, value as ReviewSortOption);
      
      if (details && details.reviews && details.reviews.length > 0) {
        console.log(`Successfully fetched ${details.reviews.length} reviews with ${value} sorting`);
        setSortedReviews(details.reviews);
        
        // Generate a summary of all reviews
        generateAllReviewsSummary(details.reviews);
      } else {
        console.warn("No reviews returned from API or empty reviews array, falling back to local sorting");
        
        if (restaurant.reviews && restaurant.reviews.length > 0) {
          sortReviewsLocally(restaurant.reviews, value as ReviewSortOption);
        } else {
          setSortedReviews([]);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurant details with new sort:", error);
      toast.error(language === 'ja' 
        ? "レビューの読み込みに失敗しました。既存のデータを使用します。"
        : "Failed to load reviews. Using existing data instead.");
      
      // Fallback: sort existing reviews locally
      if (restaurant?.reviews) {
        sortReviewsLocally(restaurant.reviews, value as ReviewSortOption);
      }
    } finally {
      setIsLoadingNewReviews(false);
    }
  }, [restaurant, fetchRestaurantDetails, reviewSort, language]);

  // Helper function for local sorting
  const sortReviewsLocally = (reviews: Review[], sortOption: ReviewSortOption) => {
    console.log("Sorting reviews locally with option:", sortOption);
    const sorted = [...reviews].sort((a, b) => {
      if (sortOption === 'recent') {
        return b.time - a.time; // Most recent first
      } else if (sortOption === 'helpful') {
        // First by rating (higher is better), then by recency as a tiebreaker
        const ratingDiff = b.rating - a.rating;
        return ratingDiff !== 0 ? ratingDiff : b.time - a.time;
      }
      return 0;
    });
    
    console.log("Local sort complete, reviews count:", sorted.length);
    setSortedReviews(sorted);
  };

  // Update sortedReviews when restaurant data changes
  useEffect(() => {
    if (restaurant?.reviews) {
      console.log("Restaurant reviews changed, sorting with current option:", reviewSort);
      sortReviewsLocally(restaurant.reviews, reviewSort);
    }
  }, [restaurant?.reviews, reviewSort]);

  // Generate review summaries for sorted reviews
  useEffect(() => {
    if (sortedReviews.length > 0) {
      console.log("Generating summaries for", sortedReviews.length, "sorted reviews in language:", language);
      // Clear existing summaries when language changes
      setReviewSummaries({});
      
      sortedReviews.forEach((review, index) => {
        getReviewSummary(index, review.text);
      });
    }
  }, [sortedReviews, language]);

  // Regenerate summary when language changes
  useEffect(() => {
    if (restaurant?.reviews && restaurant.reviews.length > 0) {
      console.log("Language changed, regenerating summaries in:", language);
      generateAllReviewsSummary(restaurant.reviews);
      // Clear existing review summaries to regenerate them in the new language
      setReviewSummaries({});
    }
  }, [language]);

  return {
    reviewSort,
    sortedReviews,
    reviewSummaries,
    isGeneratingMainSummary,
    categorySummary,
    isLoadingNewReviews,
    handleSortChange
  };
};
