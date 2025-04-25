
import React from 'react';
import { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import ReviewItem from './ReviewItem';
import type { Review } from '@/types';

interface ReviewListProps {
  sortedReviews: Review[];
  reviewSummaries: {[key: string]: string};
}

const ReviewList = ({ 
  sortedReviews,
  reviewSummaries 
}: ReviewListProps) => {
  const { t } = useContext(LanguageContext);

  if (sortedReviews.length === 0) return null;

  return (
    <div className="p-4">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">{t('reviews')}</h2>
      </div>
      
      <div className="space-y-4">
        {sortedReviews.slice(0, 10).map((review, index) => (
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
