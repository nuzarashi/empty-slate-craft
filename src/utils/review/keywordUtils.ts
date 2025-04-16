
import type { Review } from '../../types';

// Helper function to count keyword mentions across reviews
export const countKeywordMentions = (reviews: Review[], keywords: string[]): number => {
  let count = 0;
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        count++;
      }
    });
  });
  return count;
};

// Helper function to extract a short phrase from sentences
export const extractPhrase = (sentences: string[], maxWords: number): string => {
  if (sentences.length === 0) return '';
  
  const sentence = sentences[0];
  const words = sentence.split(' ');
  
  if (words.length <= maxWords) return sentence;
  
  return words.slice(0, maxWords).join(' ') + '...';
};

// Improved helper function to try to determine cuisine type
export const extractCuisineType = (reviews: Review[]): string => {
  const cuisineTypes = [
    'italian', 'japanese', 'chinese', 'mexican', 'thai', 'indian', 'french', 
    'greek', 'american', 'korean', 'vietnamese', 'mediterranean', 'spanish', 
    'turkish', 'middle eastern', 'brazilian', 'peruvian', 'ethiopian', 'fusion',
    'sushi', 'pizza', 'burger', 'steak', 'seafood', 'vegetarian', 'vegan', 
    'gluten-free', 'healthy', 'fast food', 'fine dining', 'café', 'bakery',
    'brunch', 'breakfast', 'lunch', 'dinner', 'dessert', 'ice cream'
  ];
  
  // Count mentions of cuisine types
  const cuisineCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    cuisineTypes.forEach(cuisine => {
      if (text.includes(cuisine)) {
        cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
      }
    });
  });
  
  // Find most mentioned cuisine
  let mostMentioned = '';
  let highestCount = 0;
  
  Object.entries(cuisineCounts).forEach(([cuisine, count]) => {
    if (count > highestCount) {
      highestCount = count;
      mostMentioned = cuisine;
    }
  });
  
  return mostMentioned ? mostMentioned.charAt(0).toUpperCase() + mostMentioned.slice(1) : '';
};

// New helper function to extract atmosphere type
export const extractAtmosphereType = (reviews: Review[]): string => {
  const atmosphereTypes = [
    'casual', 'elegant', 'upscale', 'fancy', 'cozy', 'intimate', 'romantic', 
    'family-friendly', 'loud', 'quiet', 'vibrant', 'lively', 'relaxed', 'trendy',
    'hip', 'modern', 'traditional', 'rustic', 'chic', 'vintage', 'fine dining',
    'fast casual', 'outdoor', 'rooftop', 'waterfront', 'view', 'hidden gem'
  ];
  
  // Count mentions of atmosphere types
  const atmosphereCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    atmosphereTypes.forEach(type => {
      if (text.includes(type)) {
        atmosphereCounts[type] = (atmosphereCounts[type] || 0) + 1;
      }
    });
  });
  
  // Find most mentioned atmosphere type
  let mostMentioned = '';
  let highestCount = 0;
  
  Object.entries(atmosphereCounts).forEach(([type, count]) => {
    if (count > highestCount) {
      highestCount = count;
      mostMentioned = type;
    }
  });
  
  return mostMentioned ? mostMentioned.charAt(0).toUpperCase() + mostMentioned.slice(1) : 'Casual';
};
