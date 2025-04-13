import type { Review } from '../types';

// This is a sample implementation using a dummy approach
// In a real app, this would call an AI service like OpenAI
export const generateReviewSummary = async (reviews: Review[]): Promise<string> => {
  // This is a dummy implementation
  // In a real app, we would call an AI service to generate the summary

  // Extract common keywords or phrases
  const commonThemes = extractCommonThemes(reviews);
  
  // Create a summary based on review data
  return createSummary(reviews, commonThemes);
};

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

const createSummary = (reviews: Review[], themes: string[]): string => {
  // For a single review, generate a concise summary
  if (reviews.length === 1 && reviews[0].text) {
    const reviewText = reviews[0].text;
    
    // Very simple summarization for demo purposes
    // In a real app, this would be a call to an AI API
    if (reviewText.length <= 100) {
      return reviewText;
    }
    
    // For longer reviews, create a simple summary
    const firstSentence = reviewText.split('.')[0];
    let summary = firstSentence;
    
    // Extract key phrases based on themes
    themes.forEach(theme => {
      const themeIndex = reviewText.toLowerCase().indexOf(theme);
      if (themeIndex > -1) {
        const start = Math.max(0, reviewText.lastIndexOf('.', themeIndex) + 1);
        const end = reviewText.indexOf('.', themeIndex + theme.length) + 1;
        if (end > start) {
          const sentence = reviewText.substring(start, end).trim();
          if (!summary.includes(sentence) && sentence.length > 10) {
            summary += ' ' + sentence;
          }
        }
      }
    });
    
    // Add sentiment based on any keywords found
    if (reviewText.toLowerCase().includes('recommend')) {
      summary += " Recommends this restaurant.";
    }
    
    return summary;
  }

  // For multiple reviews, calculate average rating
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  
  // Generate sentiment
  let sentiment;
  if (avgRating >= 4.5) {
    sentiment = "Highly praised";
  } else if (avgRating >= 4) {
    sentiment = "Well-liked";
  } else if (avgRating >= 3) {
    sentiment = "Mixed reviews";
  } else {
    sentiment = "Generally disappointing";
  }
  
  // Generate summary based on themes
  let themeText = "";
  
  if (themes.includes("delicious") || themes.includes("tasty")) {
    themeText += "tasty food, ";
  }
  
  if (themes.includes("fresh")) {
    themeText += "fresh ingredients, ";
  }
  
  if (themes.includes("atmosphere") || themes.includes("ambiance")) {
    themeText += "nice atmosphere, ";
  }
  
  if (themes.includes("service") || themes.includes("friendly") || themes.includes("staff")) {
    themeText += "good service, ";
  }
  
  if (themes.includes("expensive")) {
    themeText += "on the pricey side, ";
  }
  
  if (themes.includes("cheap") || themes.includes("value")) {
    themeText += "good value, ";
  }
  
  if (themes.includes("authentic")) {
    themeText += "authentic cuisine, ";
  }
  
  if (themes.includes("wait") || themes.includes("crowded")) {
    themeText += "can get crowded, ";
  }
  
  if (themes.includes("quiet")) {
    themeText += "quiet dining experience, ";
  }
  
  if (themes.includes("noisy")) {
    themeText += "can be noisy, ";
  }
  
  if (themes.includes("spicy")) {
    themeText += "known for spicy options, ";
  }
  
  // Remove trailing comma and space
  themeText = themeText.trim().replace(/,$/, "");
  
  return `${sentiment} for ${themeText}.`;
};

// To implement OpenAI integration, you would use code like this:
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
