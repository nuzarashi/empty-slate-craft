
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
    
    // Skip translation if the review is already in the target language
    if (language === 'ja' && isJapaneseText(reviewText)) {
      console.log("Review is already in Japanese, skipping translation for index:", reviewIndex);
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: reviewText
      }));
      return;
    }
    
    // For English target language, if the text is in Japanese, we should translate
    if (language === 'en' && isJapaneseText(reviewText)) {
      // Need translation from Japanese to English
    } else if (language === 'en') {
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

  // Handle sort change - fixed to prevent timeouts and failures
  const handleSortChange = useCallback(async (value: string) => {
    console.log("Sorting changed to:", value);
    
    if (value === reviewSort) {
      console.log("Sort value unchanged, skipping refetch");
      return;
    }
    
    // Update the sort option state immediately
    setReviewSort(value as ReviewSortOption);
    setIsLoadingNewReviews(true);
    
    if (!restaurant) {
      setIsLoadingNewReviews(false);
      return;
    }
    
    try {
      // Use the proper ID for fetching (place_id or id)
      const restaurantId = restaurant.place_id 
        ? restaurant.place_id.startsWith('place_id:') 
          ? restaurant.place_id 
          : `place_id:${restaurant.place_id}` 
        : restaurant.id;
        
      console.log("Fetching with restaurant ID:", restaurantId);
      
      // Fetch with a timeout
      const timeoutId = setTimeout(() => {
        console.log("Fetch timed out, sorting locally");
        setIsLoadingNewReviews(false);
        
        // Fall back to local sorting if we have reviews
        if (restaurant.reviews) {
          sortReviewsLocally(restaurant.reviews, value as ReviewSortOption);
        }
      }, 8000);
      
      // Attempt to fetch new reviews
      const details = await fetchRestaurantDetails(restaurantId, value as ReviewSortOption);
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      if (details && details.reviews) {
        console.log("Got new review data, reviews count:", details.reviews.length);
        // Clear existing review summaries to regenerate them
        setReviewSummaries({});
        // Set the sorted reviews directly from the response
        setSortedReviews(details.reviews);
        // Generate a summary of all reviews
        generateAllReviewsSummary(details.reviews);
      } else {
        console.log("No reviews found in the response, falling back to local sorting");
        if (restaurant.reviews) {
          sortReviewsLocally(restaurant.reviews, value as ReviewSortOption);
        }
      }
    } catch (error) {
      console.error("Error fetching restaurant details with new sort:", error);
      toast.error("Failed to load reviews. Using existing data instead.");
      
      // Fallback: sort existing reviews locally
      if (restaurant?.reviews) {
        sortReviewsLocally(restaurant.reviews, value as ReviewSortOption);
      }
    } finally {
      setIsLoadingNewReviews(false);
    }
  }, [restaurant, fetchRestaurantDetails, reviewSort]);

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
  }, [restaurant?.reviews]);

  // Generate review summaries for sorted reviews
  useEffect(() => {
    if (sortedReviews.length > 0) {
      console.log("Generating summaries for", sortedReviews.length, "sorted reviews");
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
