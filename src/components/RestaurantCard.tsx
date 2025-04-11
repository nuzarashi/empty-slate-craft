
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from '../types';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
} from "@/components/ui/carousel";
import { useMediaQuery } from '@/hooks/use-mobile';

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
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentIndex, setCurrentIndex] = React.useState(0);
  
  // Generate placeholder images (in real app, these would come from Google API)
  const placeholderImages = [
    `https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(name)}`,
    `https://via.placeholder.com/800x600/FF6B35/FFFFFF?text=Food+1`,
    `https://via.placeholder.com/800x600/D62828/FFFFFF?text=Food+2`,
  ];
  
  const imagesToUse = photos && photos.length > 0 ? 
    photos.map(photo => photo.photo_reference || placeholderImages[0]) : 
    placeholderImages;
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : '$';
  const priceClass = price_level ? `price-level-${price_level}` : '';
  
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imagesToUse.length);
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? imagesToUse.length - 1 : prevIndex - 1
    );
  };
  
  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 bg-white border-0">
        <div className="relative h-80 overflow-hidden">
          {/* Instagram-style carousel with dots and side-swipe navigation */}
          <div className="relative h-full w-full">
            <img 
              src={imagesToUse[currentIndex]} 
              alt={`${name} - photo ${currentIndex+1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            <button 
              onClick={(e) => { e.preventDefault(); prevImage(); }} 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button 
              onClick={(e) => { e.preventDefault(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Instagram-style dot indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
              {imagesToUse.map((_, index) => (
                <div 
                  key={index} 
                  className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                  aria-label={`Go to image ${index+1}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.preventDefault(); setCurrentIndex(index); }}
                ></div>
              ))}
            </div>
          </div>
          
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
