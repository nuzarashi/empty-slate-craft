import type { Review } from '../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../config/api';

export interface CategorySummary {
  summary: string;
  cuisine: string;
  atmosphere: string;
  service: string;
}

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

    // Call our Supabase Edge Function
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
  } catch (err) {
    console.error('Error generating AI summary:', err);
    // Fall back to local summary if API call fails
    return createLocalSummary(reviews, language);
  }
};

// Local fallback summary generation if the API call fails
const createLocalSummary = (reviews: Review[], language: string = 'en'): CategorySummary => {
  // For a single review, generate a concise summary
  if (reviews.length === 1 && reviews[0].text) {
    const reviewText = reviews[0].text;
    const foodKeywords = ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal', 'cuisine', 'menu'];
    const atmosphereKeywords = ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise', 'setting', 'environment'];
    const serviceKeywords = ['service', 'staff', 'server', 'waiter', 'waitress', 'host', 'hostess', 'friendly', 'attentive'];
    
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
      summary += foodSentences[0] + '. ';
    }
    if (atmosphereSentences.length > 0) {
      summary += atmosphereSentences[0] + '.';
    }
    
    return {
      summary: summary.trim() || (language === 'ja' ? 'レビューの要約' : 'Review summary'),
      cuisine: extractPhrase(foodSentences, 3) || (language === 'ja' ? '情報なし' : 'Not mentioned'),
      atmosphere: extractPhrase(atmosphereSentences, 3) || (language === 'ja' ? '情報なし' : 'Not mentioned'),
      service: extractPhrase(serviceSentences, 3) || (language === 'ja' ? '情報なし' : 'Not mentioned')
    };
  }

  // For multiple reviews, analyze food, atmosphere, and service mentions
  const foodMentions = countKeywordMentions(reviews, ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal', 'cuisine', 'menu']);
  const atmosphereMentions = countKeywordMentions(reviews, ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise', 'setting', 'environment']);
  const serviceMentions = countKeywordMentions(reviews, ['service', 'staff', 'server', 'waiter', 'waitress', 'host', 'hostess', 'friendly', 'attentive']);
  
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
  
  const summary = language === 'ja'
    ? `料理の質は${foodSentiment}で、雰囲気は${atmosphereSentiment}です。平均評価は${avgRating.toFixed(1)}/5です。`
    : `Food quality is ${foodSentiment} and atmosphere is ${atmosphereSentiment} with an average rating of ${avgRating.toFixed(1)}/5.`;
  
  return {
    summary,
    cuisine: cuisine(cuisineType, foodSentiment, language),
    atmosphere: language === 'ja' ? `${atmosphereSentiment}雰囲気` : `${atmosphereSentiment} atmosphere`,
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

// Helper function to try to determine cuisine type
const extractCuisineType = (reviews: Review[]): string => {
  const cuisineTypes = [
    'italian', 'japanese', 'chinese', 'mexican', 'thai', 'indian', 'french', 
    'greek', 'american', 'korean', 'vietnamese', 'mediterranean', 'spanish', 
    'turkish', 'middle eastern', 'brazilian', 'peruvian', 'ethiopian', 'fusion'
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

// Legacy code, kept for reference
/*
const generateReviewSummaryWithOpenAI = async (reviews: Review[]): Promise<string> => {
  try {
    // Prepare the review texts
    const reviewTexts = reviews.map(review => `"${review.text}" (Rating: ${review.rating}/5)`).join("\n\n");
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // or any other suitable model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes restaurant reviews concisely in 1-2 sentences. Highlight the key sentiments and most mentioned aspects like food quality, service, ambiance, etc.'
          },
          {
            role: 'user',
            content: `Summarize these restaurant reviews in 1-2 concise sentences:\n\n${reviewTexts}`
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return 'Could not generate summary due to an error.';
    }
    
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Could not generate summary.';
  }
};
*/
