
import type { Review } from '../../types';
import type { CategorySummary } from './types';
import { 
  countKeywordMentions, 
  extractPhrase, 
  extractCuisineType, 
  extractAtmosphereType 
} from './keywordUtils';
import { 
  inferCuisine, 
  inferAtmosphere, 
  inferService 
} from './inferenceUtils';
import { formatCuisine } from './formatUtils';

// Improved local fallback summary generation
export const createLocalSummary = (reviews: Review[], language: string = 'en'): CategorySummary => {
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
      summary: summary.trim() || (language === 'ja' ? 'レビューの要' : 'Review summary'),
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
      ? (language === 'ja' ? '美味', '絶品' : 'praised') 
      : avgRating >= 3 
        ? (language === 'ja' ? '満足' : 'decent') 
        : (language === 'ja' ? '不味い' : 'criticized');
  }
  
  if (atmosphereMentions > 0) {
    atmosphereSentiment = avgRating >= 4 
      ? (language === 'ja' ? '魅力的' : 'inviting') 
      : avgRating >= 3 
        ? (language === 'ja' ? '普通' : 'acceptable') 
        : (language === 'ja' ? '残念' : 'disappointing');
  }

  if (serviceMentions > 0) {
    serviceSentiment = avgRating >= 4 
      ? (language === 'ja' ? '親切' : 'friendly and attentive') 
      : avgRating >= 3 
        ? (language === 'ja' ? '普通' : 'adequate') 
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
    cuisine: formatCuisine(cuisineType, foodSentiment, language),
    atmosphere: language === 'ja' ? `${atmosphereType}な雰囲気` : `${atmosphereType} atmosphere`,
    service: language === 'ja' ? `${serviceSentiment}サービス` : `${serviceSentiment} service`
  };
};
