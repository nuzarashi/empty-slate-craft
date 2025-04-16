
import type { CategorySummary } from './types';

// Create a cuisine description
export const formatCuisine = (type: string, quality: string, language: string): string => {
  if (language === 'ja') {
    if (quality === '絶賛されている') return `絶品の${type}`;
    if (quality === '満足できる') return `美味しい${type}`;
    if (quality === '批判されている') return `改善の余地がある${type}`;
    return type;
  } else {
    if (quality === 'praised') return `Excellent ${type}`;
    if (quality === 'decent') return `Good ${type}`;
    if (quality === 'criticized') return `Mediocre ${type}`;
    return type;
  }
};
