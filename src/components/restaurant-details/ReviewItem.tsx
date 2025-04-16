
import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageSelector';
import type { Review } from '@/types';

interface ReviewItemProps {
  review: Review;
  index: number;
  reviewSummary: string | undefined;
}

const ReviewItem = ({ review, index, reviewSummary }: ReviewItemProps) => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-medium">{review.author_name}</div>
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${i < review.rating ? 'text-food-yellow' : 'text-gray-300'}`}
              fill={i < review.rating ? 'gold' : 'none'}
              strokeWidth={0.5}
            />
          ))}
        </div>
      </div>
      
      <p className="text-sm text-gray-700">
        {reviewSummary ? (
          reviewSummary
        ) : (
          <>
            <span className="text-xs text-muted-foreground">{t('generating_ai_summary')}</span>
            <br />
            {review.text.length > 100 ? `${review.text.substring(0, 100)}...` : review.text}
          </>
        )}
      </p>
      
      <div className="flex justify-between items-center mt-1">
        <div className="text-xs text-muted-foreground">
          {review.relative_time_description}
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <ThumbsUp className="w-3 h-3 mr-1" />
          <span>{t('helpful')}</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;
