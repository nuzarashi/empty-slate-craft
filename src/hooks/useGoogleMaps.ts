
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Location, Restaurant, DietaryPreference } from '../types';
import { 
  fetchNearbyRestaurants, 
  fetchRestaurantDetails as getRestaurantDetails
} from '../services/googlePlacesAPI';

interface UseGoogleMapsProps {
  location: Location | null;
}

// Dietary keywords to look for in restaurant details
const dietaryKeywords: Record<keyof DietaryPreference, string[]> = {
  vegan: ['vegan', 'plant-based', 'dairy-free', 'no animal products'],
  vegetarian: ['vegetarian', 'veggie', 'no meat'],
  glutenFree: ['gluten-free', 'gluten free', 'gf', 'no gluten'],
  lowCarb: ['low carb', 'keto', 'low-carb', 'low-carbohydrate'],
  noSeafood: ['no seafood', 'no fish', 'seafood-free'],
  noRawFood: ['no raw food', 'cooked only', 'no raw fish', 'no raw meat'],
  halal: ['halal', 'muslim-friendly', 'halal-certified']
};

// Drinking establishment keywords
const drinkingKeywords = [
  'bar', 'pub', 'izakaya', 'night_club', 'snack_bar', 'liquor_store', 'karaoke', 
  'lounge', 'tavern', 'gastropub', 'great drinks', 'cocktails', 'wide sake selection', 
  'beer menu', 'happy hour', 'all-you-can-drink', 'nomihodai', 'whiskey bar', 
  'drinking with coworkers', 'after work spot', 'chill vibe', 'good for groups', 
  'open late', 'second party', '2次会', 'private room', 'karaoke after dinner', 
  'great for drinking', 'not for food', 'beer', 'bottles', 'drink menus', 
  'dim lighting', 'neon lights', 'bar counter', 'drinks toast', 'snack food', 
  '二次会にぴったり', '飲み放題', '雰囲気がいい', '落ち着いたバー', '深夜まで営業', 
  '会社帰りに', '友達と飲みに行った'
];

export const useGoogleMaps = ({ location }: UseGoogleMapsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  // Detect if restaurant is good for drinking
  const isDrinkingEstablishment = (restaurant: Restaurant): boolean => {
    if (!restaurant) return false;
    
    // Check restaurant types, name, and vicinity
    const textToCheck = [
      ...(restaurant.types || []),
      restaurant.name,
      restaurant.vicinity,
    ].join(' ').toLowerCase();
    
    // Check reviews if available
    const reviewsText = restaurant.reviews 
      ? restaurant.reviews.map(review => review.text).join(' ').toLowerCase()
      : '';
    
    // Combine all text to check
    const allText = `${textToCheck} ${reviewsText}`;
    
    // Look for keywords
    return drinkingKeywords.some(keyword => 
      allText.includes(keyword.toLowerCase())
    );
  };
  
  // Detect dietary options from restaurant details
  const detectDietaryOptions = (restaurant: Restaurant): DietaryPreference | undefined => {
    if (!restaurant) return undefined;
    
    const detailsText = [
      restaurant.name,
      restaurant.vicinity,
      ...(restaurant.types || []),
      // Add any other fields that might contain dietary information
    ].join(' ').toLowerCase();
    
    // Identify matching dietary preferences
    const matchedPreferences: DietaryPreference = {
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      lowCarb: false,
      noSeafood: false,
      noRawFood: false,
      halal: false
    };
    
    // Check for each dietary preference
    Object.entries(dietaryKeywords).forEach(([key, keywords]) => {
      const prefKey = key as keyof DietaryPreference;
      matchedPreferences[prefKey] = keywords.some(keyword => detailsText.includes(keyword));
      
      // If a restaurant is vegan, it's also vegetarian
      if (prefKey === 'vegan' && matchedPreferences.vegan) {
        matchedPreferences.vegetarian = true;
      }
    });
    
    return matchedPreferences;
  };
  
  const fetchRestaurants = useCallback(async (pageToken?: string) => {
    if (!location) {
      console.log("Cannot fetch restaurants: No location provided");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching restaurants with location:", location);
      const { restaurants: newRestaurants, nextPageToken: token } = await fetchNearbyRestaurants(location, pageToken);
      
      if (newRestaurants.length === 0) {
        console.log("No restaurants found");
        toast.info("No restaurants found nearby. Try adjusting your filters or location.");
      } else {
        console.log(`Found ${newRestaurants.length} restaurants`);
        toast.success(`Found ${newRestaurants.length} restaurants near you!`);
      }
      
      // Add dietary preferences and drinking type to each restaurant
      const enhancedRestaurants = newRestaurants.map(restaurant => {
        const dietaryPreferences = detectDietaryOptions(restaurant);
        const isDrinking = isDrinkingEstablishment(restaurant);
        
        // Add drinking type to restaurant types if it's detected as a drinking establishment
        let types = [...(restaurant.types || [])];
        if (isDrinking && !types.includes('bar')) {
          types.push('bar');
        }
        
        return {
          ...restaurant,
          types,
          dietaryPreferences,
          isDrinking
        };
      });
      
      setRestaurants(prev => pageToken ? [...prev, ...enhancedRestaurants] : enhancedRestaurants);
      setNextPageToken(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
      console.error("Error in fetchRestaurants:", errorMessage);
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const fetchRestaurantDetails = useCallback(async (restaurantId: string, reviewSort?: string) => {
    try {
      console.log("Fetching details for restaurant ID:", restaurantId, "with sort:", reviewSort);
      // Use place_id if available, otherwise fall back to id
      const placeId = restaurantId.includes("place_id:") ? restaurantId.replace("place_id:", "") : restaurantId;
      const details = await getRestaurantDetails(placeId, reviewSort);
      
      if (details) {
        // Add dietary preferences and drinking type to the restaurant details
        const dietaryPreferences = detectDietaryOptions(details);
        const isDrinking = isDrinkingEstablishment(details);
        
        // Add drinking type to restaurant types if it's detected as a drinking establishment
        let types = [...(details.types || [])];
        if (isDrinking && !types.includes('bar')) {
          types.push('bar');
        }
        
        return {
          ...details,
          types,
          dietaryPreferences,
          isDrinking
        };
      }
      
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant details';
      console.error("Error in fetchRestaurantDetails:", errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  useEffect(() => {
    if (location) {
      console.log("Location available, triggering restaurant fetch");
      fetchRestaurants();
    }
  }, [location, fetchRestaurants]);

  const loadMore = useCallback(() => {
    if (nextPageToken) {
      console.log("Loading more restaurants with token:", nextPageToken);
      fetchRestaurants(nextPageToken);
    }
  }, [nextPageToken, fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    hasMore: !!nextPageToken,
    loadMore,
    fetchRestaurantDetails
  };
};

export default useGoogleMaps;
