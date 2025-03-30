
import type { Review } from '../types';

// In a real implementation, this would use an API call to an AI service
// For this demo, we'll use pre-generated summaries
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
  // Calculate average rating
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
