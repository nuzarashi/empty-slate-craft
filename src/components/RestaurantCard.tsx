
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from '../types';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { LanguageContext } from '@/components/LanguageSelector';
import PhotoCarousel from './restaurant-details/PhotoCarousel';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const {
    id,
    place_id,
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    photos,
    opening_hours,
    distance,
    duration,
  } = restaurant;
  
  const { t } = useContext(LanguageContext);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  // Create photo URLs using the photo_reference
  const getPhotoUrl = (photoRef: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM`;
  };
  
  useEffect(() => {
    // Generate image URLs
    const generateImageUrls = () => {
      // If photos exist from Google API, use them
      if (photos && photos.length > 0) {
        // Limit to 5 photos max
        const photoRefs = photos.slice(0, 5).map(photo => photo.photo_reference);
        return photoRefs.map(ref => getPhotoUrl(ref));
      } 
      
      // Fallback to placeholder images
      return [
        `https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(name)}`,
        `https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=Food+1`,
        `https://via.placeholder.com/800x600/D62828/FFFFFF?text=Food+2`,
        `https://via.placeholder.com/800x600/0A9396/FFFFFF?text=Food+3`,
        `https://via.placeholder.com/800x600/005F73/FFFFFF?text=Food+4`,
      ];
    };
    
    setImageUrls(generateImageUrls());
  }, [photos, name]);
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : '$';
  const priceClass = price_level ? `price-level-${price_level}` : '';
  
  // Create the restaurant detail route link with the proper ID
  // If place_id exists, use it prefixed with "place_id:"
  const detailLink = place_id ? `/restaurant/place_id:${place_id}` : `/restaurant/${id}`;
  
  return (
    <div className="relative"> {/* Wrap card in relative div for z-index isolation */}
      <Link to={detailLink} className="block">
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 bg-white border-0">
          <div className="relative h-80 overflow-hidden">
            {/* Use the PhotoCarousel component instead of custom implementation */}
            <PhotoCarousel photoUrls={imageUrls} restaurantName={name} />
            
            {opening_hours?.open_now !== undefined && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant={opening_hours.open_now ? "default" : "secondary"}>
                  {opening_hours.open_now ? t('open_now') : t('closed')}
                </Badge>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 z-10">
              <h3 className="text-xl font-semibold text-white line-clamp-1">{name}</h3>
            </div>
          </div>
          
          <CardContent className="p-3">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{vicinity}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-6 h-6 text-food-yellow mr-1" fill="gold" strokeWidth={0.5} />
                  <span className="font-medium text-lg">{rating}</span>
                  <span className="text-muted-foreground text-xs ml-1">({user_ratings_total})</span>
                </div>
                
                <span className={`price-label ${priceClass} text-xs font-medium`}>{priceDisplay}</span>
              </div>
              
              {distance !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
            </div>
            
            {restaurant.reviewSummary && (
              <p className="text-xs mt-2 line-clamp-1 italic text-muted-foreground">
                "{restaurant.reviewSummary}"
              </p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default RestaurantCard;
