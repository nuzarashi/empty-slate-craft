
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Location, Restaurant } from '../types';
import { 
  fetchNearbyRestaurants, 
  fetchRestaurantDetails as getRestaurantDetails,
  calculateDistances as getDistances
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
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { restaurants: newRestaurants, nextPageToken: token } = await fetchNearbyRestaurants(location, pageToken);
      
      setRestaurants(prev => pageToken ? [...prev, ...newRestaurants] : newRestaurants);
      setNextPageToken(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const fetchRestaurantDetails = useCallback(async (restaurantId: string) => {
    return await getRestaurantDetails(restaurantId);
  }, []);

  const calculateDistances = useCallback(async (places: Restaurant[]) => {
    if (!location || places.length === 0) return;
    
    try {
      const updatedPlaces = await getDistances(location, places);
      
      setRestaurants(prev => {
        const updatedPrev = [...prev];
        
        updatedPlaces.forEach(updatedPlace => {
          const index = updatedPrev.findIndex(place => place.id === updatedPlace.id);
          
          if (index !== -1) {
            updatedPrev[index] = updatedPlace;
          }
        });
        
        return updatedPrev;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate distances';
      console.error(errorMessage);
    }
  }, [location]);

  useEffect(() => {
    if (location) {
      fetchRestaurants();
    }
  }, [location, fetchRestaurants]);

  const loadMore = useCallback(() => {
    if (nextPageToken) {
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
