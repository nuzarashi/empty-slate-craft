
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Location, Restaurant, Review } from '../types';

// In a real app, you would need to secure this API key
// For a production app, we'd use environment variables and server-side requests
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

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
      // In a real implementation, this would be an actual API call to Google Maps
      // For this demo, we'll use the dummy data instead
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration, we're using dummy data instead of actual API calls
      setRestaurants(prev => pageToken ? [...prev, ...demoRestaurants] : demoRestaurants);
      setNextPageToken(null); // No more pages in our demo
      
      // The real implementation would look like this:
      /*
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=1500&type=restaurant&key=${GOOGLE_MAPS_API_KEY}${pageToken ? `&pagetoken=${pageToken}` : ''}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(data.status);
      }
      
      const newRestaurants = data.results.map((place: any) => ({
        ...place,
        distance: null,
        duration: null
      }));
      
      setRestaurants(prev => pageToken ? [...prev, ...newRestaurants] : newRestaurants);
      setNextPageToken(data.next_page_token || null);
      
      // Calculate distances for all restaurants
      if (newRestaurants.length > 0) {
        calculateDistances(newRestaurants);
      }
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
      // In a real implementation, this would be an actual API call to Google Maps
      // For this demo, we'll return the matching restaurant from our dummy data
      
      return demoRestaurants.find(r => r.id === restaurantId) || null;
      
      // The real implementation would look like this:
      /*
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurantId}&fields=reviews,opening_hours&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(data.status);
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
      // In a real implementation, this would be an actual API call to Google Maps Distance Matrix API
      // For this demo, we're already using distances in our dummy data
      
      // The real implementation would look like this:
      /*
      const origins = `${location.lat},${location.lng}`;
      const destinations = places.map(place => `${place.geometry.location.lat},${place.geometry.location.lng}`).join('|');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to calculate distances');
      }
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(data.status);
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
