import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Restaurant } from '@/types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick?: (restaurant: Restaurant) => void;
}

const RestaurantCard = ({ restaurant, onClick }: RestaurantCardProps) => {
  const {
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    opening_hours,
    distance,
    duration,
    photos,
    types = [],
  } = restaurant;

  // Get photo URL or placeholder
  const photoUrl = photos && photos.length > 0
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM`
    : `https://via.placeholder.com/400x200/F4D35E/2D3047?text=${encodeURIComponent(name)}`;

  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : '';
  
  // Determine if it's a drinking establishment
  const isDrinking = restaurant.isDrinking || types.some(type => 
    ['bar', 'night_club', 'pub', 'izakaya'].includes(type)
  );

  return (
    <Link 
      to={`/restaurant/${restaurant.place_id || restaurant.id}`} 
      className="block no-underline"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick(restaurant);
        }
      }}
    >
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <img 
            src={photoUrl} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://via.placeholder.com/400x200/F4D35E/2D3047?text=${encodeURIComponent(name)}`;
            }}
          />
          {priceDisplay && (
            <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium">
              {priceDisplay}
            </div>
          )}
          {opening_hours?.open_now !== undefined && (
            <div 
              className={cn(
                "absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium",
                opening_hours.open_now 
                  ? "bg-green-500/80 text-white" 
                  : "bg-red-500/80 text-white"
              )}
            >
              {opening_hours.open_now ? 'Open Now' : 'Closed'}
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{name}</h3>
            {rating && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="ml-1 text-sm font-medium">{rating}</span>
                <span className="text-xs text-gray-500 ml-1">({user_ratings_total})</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-1">{vicinity}</p>
          
          {distance !== undefined && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDuration(duration)}</span>
              <span className="mx-1">·</span>
              <span>{formatDistance(distance)}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {isDrinking && (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                Bar/Izakaya
              </Badge>
            )}
            {types.slice(0, 2).map((type) => (
              !['bar', 'night_club', 'pub', 'izakaya'].includes(type) && (
                <Badge key={type} variant="outline" className="bg-gray-50">
                  {type.replace(/_/g, ' ')}
                </Badge>
              )
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
