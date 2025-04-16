
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

export const useGoogleMaps = ({ location }: UseGoogleMapsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
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
      
      // Add dietary preferences to each restaurant
      const restaurantsWithDietary = newRestaurants.map(restaurant => {
        const dietaryPreferences = detectDietaryOptions(restaurant);
        return {
          ...restaurant,
          dietaryPreferences
        };
      });
      
      setRestaurants(prev => pageToken ? [...prev, ...restaurantsWithDietary] : restaurantsWithDietary);
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
        // Add dietary preferences to the restaurant details
        const dietaryPreferences = detectDietaryOptions(details);
        return {
          ...details,
          dietaryPreferences
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
