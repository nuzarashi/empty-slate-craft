import type { Review } from '../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../config/api';

// Function to generate review summaries using OpenAI via Supabase Edge Function
export const generateReviewSummary = async (reviews: Review[]): Promise<string> => {
  try {
    if (reviews.length === 0) {
      return "No reviews available.";
    }

    // Call our Supabase Edge Function
    const response = await fetch(`${SUPABASE_EDGE_FUNCTION_URL.replace('google-places-api', 'summarize-reviews')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ reviews })
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
      return createLocalSummary(reviews);
    }

    return data.summary;
  } catch (err) {
    console.error('Error generating AI summary:', err);
    // Fall back to local summary if API call fails
    return createLocalSummary(reviews);
  }
};

// Local fallback summary generation if the API call fails
const createLocalSummary = (reviews: Review[]): string => {
  // For a single review, generate a concise summary
  if (reviews.length === 1 && reviews[0].text) {
    const reviewText = reviews[0].text;
    const foodKeywords = ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal'];
    const atmosphereKeywords = ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise'];
    
    // Try to extract food and atmosphere related sentences
    const sentences = reviewText.split(/[.!?]+/).filter(Boolean);
    const foodSentences = sentences.filter(s => 
      foodKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    const atmosphereSentences = sentences.filter(s => 
      atmosphereKeywords.some(keyword => s.toLowerCase().includes(keyword))
    );
    
    if (foodSentences.length > 0 || atmosphereSentences.length > 0) {
      let summary = '';
      if (foodSentences.length > 0) {
        summary += foodSentences[0] + '. ';
      }
      if (atmosphereSentences.length > 0) {
        summary += atmosphereSentences[0] + '.';
      }
      return summary.trim();
    }
    
    // Very simple summarization for fallback
    if (reviewText.length <= 100) {
      return reviewText;
    }
    
    // For longer reviews, return the first sentence
    const firstSentence = reviewText.split('.')[0];
    return `${firstSentence}.`;
  }

  // For multiple reviews, analyze food and atmosphere mentions
  const foodMentions = countKeywordMentions(reviews, ['food', 'dish', 'taste', 'flavor', 'delicious', 'portion', 'meal']);
  const atmosphereMentions = countKeywordMentions(reviews, ['atmosphere', 'ambiance', 'decor', 'interior', 'vibe', 'music', 'noise']);
  
  // Generate sentiment
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  let foodSentiment = "not specifically mentioned";
  let atmosphereSentiment = "not specifically mentioned";
  
  if (foodMentions > 0) {
    foodSentiment = avgRating >= 4 ? "praised" : avgRating >= 3 ? "decent" : "criticized";
  }
  
  if (atmosphereMentions > 0) {
    atmosphereSentiment = avgRating >= 4 ? "inviting" : avgRating >= 3 ? "acceptable" : "disappointing";
  }
  
  return `Food quality is ${foodSentiment} and atmosphere is ${atmosphereSentiment} with an average rating of ${avgRating.toFixed(1)}/5.`;
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

// Helper function to extract common themes (simplified version of the original)
const extractCommonThemes = (reviews: Review[]): string[] => {
  // This is a simplified implementation
  // In a real app, we would use NLP techniques to extract themes
  
  const keywords = [
    'delicious',
    'tasty',
    'fresh',
    'atmosphere',
    'service',
    'friendly',
    'price',
    'expensive',
    'cheap',
    'value',
    'portion',
    'authentic',
    'wait',
    'crowded',
    'quiet',
    'noisy',
    'ambiance',
    'clean',
    'dirty',
    'recommend',
    'spicy',
    'sweet',
    'salty',
    'bitter',
    'staff',
    'menu',
    'variety',
    'limited',
    'parking',
    'location',
    'reservations',
    'vegan',
    'vegetarian',
    'gluten-free',
    'halal'
  ];
  
  const themeCounts: Record<string, number> = {};
  
  reviews.forEach(review => {
    const text = review.text.toLowerCase();
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        themeCounts[keyword] = (themeCounts[keyword] || 0) + 1;
      }
    });
  });
  
  // Sort themes by frequency
  return Object.keys(themeCounts)
    .filter(theme => themeCounts[theme] > 0)
    .sort((a, b) => themeCounts[b] - themeCounts[a])
    .slice(0, 5); // Top 5 themes
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
