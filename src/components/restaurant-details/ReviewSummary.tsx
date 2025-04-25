// This component is no longer used as we've removed AI summaries
// Keeping a minimal version for potential future use

import React from 'react';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import type { CategorySummary } from '@/utils/review/types';

interface ReviewSummaryProps {
  categorySummary: CategorySummary | null;
  isGeneratingMainSummary: boolean;
}

const ReviewSummary = () => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="p-4 bg-white mt-2 rounded-lg shadow-sm mx-4">
      <h2 className="text-lg font-semibold mb-3">{t('what_people_say')}</h2>
      <p className="text-muted-foreground">Review summaries have been disabled.</p>
    </div>
  );
};

export default ReviewSummary;
