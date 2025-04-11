
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Location, Restaurant, Review } from '../types';

// Edge Function URL
const SUPABASE_EDGE_FUNCTION_URL = 'https://bizeubjoglqagnmnttie.supabase.co/functions/v1/google-places-api';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpemV1YmpvZ2xxYWdubW50dGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNzU0MzAsImV4cCI6MjA1OTk1MTQzMH0.2Q_CFSelTqlXrofaiMYUKzOIvmqaW_NTPun2hIPE9l4';

interface UseGoogleMapsProps {
  location: Location | null;
}

export const useGoogleMaps = ({ location }: UseGoogleMapsProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  // For development/demo purposes only
  const demoRestaurants: Restaurant[] = [
    {
      id: 'r1',
      name: 'Sushi Delight',
      vicinity: '123 Main St, City',
      rating: 4.7,
      user_ratings_total: 345,
      price_level: 3,
      photos: [{ photo_reference: 'demo1', width: 400, height: 300 }],
      geometry: { location: { lat: 35.658, lng: 139.701 } },
      opening_hours: { open_now: true },
      types: ['restaurant', 'food', 'japanese'],
      distance: 450,
      duration: 320,
      reviews: [
        {
          author_name: 'John D.',
          rating: 5,
          text: 'Amazing fresh sushi! The chef really knows his craft. Loved the ambiance too.',
          time: 1623459876,
          relative_time_description: '2 months ago'
        }
      ],
      reviewSummary: 'Exceptional fresh sushi with great atmosphere. Known for omakase sets and attentive service.'
    },
    {
      id: 'r2',
      name: 'Burger Factory',
      vicinity: '456 Oak St, City',
      rating: 4.2,
      user_ratings_total: 213,
      price_level: 2,
      photos: [{ photo_reference: 'demo2', width: 400, height: 300 }],
      geometry: { location: { lat: 35.659, lng: 139.702 } },
      opening_hours: { open_now: true },
      types: ['restaurant', 'food', 'burger'],
      distance: 650,
      duration: 520,
      reviews: [
        {
          author_name: 'Mary S.',
          rating: 4,
          text: 'Juicy burgers and great fries. Can get crowded during lunch.',
          time: 1629459876,
          relative_time_description: '1 month ago'
        }
      ],
      reviewSummary: 'Popular burger spot with quality ingredients. Best known for their specialty burgers and craft beers.'
    },
    {
      id: 'r3',
      name: 'Pasta Palace',
      vicinity: '789 Elm St, City',
      rating: 4.5,
      user_ratings_total: 187,
      price_level: 3,
      photos: [{ photo_reference: 'demo3', width: 400, height: 300 }],
      geometry: { location: { lat: 35.657, lng: 139.703 } },
      opening_hours: { open_now: false },
      types: ['restaurant', 'food', 'italian'],
      distance: 850,
      duration: 720,
      reviews: [
        {
          author_name: 'Robert T.',
          rating: 5,
          text: 'Authentic Italian pasta! The carbonara is to die for.',
          time: 1625459876,
          relative_time_description: '3 weeks ago'
        }
      ],
      reviewSummary: 'Authentic Italian pasta restaurant with homemade noodles. Known for carbonara and intimate dining experience.'
    },
    {
      id: 'r4',
      name: 'Vegan Vitality',
      vicinity: '101 Pine St, City',
      rating: 4.3,
      user_ratings_total: 156,
      price_level: 2,
      photos: [{ photo_reference: 'demo4', width: 400, height: 300 }],
      geometry: { location: { lat: 35.656, lng: 139.704 } },
      opening_hours: { open_now: true },
      types: ['restaurant', 'food', 'vegan', 'vegetarian'],
      distance: 950,
      duration: 820,
      reviews: [
        {
          author_name: 'Lisa M.',
          rating: 4,
          text: 'Creative vegan dishes that don\'t compromise on taste. The jackfruit tacos are amazing!',
          time: 1627459876,
          relative_time_description: '2 weeks ago'
        }
      ],
      reviewSummary: 'Creative plant-based menu with seasonal ingredients. Excellent for vegans and vegetarians with gluten-free options.'
    },
    {
      id: 'r5',
      name: 'Spice Garden',
      vicinity: '202 Cedar St, City',
      rating: 4.6,
      user_ratings_total: 278,
      price_level: 2,
      photos: [{ photo_reference: 'demo5', width: 400, height: 300 }],
      geometry: { location: { lat: 35.655, lng: 139.705 } },
      opening_hours: { open_now: true },
      types: ['restaurant', 'food', 'indian'],
      distance: 1050,
      duration: 920,
      reviews: [
        {
          author_name: 'David W.',
          rating: 5,
          text: 'Best Indian food in the city! The butter chicken is phenomenal and the naan bread is so fluffy.',
          time: 1624459876,
          relative_time_description: '1 month ago'
        }
      ],
      reviewSummary: 'Authentic Indian cuisine with extensive menu. Known for rich curries, fresh naan, and accommodating spice levels.'
    }
  ];

  const fetchRestaurants = useCallback(async (pageToken?: string) => {
    if (!location) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For development, we'll still use the dummy data 
      // But add a commented-out implementation of the Supabase Edge Function call
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration, we're using dummy data instead of actual API calls
      setRestaurants(prev => pageToken ? [...prev, ...demoRestaurants] : demoRestaurants);
      setNextPageToken(null); // No more pages in our demo
      
      // The Supabase Edge Function implementation would look like this:
      /*
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
      
      const newRestaurants = data.results.map((place: any) => ({
        ...place,
        distance: place.distance || null,
        duration: place.duration || null
      }));
      
      setRestaurants(prev => pageToken ? [...prev, ...newRestaurants] : newRestaurants);
      setNextPageToken(data.next_page_token || null);
      */
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const fetchRestaurantDetails = useCallback(async (restaurantId: string) => {
    try {
      // In a real implementation, this would call the Supabase Edge Function
      // For demo, we'll return the matching restaurant from our dummy data
      
      return demoRestaurants.find(r => r.id === restaurantId) || null;
      
      // The Supabase Edge Function implementation would look like this:
      /*
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
      */
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurant details';
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const calculateDistances = useCallback(async (places: Restaurant[]) => {
    if (!location || places.length === 0) return;
    
    try {
      // In a real implementation, this would be a call to the Supabase Edge Function
      // For this demo, we're already using distances in our dummy data
      
      // The Supabase Edge Function implementation would look like this:
      /*
      const origins = `${location.lat},${location.lng}`;
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
      
      const updatedRestaurants = places.map((place, index) => {
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
      
      setRestaurants(prev => {
        const updatedPrev = [...prev];
        
        updatedRestaurants.forEach(updatedPlace => {
          const index = updatedPrev.findIndex(place => place.id === updatedPlace.id);
          
          if (index !== -1) {
            updatedPrev[index] = updatedPlace;
          }
        });
        
        return updatedPrev;
      });
      */
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
