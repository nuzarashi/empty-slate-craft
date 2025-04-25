import React, { useState, useContext } from 'react';
import { Star, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageContext } from '@/contexts/LanguageContext';
import { isJapaneseText } from '@/utils/review/languageUtils';
import type { Review } from '@/types';

interface ReviewItemProps {
  review: Review;
  index: number;
}

const ReviewItem = ({ review, index }: ReviewItemProps) => {
  const { t, language } = useContext(LanguageContext);
  const [expanded, setExpanded] = useState(false);
  
  // Character limit for collapsed view
  const TEXT_LIMIT = 100;
  
  // Determine if review needs a "Read more" button
  const isLongReview = review.text.length > TEXT_LIMIT;
  
  // Check if the review is already in Japanese
  const isJapanese = isJapaneseText(review.text);
  
  // Get display text based on expansion state and language
  const getDisplayText = () => {
    // If the UI is in Japanese and the review is already in Japanese,
    // or if the UI is in English, show the original text
    if ((language === 'ja' && isJapanese) || language === 'en') {
      return expanded || !isLongReview 
        ? review.text 
        : `${review.text.substring(0, TEXT_LIMIT)}...`;
    }
    
    // Otherwise show the original text (will be translated by the API later)
    return expanded || !isLongReview 
      ? review.text 
      : `${review.text.substring(0, TEXT_LIMIT)}...`;
  };

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
      
      <div className="text-sm text-gray-700">
        {getDisplayText()}
      </div>
      
      {isLongReview && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center mt-1 text-xs text-primary hover:underline"
        >
          {expanded ? (
            <>
              {t('show_less')} <ChevronUp className="w-3 h-3 ml-1" />
            </>
          ) : (
            <>
              {t('read_more')} <ChevronDown className="w-3 h-3 ml-1" />
            </>
          )}
        </button>
      )}
      
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
