
import React from 'react';
import { Clock, MapPin, Star, ExternalLink } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const formatDistance = (meters: number | undefined): string => {
  if (meters === undefined) return 'Unknown distance';
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number | undefined): string => {
  if (seconds === undefined) return 'Unknown time';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const {
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    photos,
    opening_hours,
    distance,
    duration,
    reviewSummary
  } = restaurant;
  
  // Placeholder image if no photos are available
  const imageUrl = photos && photos.length > 0
    ? `https://via.placeholder.com/300x200/F4D35E/2D3047?text=${encodeURIComponent(name)}`
    : `https://via.placeholder.com/300x200/F4D35E/2D3047?text=No+Image`;
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : 'Unknown price';
  const priceClass = price_level ? `price-level-${price_level}` : '';
  
  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-shadow mb-4">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {opening_hours?.open_now !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge variant={opening_hours.open_now ? "default" : "secondary"}>
              {opening_hours.open_now ? 'Open Now' : 'Closed'}
            </Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold line-clamp-1">{name}</h3>
          <span className={`price-label ${priceClass}`}>{priceDisplay}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{vicinity}</span>
        </div>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-food-yellow mr-1" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground text-xs ml-1">({user_ratings_total})</span>
          </div>
          
          {distance !== undefined && (
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-1" />
              <span className="mr-1">{formatDuration(duration)}</span>
              <span className="text-muted-foreground">({formatDistance(distance)})</span>
            </div>
          )}
        </div>
        
        {reviewSummary && (
          <p className="text-sm mb-3 line-clamp-2 italic text-muted-foreground">
            "{reviewSummary}"
          </p>
        )}
        
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${restaurant.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-food-red hover:text-food-orange flex items-center transition-colors"
        >
          View on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
