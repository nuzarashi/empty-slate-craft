
import React, { useState, useCallback, useContext, useEffect } from 'react';
import { useLocation as useReactRouterLocation } from 'react-router-dom';
import useAppLocation from '@/hooks/useLocation';
import useGoogleMaps from '@/hooks/useGoogleMaps';
import useRestaurantsHook from '@/hooks/useRestaurants';
import RestaurantCard from '@/components/RestaurantCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MapPin, Filter, AlertCircle, WifiOff, Loader2 } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import type { FilterOptions } from '@/types';
import { LanguageContext } from '@/components/LanguageSelector';
import { DiningPreferences } from '@/components/PreferencesMenu';

const Index = () => {
  const routerLocation = useReactRouterLocation();
  const locationState = routerLocation.state as { latitude: number; longitude: number; walkTime: number } | null;

  const { location: detectedLocation, loading: loadingLocation, error: locationError } = useAppLocation();

  const userLocation = locationState ? { lat: locationState.latitude, lng: locationState.longitude } : detectedLocation;
  const maxDuration = locationState ? locationState.walkTime * 60 : 900;

  const {
    restaurants: allRestaurants,
    loading: loadingMaps,
    error: mapsError,
    hasMore: hasMorePages,
    loadMore
  } = useGoogleMaps({ location: userLocation });

  const { t } = useContext(LanguageContext);

  const {
    restaurants: filteredRestaurants,
    filters,
    updateFilters
  } = useRestaurantsHook(
      allRestaurants,
      hasMorePages,
      loadMore,
      loadingMaps
  );

  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);

  const handleFilterChange = useCallback((newFilters: Partial<FilterOptions>) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handlePreferencesChange = useCallback((newPreferences: DiningPreferences) => {
    updateFilters({ mealType: newPreferences.mealType });
    const [min, max] = newPreferences.budget;
    const priceLevels = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    updateFilters({ priceLevel: priceLevels });
  }, [updateFilters]);

  const finalRestaurants = filteredRestaurants.filter(r =>
      r.duration === undefined || r.duration === null || r.duration <= maxDuration
  );

  if (loadingLocation) {
     return (
       <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
         <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-muted-foreground">{t('fetching_location')}</p>
       </div>
     );
  }

  if (locationError && !userLocation) {
      return (
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('location_error_title')}</AlertTitle>
            <AlertDescription>
               {t('location_error_description')}
               <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{locationError}</pre>
            </AlertDescription>
          </Alert>
           <Button onClick={() => window.location.reload()} className="mt-4">{t('retry')}</Button>
        </div>
      );
  }

  if (mapsError && allRestaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error_loading_title')}</AlertTitle>
          <AlertDescription>
            {t('error_loading_description')}
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">{mapsError}</pre>
          </AlertDescription>
        </Alert>
         <Button onClick={() => window.location.reload()} className="mt-4">{t('retry')}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nearby_restaurants')}</h1>
        <Button variant="outline" size="icon" onClick={() => setIsFilterBarOpen(true)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {userLocation ? (
        <p className="text-sm text-muted-foreground mb-4 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3 inline-block" />
          {t('showing_results_near')} {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} 
          {` (${t('within_minutes').replace('{{minutes}}', String(locationState?.walkTime || 15))})`}
        </p>
      ) : (
         <p className="text-sm text-muted-foreground mb-4">{t('location_unavailable')}</p>
      )}

      {loadingMaps && allRestaurants.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="large" />
        </div>
      ) : finalRestaurants.length === 0 ? (
         <div className="text-center py-10">
            <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">{t('no_restaurants_found')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('try_adjusting_filters')}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsFilterBarOpen(true)}>
               {t('adjust_filters')}
             </Button>
         </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {finalRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.place_id || restaurant.id} restaurant={restaurant} />
            ))}
          </div>
          {hasMorePages && (
            <div className="mt-8 text-center">
              <Button onClick={loadMore} disabled={loadingMaps}>
                {loadingMaps ? <LoadingSpinner size="small" /> : t('show_more')}
              </Button>
            </div>
          )}
        </>
      )}

      <FilterBar
        isOpen={isFilterBarOpen}
        onClose={() => setIsFilterBarOpen(false)}
        currentFilters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default Index;
