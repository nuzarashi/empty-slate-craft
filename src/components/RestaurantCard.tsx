
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Heart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from '../types';
import { formatDistance, formatDuration } from '@/utils/formatters';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const {
    id,
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
  
  // Placeholder image if no photos are available
  const imageUrl = photos && photos.length > 0
    ? `https://via.placeholder.com/600x400/F4D35E/2D3047?text=${encodeURIComponent(name)}`
    : `https://via.placeholder.com/600x400/F4D35E/2D3047?text=No+Image`;
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : '$';
  const priceClass = price_level ? `price-level-${price_level}` : '';
  
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 bg-white border-0">
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
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
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
                <Star className="w-4 h-4 text-food-yellow mr-1" />
                <span className="font-medium">{rating}</span>
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
  );
};

export default RestaurantCard;
