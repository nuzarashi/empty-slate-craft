
import { useState, useEffect } from 'react';
import type { Restaurant } from '@/types';

export const useRestaurantPhotos = (restaurant: Restaurant | null) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const getPhotoUrl = (photoRef: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM`;
  };

  // Update photoUrls when restaurant data changes
  useEffect(() => {
    if (restaurant) {
      if (restaurant.photos && restaurant.photos.length > 0) {
        const urls = restaurant.photos.slice(0, 5).map(photo => 
          getPhotoUrl(photo.photo_reference)
        );
        setPhotoUrls(urls);
      } else {
        setPhotoUrls([`https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(restaurant.name)}`]);
      }
    }
  }, [restaurant]);

  return { photoUrls };
};
