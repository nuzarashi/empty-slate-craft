
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Location, Restaurant } from '../types';
import {
  fetchNearbyRestaurants,
  fetchRestaurantDetails as getRestaurantDetails
} from '../services/googlePlacesAPI';

interface UseGoogleMapsProps {
  location: Location | null;
}

// Drinking establishment keywords - ADDED 'yakitori'
const drinkingKeywords = [
  'bar', 'pub', 'izakaya', 'night_club', 'snack_bar', 'liquor_store', 'karaoke',
  'lounge', 'tavern', 'gastropub', 'great drinks', 'cocktails', 'wide sake selection',
  'beer menu', 'happy hour', 'all-you-can-drink', 'nomihodai', 'whiskey bar',
  'drinking with coworkers', 'after work spot', 'chill vibe', 'good for groups',
  'open late', 'second party', '2次会', 'private room', 'karaoke after dinner',
  'great for drinking', 'not for food', 'beer', 'bottles', 'drink menus',
  'dim lighting', 'neon lights', 'bar counter', 'drinks toast', 'snack food',
  '二次会にぴったり', '飲み放題', '雰囲気がいい', '落ち着いたバー', '深夜まで営業',
  '会社帰りに', '友達と飲みに行った', 'yakitori' // <-- Added Yakitori here
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

      if (newRestaurants.length === 0 && !pageToken) { // Only show info if it's the first page and no results
        console.log("No restaurants found");
        toast.info("No restaurants found nearby. Try adjusting your filters or location.");
      } else if (newRestaurants.length > 0) {
        console.log(`Found ${newRestaurants.length} restaurants`);
         // Only toast on first load? Or maybe not at all? Consider UX.
         if (!pageToken) {
             toast.success(`Found ${newRestaurants.length} restaurants near you!`);
         }
      }

      // Add drinking type to each restaurant
      const enhancedRestaurants = newRestaurants.map(restaurant => {
        const isDrinking = isDrinkingEstablishment(restaurant);

        // Add drinking type to restaurant types if it's detected as a drinking establishment
        let types = [...(restaurant.types || [])];
        if (isDrinking && !types.includes('bar') && !types.includes('izakaya') && !types.includes('pub')) { // Avoid adding duplicates
          types.push('bar'); // Add a generic 'bar' type for filtering consistency
        }

        return {
          ...restaurant,
          types,
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

  const fetchRestaurantDetails = useCallback(async (restaurantId: string) => {
    try {
      console.log("Fetching details for restaurant ID:", restaurantId);
      // Use place_id if available, otherwise fall back to id
      const placeId = restaurantId.includes("place_id:") ? restaurantId.replace("place_id:", "") : restaurantId;
      const details = await getRestaurantDetails(placeId);

      if (details) {
        // Add drinking type to the restaurant details
        const isDrinking = isDrinkingEstablishment(details);

        // Add drinking type to restaurant types if it's detected as a drinking establishment
        let types = [...(details.types || [])];
        if (isDrinking && !types.includes('bar') && !types.includes('izakaya') && !types.includes('pub')) { // Avoid adding duplicates
          types.push('bar'); // Add a generic 'bar' type
        }

        return {
          ...details,
          types,
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
      console.log("Location available, triggering initial restaurant fetch");
      setRestaurants([]); // Clear previous results on location change
      setNextPageToken(null); // Reset token
      fetchRestaurants();
    }
  }, [location]); // Removed fetchRestaurants from dependency array to prevent loop

  const loadMore = useCallback(() => {
    if (nextPageToken && !loading) { // Prevent multiple simultaneous loads
      console.log("Loading more restaurants with token:", nextPageToken);
      fetchRestaurants(nextPageToken);
    }
  }, [nextPageToken, loading, fetchRestaurants]); // Added loading and fetchRestaurants

  // Public API of the hook
  return {
    restaurants,
    loading,
    error,
    hasMore: !!nextPageToken, // Expose derived state
    loadMore, // Expose loadMore callback
    fetchRestaurantDetails // Expose details fetcher
  };
};

export default useGoogleMaps;
