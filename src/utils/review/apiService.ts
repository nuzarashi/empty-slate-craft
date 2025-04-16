
import type { Review } from '../../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../../config/api';
import { createLocalSummary } from './localSummary';
import type { CategorySummary } from './types';
import { isJapaneseText } from './languageUtils';

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

    // Process reviews to respect the original language for Japanese reviews
    const processedReviews = reviews.map(review => {
      // If the UI language is set to Japanese but the review is already in Japanese, 
      // mark it to not be translated
      const isJapanese = isJapaneseText(review.text);
      return {
        ...review,
        preserveOriginal: isJapanese
      };
    });

    // Call our Supabase Edge Function
    try {
      const response = await fetch(`${SUPABASE_EDGE_FUNCTION_URL.replace('google-places-api', 'summarize-reviews')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          reviews: processedReviews, 
          language,
          preserveJapanese: true 
        })
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
