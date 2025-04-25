
import { useState, useEffect, useContext } from 'react';
import { generateReviewSummary } from '@/utils/review';
import { createLocalSummary } from '@/utils/review/localSummary';
import type { Review, Restaurant } from '@/types';
import type { CategorySummary } from '@/utils/review/types';
import { LanguageContext } from '@/components/LanguageSelector';

interface UseReviewHandlingProps {
  restaurant: Restaurant | null;
}

export const useReviewHandling = ({ restaurant }: UseReviewHandlingProps) => {
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<{[key: string]: string}>({});
  const [isGeneratingMainSummary, setIsGeneratingMainSummary] = useState<boolean>(false);
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const { language } = useContext(LanguageContext);

  // Generate a summary for all reviews
  const generateAllReviewsSummary = async (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return;
    
    setIsGeneratingMainSummary(true);
    try {
      try {
        const summary = await generateReviewSummary(reviews, language);
        setCategorySummary(summary);
      } catch (error) {
        console.error('Error with API review summary, falling back to local:', error);
        const localSummary = createLocalSummary(reviews, language);
        setCategorySummary(localSummary);
      }
    } catch (error) {
      console.error('Error generating all reviews summary:', error);
    } finally {
      setIsGeneratingMainSummary(false);
    }
  };

  // Generate individual review summary
  const getReviewSummary = async (reviewIndex: number, reviewText: string) => {
    if (reviewSummaries[reviewIndex] || !reviewText) return;
    
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

  // Update reviews when restaurant data changes
  useEffect(() => {
    if (restaurant?.reviews) {
      setSortedReviews(restaurant.reviews.slice(0, 10));
    }
  }, [restaurant?.reviews]);

  // Generate review summaries for reviews
  useEffect(() => {
    if (sortedReviews.length > 0) {
      console.log("Generating summaries for", sortedReviews.length, "reviews in language:", language);
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
      setReviewSummaries({});
    }
  }, [language]);

  return {
    sortedReviews,
    reviewSummaries,
    isGeneratingMainSummary,
    categorySummary
  };
};
