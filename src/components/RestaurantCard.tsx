
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { formatDistance, formatDuration } from '@/utils/formatters';
import { Star, Clock, MapPin, DollarSign, Sparkles, GlassWater } from 'lucide-react';
import type { Restaurant } from '@/types';
import { useRestaurantPhotos } from '@/hooks/useRestaurantPhotos';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageSelector';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  const { photoUrls } = useRestaurantPhotos(restaurant);
  const { t } = useContext(LanguageContext);
  const placeId = restaurant.place_id || restaurant.id;

  const renderPriceLevel = (level: number | undefined) => {
    if (level === undefined) return <span className="text-xs text-gray-500">{t('price_not_available')}</span>;
    return (
      <span className="flex items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <DollarSign
            key={i}
            className={`h-4 w-4 ${i < level ? 'text-food-dark' : 'text-gray-300'}`}
            strokeWidth={i < level ? 2.5 : 1.5}
          />
        ))}
      </span>
    );
  };

  return (
    <Card className="w-full overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-200">
      {photoUrls.length > 0 ? (
        <div className="relative">
          <Carousel className="w-full">
            <CarouselContent>
              {photoUrls.map((url, index) => (
                <CarouselItem key={index}>
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={url}
                      alt={`${restaurant.name} photo ${index + 1}`}
                      className="object-cover w-full h-full"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(restaurant.name)}`;
                        target.alt = `${restaurant.name} placeholder`;
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photoUrls.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/75" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
         <div className="aspect-video bg-gray-200 flex items-center justify-center">
           <span className="text-gray-500">{t('no_image')}</span>
         </div>
      )}

      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-lg font-semibold truncate text-left">{restaurant.name}</CardTitle>
        <p className="text-sm text-muted-foreground truncate text-left">{restaurant.vicinity}</p>
      </CardHeader>

      <CardContent className="flex-grow px-4 pb-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            <span>{restaurant.rating ? restaurant.rating.toFixed(1) : t('no_rating')}</span>
            <span className="text-muted-foreground">({restaurant.user_ratings_total || 0})</span>
          </div>
          {renderPriceLevel(restaurant.price_level)}
        </div>

        <div className="flex items-center text-sm text-muted-foreground gap-3">
          {restaurant.distance !== undefined && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{formatDistance(restaurant.distance)}</span>
            </div>
          )}
          {restaurant.duration !== undefined && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(restaurant.duration)}</span>
            </div>
          )}
        </div>
         {restaurant.opening_hours && (
           <p className={`text-xs font-medium mt-1 ${restaurant.opening_hours.open_now ? 'text-green-600' : 'text-red-600'}`}>
             {restaurant.opening_hours.open_now ? t('open_now') : t('closed_now')}
           </p>
         )}
         {restaurant.reviewSummary && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
              <Sparkles className="w-3 h-3 inline-block mr-1 text-primary" />
              {restaurant.reviewSummary}
            </p>
         )}
         {restaurant.isDrinking && (
           <Badge variant="secondary" className="mt-2 text-xs">
             <GlassWater className="w-3 h-3 mr-1"/>
             {t('good_for_drinks')}
           </Badge>
         )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Button asChild variant="default" size="sm" className="w-full bg-food-orange hover:bg-food-red">
          <Link to={`/details/${placeId}`}>{t('view_details')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RestaurantCard;
