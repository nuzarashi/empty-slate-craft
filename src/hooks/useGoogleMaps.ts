
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

export const useGoogleMaps = ({ location }: UseGoogleMapsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
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
      
      setRestaurants(prev => pageToken ? [...prev, ...newRestaurants] : newRestaurants);
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
      return await getRestaurantDetails(restaurantId);
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
