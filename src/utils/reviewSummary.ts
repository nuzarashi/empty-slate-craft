import type { Review } from '../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../config/api';
import { CategorySummary } from '../types';

// Function to generate review summaries using OpenAI via Supabase Edge Function
export const generateReviewSummary = async (reviews: Review[], language: string = 'en'): Promise<CategorySummary> => {
  try {
    if (reviews.length === 0) {
      return {
        summary: language === 'ja' ? 'レビューはありません。' : 'No reviews available.',
        cuisine: language === 'ja' ? '情報なし' : 'Not mentioned',
        atmosphere: language === 'ja' ? '情報なし' : 'Not mentioned',
        service: language === 'ja' ? '情報なし' : 'Not mentioned'
      };
    }

    console.log(`Generating review summary in language: ${language}`);

    // Call our Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_EDGE_FUNCTION_URL.replace('google-places-api', 'summarize-reviews')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reviews, language })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', errorText);
        throw new Error(`Failed to generate summary: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('API returned error:', data.error);
        // Fall back to local summary if OpenAI fails
        return createLocalSummary(reviews, language);
      }

      return data;
    } catch (error) {
      console.error('Error calling Supabase Edge Function:', error);
      // Fall back to local summary if API call fails
      return createLocalSummary(reviews, language);
    }
  } catch (err) {
    console.error('Error generating AI summary:', err);
    // Fall back to local summary if API call fails
    return createLocalSummary(reviews, language);
  }
};

// Improved local fallback summary generation
const createLocalSummary = (reviews: Review[], language: string = 'en'): CategorySummary => {
  // For a single review, generate a more structured summary
  if (reviews.length === 1 && reviews[0].text) {
    const reviewText = reviews[0].text;
    const foodKeywords = ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal', 'cuisine', 'menu', 'appetizer', 'dessert', 'entree', 'drink', 'chef'];
    const atmosphereKeywords = ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise', 'setting', 'environment', 'mood', 'quiet', 'loud', 'casual', 'formal', 'elegant', 'cozy'];
    const serviceKeywords = ['service', 'staff', 'server', 'waiter', 'waitress', 'host', 'hostess', 'friendly', 'attentive', 'prompt', 'helpful', 'rude', 'slow', 'fast', 'efficient'];
    
    // Try to extract food, atmosphere, and service related sentences
    const sentences = reviewText.split(/[.!?]+/).filter(Boolean);
    const foodSentences = sentences.filter(s => 
      foodKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    const atmosphereSentences = sentences.filter(s => 
      atmosphereKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    const serviceSentences = sentences.filter(s => 
      serviceKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    
    let summary = '';
    if (foodSentences.length > 0) {
      summary += foodSentences[0].trim() + '. ';
    }
    if (atmosphereSentences.length > 0) {
      summary += atmosphereSentences[0].trim() + '. ';
    }
    if (serviceSentences.length > 0) {
      summary += serviceSentences[0].trim() + '.';
    }
    
    // Make sure we have a summary even if no specific topics were found
    if (!summary) {
      summary = sentences[0].trim() + '.';
    }
    
    return {
      summary: summary.trim() || (language === 'ja' ? 'レビューの要��' : 'Review summary'),
      cuisine: extractPhrase(foodSentences, 3) || inferCuisine(reviewText) || (language === 'ja' ? '一般的な料理' : 'General cuisine'),
      atmosphere: extractPhrase(atmosphereSentences, 3) || inferAtmosphere(reviewText) || (language === 'ja' ? '情報なし' : 'Not specified'),
      service: extractPhrase(serviceSentences, 3) || inferService(reviewText) || (language === 'ja' ? '情報なし' : 'Not specified')
    };
  }

  // For multiple reviews, analyze food, atmosphere, and service mentions
  const foodMentions = countKeywordMentions(reviews, ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal', 'cuisine', 'menu', 'appetizer', 'dessert', 'entree']);
  const atmosphereMentions = countKeywordMentions(reviews, ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise', 'setting', 'environment', 'mood', 'quiet', 'loud', 'casual', 'formal']);
  const serviceMentions = countKeywordMentions(reviews, ['service', 'staff', 'server', 'waiter', 'waitress', 'host', 'hostess', 'friendly', 'attentive', 'prompt', 'helpful']);
  
  // Generate sentiment
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  let foodSentiment = language === 'ja' ? '特に言及なし' : 'not specifically mentioned';
  let atmosphereSentiment = language === 'ja' ? '特に言及なし' : 'not specifically mentioned';
  let serviceSentiment = language === 'ja' ? '特に言及なし' : 'not specifically mentioned';
  
  if (foodMentions > 0) {
    foodSentiment = avgRating >= 4 
      ? (language === 'ja' ? '絶賛されている' : 'praised') 
      : avgRating >= 3 
        ? (language === 'ja' ? '満足できる' : 'decent') 
        : (language === 'ja' ? '批判されている' : 'criticized');
  }
  
  if (atmosphereMentions > 0) {
    atmosphereSentiment = avgRating >= 4 
      ? (language === 'ja' ? '魅力的な' : 'inviting') 
      : avgRating >= 3 
        ? (language === 'ja' ? '許容できる' : 'acceptable') 
        : (language === 'ja' ? '残念な' : 'disappointing');
  }

  if (serviceMentions > 0) {
    serviceSentiment = avgRating >= 4 
      ? (language === 'ja' ? '親切な' : 'friendly and attentive') 
      : avgRating >= 3 
        ? (language === 'ja' ? '普通の' : 'adequate') 
        : (language === 'ja' ? '遅い' : 'slow or inattentive');
  }
  
  // Extract cuisine type
  const cuisineType = extractCuisineType(reviews) || (language === 'ja' ? '一般的な料理' : 'General cuisine');
  
  // Extract atmosphere attributes
  const atmosphereType = extractAtmosphereType(reviews) || (language === 'ja' ? '一般的な' : 'General');
  
  const summary = language === 'ja'
    ? `料理の質は${foodSentiment}で、雰囲気は${atmosphereSentiment}です。平均評価は${avgRating.toFixed(1)}/5です。`
    : `Food quality is ${foodSentiment} and atmosphere is ${atmosphereSentiment} with an average rating of ${avgRating.toFixed(1)}/5.`;
  
  return {
    summary,
    cuisine: cuisine(cuisineType, foodSentiment, language),
    atmosphere: language === 'ja' ? `${atmosphereType}な雰囲気` : `${atmosphereType} atmosphere`,
    service: language === 'ja' ? `${serviceSentiment}サービス` : `${serviceSentiment} service`
  };
};

// Helper function to count keyword mentions across reviews
const countKeywordMentions = (reviews: Review[], keywords: string[]): number => {
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
const extractPhrase = (sentences: string[], maxWords: number): string => {
  if (sentences.length === 0) return '';
  
  const sentence = sentences[0];
  const words = sentence.split(' ');
  
  if (words.length <= maxWords) return sentence;
  
  return words.slice(0, maxWords).join(' ') + '...';
};

// Improved helper function to try to determine cuisine type
const extractCuisineType = (reviews: Review[]): string => {
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
const extractAtmosphereType = (reviews: Review[]): string => {
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

// Create a cuisine description
const cuisine = (type: string, quality: string, language: string): string => {
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

// Infer cuisine from text when no explicit mention is found
const inferCuisine = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/pasta|pizza|italian|lasagna|risotto|gelato/i.test(lowerText)) return 'Italian';
  if (/sushi|ramen|japanese|tempura|sashimi|teriyaki/i.test(lowerText)) return 'Japanese';
  if (/taco|burrito|mexican|enchilada|quesadilla|salsa/i.test(lowerText)) return 'Mexican';
  if (/curry|indian|naan|tikka|masala|samosa/i.test(lowerText)) return 'Indian';
  if (/stir-fry|chinese|dimsum|dumpling|wonton|spring roll/i.test(lowerText)) return 'Chinese';
  if (/burger|fries|american|sandwich|steak|bbq/i.test(lowerText)) return 'American';
  if (/hummus|falafel|mediterranean|kebab|shawarma|pita/i.test(lowerText)) return 'Mediterranean';
  
  // Default fallback
  return 'Local cuisine';
};

// Infer atmosphere from text when no explicit mention is found
const inferAtmosphere = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/fancy|elegant|upscale|classy|sophisticated|luxury/i.test(lowerText)) return 'Elegant';
  if (/casual|relaxed|laid-back|chill|informal/i.test(lowerText)) return 'Casual';
  if (/cozy|intimate|warm|comfortable|homey/i.test(lowerText)) return 'Cozy';
  if (/noisy|loud|busy|crowded|energetic|vibrant/i.test(lowerText)) return 'Lively';
  if (/quiet|peaceful|calm|tranquil|serene/i.test(lowerText)) return 'Quiet';
  if (/modern|trendy|hip|stylish|chic/i.test(lowerText)) return 'Modern';
  if (/traditional|authentic|classic|old-school/i.test(lowerText)) return 'Traditional';
  if (/family|kid|child/i.test(lowerText)) return 'Family-friendly';
  
  // Default fallback
  return 'Casual';
};

// Infer service from text when no explicit mention is found
const inferService = (text: string): string => {
  const lowerText = text.toLowerCase();
  
  if (/friendly|welcoming|kind|nice|pleasant/i.test(lowerText)) return 'Friendly';
  if (/attentive|helpful|responsive|efficient/i.test(lowerText)) return 'Attentive';
  if (/slow|waited|long time|forever/i.test(lowerText)) return 'Slow';
  if (/fast|quick|speedy|prompt|rapid/i.test(lowerText)) return 'Quick';
  if (/rude|unfriendly|impolite|disrespectful/i.test(lowerText)) return 'Unfriendly';
  if (/professional|polished|courteous/i.test(lowerText)) return 'Professional';
  
  // Default fallback
  return 'Standard';
};

// Re-export CategorySummary for convenience
export { CategorySummary };
