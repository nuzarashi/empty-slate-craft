
import { useState, useCallback, useEffect, useContext } from 'react';
import { generateReviewSummary } from '@/utils/review';
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

  // Helper to detect if text is Japanese
  const isJapaneseText = (text: string): boolean => {
    // Check for Japanese characters (Hiragana, Katakana, Kanji)
    const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/;
    return japaneseRegex.test(text);
  };

  const getReviewSummary = async (reviewIndex: number, reviewText: string) => {
    if (reviewSummaries[reviewIndex] || !reviewText) return;
    
    // If UI language is Japanese but review is already in Japanese, use the original
    if (language === 'ja' && isJapaneseText(reviewText)) {
      console.log("Review is already in Japanese, skipping translation for index:", reviewIndex);
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: reviewText
      }));
      return;
    }
    
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
      console.error('Error generating review summary:', error);
    }
  };

  // Generate a summary for all reviews
  const generateAllReviewsSummary = async (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return;
    
    setIsGeneratingMainSummary(true);
    try {
      const summary = await generateReviewSummary(reviews, language);
      setCategorySummary(summary);
    } catch (error) {
      console.error('Error generating all reviews summary:', error);
    } finally {
      setIsGeneratingMainSummary(false);
    }
  };

  // Handle sort change - fixed to prevent timeouts and failures
  const handleSortChange = useCallback(async (value: string) => {
    console.log("Sorting changed to:", value);
    
    if (value === reviewSort) {
      console.log("Sort value unchanged, skipping refetch");
      return;
    }
    
    setReviewSort(value as ReviewSortOption);
    setIsLoadingNewReviews(true);
    
    if (restaurant?.id || restaurant?.place_id) {
      try {
        // Use the proper ID for fetching (place_id or id)
        const restaurantId = restaurant.place_id ? `place_id:${restaurant.place_id}` : restaurant.id;
        
        // Fetch with a smaller timeout to prevent UI hanging
        const controllerTimeout = new AbortController();
        const timeoutId = setTimeout(() => controllerTimeout.abort(), 8000);
        
        // Attempt to fetch with timeout control
        const fetchPromise = fetchRestaurantDetails(restaurantId, value as ReviewSortOption);
        
        // Create a race between the fetch and a timeout
        let details: Restaurant | null = null;
        
        try {
          details = await Promise.race([
            fetchPromise,
            new Promise<null>((_, reject) => {
              setTimeout(() => {
                reject(new Error("Request timed out"));
              }, 7000);
            })
          ]);
        } catch (error) {
          if (error instanceof Error && error.message === "Request timed out") {
            console.log("Fetch timed out, defaulting to current restaurant data");
            // If timeout, use existing restaurant data but sort differently
            if (restaurant.reviews) {
              details = { ...restaurant };
            }
          } else {
            throw error; // Re-throw other errors
          }
        } finally {
          clearTimeout(timeoutId);
        }
        
        if (details) {
          console.log("Processing review data:", details);
          // Clear existing review summaries to regenerate them
          setReviewSummaries({});
          
          // Generate a summary of all reviews
          if (details.reviews && details.reviews.length > 0) {
            console.log(`Processing ${details.reviews.length} reviews`);
            // Sort reviews locally as a fallback
            const sortedReviews = [...details.reviews].sort((a, b) => {
              if (value === 'recent') {
                return b.time - a.time;
              } else {
                return (b.rating * 10000 + b.time) - (a.rating * 10000 + a.time);
              }
            });
            
            // Update the restaurant's reviews with our sorted version
            details.reviews = sortedReviews;
            setSortedReviews(sortedReviews);
            
            // Generate the summary
            generateAllReviewsSummary(sortedReviews);
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant details with new sort:", error);
        toast.error("Failed to load reviews. Using existing data instead.");
        
        // Fallback: sort existing reviews locally
        if (restaurant.reviews && restaurant.reviews.length > 0) {
          const sortedReviews = [...restaurant.reviews].sort((a, b) => {
            if (value === 'recent') {
              return b.time - a.time;
            } else {
              return (b.rating * 10000 + b.time) - (a.rating * 10000 + a.time);
            }
          });
          setSortedReviews(sortedReviews);
        }
      } finally {
        setIsLoadingNewReviews(false);
      }
    }
  }, [restaurant, fetchRestaurantDetails, reviewSort]);

  // Updated sorting function with memoization to prevent unnecessary calculations
  const updateSortedReviews = useCallback(() => {
    if (!restaurant?.reviews) return;
    
    console.log("Updating sorted reviews with sort option:", reviewSort);
    const reviews = [...restaurant.reviews].sort((a, b) => {
      if (reviewSort === 'recent') {
        return b.time - a.time; // Most recent first
      } else {
        return (b.rating * 10000 + b.time) - (a.rating * 10000 + a.time);
      }
    });
    
    console.log("Sorted reviews count:", reviews.length);
    setSortedReviews(reviews);
  }, [restaurant?.reviews, reviewSort]);

  // Update sortedReviews whenever restaurant data or sort option changes
  useEffect(() => {
    updateSortedReviews();
  }, [restaurant?.reviews, reviewSort, updateSortedReviews]);

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
      generateAllReviewsSummary(restaurant.reviews);
      // Clear existing review summaries to regenerate them in the new language
      setReviewSummaries({});
    }
  }, [language, restaurant?.reviews]);

  // Reset review summaries when language changes
  useEffect(() => {
    setReviewSummaries({});
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
