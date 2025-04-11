
import { toast } from 'sonner';
import type { Location, Restaurant } from '../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../config/api';

// Fetch nearby restaurants
export const fetchNearbyRestaurants = async (
  location: Location,
  pageToken?: string
): Promise<{ restaurants: Restaurant[], nextPageToken: string | null }> => {
  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'searchNearby',
        location: location,
        radius: 1500,
        type: 'restaurant',
        pageToken: pageToken || null
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch restaurants: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    const restaurants = data.results.map((place: any) => ({
      ...place,
      distance: place.distance || null,
      duration: place.duration || null
    }));
    
    return {
      restaurants,
      nextPageToken: data.next_page_token || null
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
    throw new Error(errorMessage);
  }
};

// Fetch restaurant details
export const fetchRestaurantDetails = async (restaurantId: string): Promise<Restaurant | null> => {
  try {
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'getDetails',
        placeId: restaurantId,
        fields: 'reviews,opening_hours'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch restaurant details: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.result;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant details';
    toast.error(errorMessage);
    return null;
  }
};

// Calculate distances between user location and places
export const calculateDistances = async (
  userLocation: Location,
  places: Restaurant[]
): Promise<Restaurant[]> => {
  try {
    const origins = `${userLocation.lat},${userLocation.lng}`;
    const destinations = places.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`);
    
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'calculateDistances',
        origins: origins,
        destinations: destinations,
        mode: 'walking'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to calculate distances: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return places.map((place, index) => {
      const element = data.rows[0].elements[index];
      
      if (element.status === 'OK') {
        return {
          ...place,
          distance: element.distance.value,
          duration: element.duration.value
        };
      }
      
      return place;
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to calculate distances';
    console.error(errorMessage);
    return places;
  }
};
