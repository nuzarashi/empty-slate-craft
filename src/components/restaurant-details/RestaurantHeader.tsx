
import React from 'react';
import { MapPin, Star, Clock, ExternalLink } from 'lucide-react';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import type { Restaurant } from '@/types';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

const RestaurantHeader = ({ restaurant }: RestaurantHeaderProps) => {
  const { t } = useContext(LanguageContext);
  const {
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    opening_hours,
    distance,
    duration,
    place_id,
    id
  } = restaurant;
  
  const priceDisplay = price_level ? '$'.repeat(price_level) : 'Unknown price';
  const priceClass = price_level ? `price-level-${price_level}` : '';

  return (
    <div className="px-4 py-4 bg-white border-b">
      <div className="flex justify-between items-start mb-2">
        <h1 className="text-2xl font-bold">{name}</h1>
        <span className={`price-label ${priceClass} text-sm px-2 py-1 bg-gray-100 rounded-md`}>
          {priceDisplay}
        </span>
      </div>
      
      <div className="flex items-center text-sm text-muted-foreground mb-3">
        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>{vicinity}</span>
      </div>
      
      <div className="flex items-center flex-wrap gap-4 mb-3">
        <div className="flex items-center">
          <Star className="w-8 h-8 text-food-yellow mr-1" fill="gold" strokeWidth={0.5} />
          <span className="font-medium text-xl">{rating}</span>
          <span className="text-muted-foreground text-xs ml-1">({user_ratings_total})</span>
        </div>
        
        {distance !== undefined && (
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span className="mr-1">{formatDuration(duration)}</span>
            <span className="text-muted-foreground">({formatDistance(distance)})</span>
          </div>
        )}
        
        {opening_hours?.open_now !== undefined && (
          <div className={`text-sm ${opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
            {opening_hours.open_now ? t('open_now') : t('closed')}
          </div>
        )}
      </div>

      <a 
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${place_id || id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-food-red hover:text-food-orange flex items-center transition-colors"
      >
        {t('view_on_google_maps')} <ExternalLink className="w-3 h-3 ml-1" />
      </a>
    </div>
  );
};

export default RestaurantHeader;
