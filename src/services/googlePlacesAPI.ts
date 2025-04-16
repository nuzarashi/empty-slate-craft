
import { toast } from 'sonner';
import type { Location, Restaurant } from '../types';
import { SUPABASE_EDGE_FUNCTION_URL, SUPABASE_ANON_KEY } from '../config/api';

// Google API Key for Places API
const GOOGLE_API_KEY = 'AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM';

// Fetch nearby restaurants
export const fetchNearbyRestaurants = async (
  location: Location,
  pageToken?: string
): Promise<{ restaurants: Restaurant[], nextPageToken: string | null }> => {
  try {
    console.log('Fetching nearby restaurants with:', { 
      location, 
      url: SUPABASE_EDGE_FUNCTION_URL,
      pageToken,
      apiKey: 'API key provided' // Log that we have the key (not the actual key)
    });
    
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
        pageToken: pageToken || null,
        apiKey: GOOGLE_API_KEY
      })
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch restaurants: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    if (data.error) {
      console.error('API returned error:', data.error);
      throw new Error(data.error);
    }
    
    const restaurants = data.results.map((place: any) => ({
      ...place,
      place_id: place.place_id, // Ensure place_id is included
      distance: place.distance || null,
      duration: place.duration || null
    }));
    
    // If we got results, immediately calculate distances
    if (restaurants.length > 0) {
      try {
        const restaurantsWithDistances = await calculateDistances(location, restaurants);
        return {
          restaurants: restaurantsWithDistances,
          nextPageToken: data.next_page_token || null
        };
      } catch (err) {
        console.error('Error calculating distances:', err);
        // Continue with restaurants without distances
        return {
          restaurants,
          nextPageToken: data.next_page_token || null
        };
      }
    } else {
      return {
        restaurants,
        nextPageToken: data.next_page_token || null
      };
    }
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Fetch restaurant details with optional review sorting
export const fetchRestaurantDetails = async (restaurantId: string, reviewSort: string = 'recent'): Promise<Restaurant | null> => {
  try {
    console.log('Fetching restaurant details for:', restaurantId, 'with review sort:', reviewSort);
    
    const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'getDetails',
        placeId: restaurantId,
        fields: 'name,rating,vicinity,user_ratings_total,price_level,photos,geometry,opening_hours,reviews',
        apiKey: GOOGLE_API_KEY,
        reviewSort: reviewSort,
        reviewCount: 5 // Explicitly request 5 reviews
      })
    });
    
    console.log('Details response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Details API error:', errorText);
      throw new Error(`Failed to fetch restaurant details: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Details API response:', data);
    
    if (data.error) {
      console.error('Details API returned error:', data.error);
      throw new Error(data.error);
    }
    
    return data.result;
  } catch (err) {
    console.error('Error fetching restaurant details:', err);
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
    console.log('Calculating distances for', places.length, 'places');
    
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
        mode: 'walking',
        apiKey: GOOGLE_API_KEY
      })
    });
    
    console.log('Distances response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Distances API error:', errorText);
      throw new Error(`Failed to calculate distances: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Distances API response:', data);
    
    if (data.error) {
      console.error('Distances API returned error:', data.error);
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
    console.error('Error calculating distances:', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to calculate distances';
    console.error(errorMessage);
    return places;
  }
};
