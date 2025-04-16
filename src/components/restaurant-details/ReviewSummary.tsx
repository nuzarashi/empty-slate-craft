import React from 'react';
import { Utensils, Music, User } from 'lucide-react';
import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageSelector';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { CategorySummary } from '@/utils/review/types';

interface ReviewSummaryProps {
  categorySummary: CategorySummary | null;
  isGeneratingMainSummary: boolean;
}

const ReviewSummary = ({ categorySummary, isGeneratingMainSummary }: ReviewSummaryProps) => {
  const { t } = useContext(LanguageContext);

  if (!categorySummary && !isGeneratingMainSummary) return null;

  return (
    <div className="p-4 bg-white mt-2 rounded-lg shadow-sm mx-4">
      <h2 className="text-lg font-semibold mb-3">{t('what_people_say')}</h2>
      
      {isGeneratingMainSummary ? (
        <div className="flex items-center mb-4">
          <LoadingSpinner size="small" />
          <p className="ml-2 text-muted-foreground">{t('generating_summary')}</p>
        </div>
      ) : categorySummary && (
        <ul className="space-y-3">
          <li className="flex items-start">
            <Utensils className="w-5 h-5 text-food-red mr-2 mt-0.5" />
            <div>
              <span className="font-medium">{t('cuisine')}:</span> {categorySummary.cuisine}
            </div>
          </li>
          <li className="flex items-start">
            <Music className="w-5 h-5 text-food-red mr-2 mt-0.5" />
            <div>
              <span className="font-medium">{t('atmosphere')}:</span> {categorySummary.atmosphere}
            </div>
          </li>
          <li className="flex items-start">
            <User className="w-5 h-5 text-food-red mr-2 mt-0.5" />
            <div>
              <span className="font-medium">{t('service')}:</span> {categorySummary.service}
            </div>
          </li>
        </ul>
      )}
    </div>
  );
};

export default ReviewSummary;
