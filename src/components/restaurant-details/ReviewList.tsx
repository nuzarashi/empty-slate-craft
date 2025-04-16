
import React from 'react';
import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReviewItem from './ReviewItem';
import type { Review, ReviewSortOption } from '@/types';

interface ReviewListProps {
  sortedReviews: Review[];
  reviewSort: ReviewSortOption;
  handleSortChange: (value: string) => void;
  isLoadingNewReviews: boolean;
  reviewSummaries: {[key: string]: string};
}

const ReviewList = ({ 
  sortedReviews, 
  reviewSort, 
  handleSortChange, 
  isLoadingNewReviews,
  reviewSummaries 
}: ReviewListProps) => {
  const { t } = useContext(LanguageContext);

  if (sortedReviews.length === 0) return null;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">{t('reviews')}</h2>
        
        <div className="relative">
          {isLoadingNewReviews && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <LoadingSpinner size="small" />
            </div>
          )}
          <Select
            value={reviewSort}
            onValueChange={handleSortChange}
            disabled={isLoadingNewReviews}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('sort_reviews_by')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('most_recent')}</SelectItem>
              <SelectItem value="helpful">{t('most_helpful')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedReviews.map((review, index) => (
          <ReviewItem 
            key={index} 
            review={review} 
            index={index} 
            reviewSummary={reviewSummaries[index]} 
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
