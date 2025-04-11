
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Heart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from '../types';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";

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
  
  // Generate placeholder images (in real app, these would come from Google API)
  const placeholderImages = [
    `https://via.placeholder.com/600x400/F4D35E/2D3047?text=${encodeURIComponent(name)}`,
    `https://via.placeholder.com/600x400/FF6B35/FFFFFF?text=Food+1`,
    `https://via.placeholder.com/600x400/D62828/FFFFFF?text=Food+2`,
  ];
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : '$';
  const priceClass = price_level ? `price-level-${price_level}` : '';
  
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 bg-white border-0">
        <div className="relative h-64 overflow-hidden">
          <Carousel className="w-full">
            <CarouselContent>
              {(photos && photos.length > 0 ? photos.map((photo, index) => (
                <CarouselItem key={index}>
                  <div className="h-64 w-full">
                    <img 
                      src={photo.photo_reference || placeholderImages[index % placeholderImages.length]} 
                      alt={`${name} - photo ${index+1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              )) : placeholderImages.map((img, index) => (
                <CarouselItem key={index}>
                  <div className="h-64 w-full">
                    <img 
                      src={img} 
                      alt={`${name} - photo ${index+1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              )))}
            </CarouselContent>
            <CarouselPrevious className="left-2 bg-white/80" />
            <CarouselNext className="right-2 bg-white/80" />
          </Carousel>
          
          {opening_hours?.open_now !== undefined && (
            <div className="absolute top-2 right-2 z-10">
              <Badge variant={opening_hours.open_now ? "default" : "secondary"}>
                {opening_hours.open_now ? 'Open Now' : 'Closed'}
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
