
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Map, X, AlertCircle, RefreshCcw, Filter } from 'lucide-react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import FilterBar from '../components/FilterBar';
import RestaurantCard from '../components/RestaurantCard';
import useLocation from '../hooks/useLocation';
import useGoogleMaps from '../hooks/useGoogleMaps';
import useRestaurants from '../hooks/useRestaurants';
import { useContext } from 'react';
import { LanguageContext } from '@/components/LanguageSelector';

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const { location, loading: loadingLocation, error: locationError } = useLocation();
  const { restaurants: allRestaurants, loading: loadingRestaurants, error: restaurantsError, hasMore, loadMore } = useGoogleMaps({ location });
  const { restaurants: filteredRestaurants, filters, updateFilters } = useRestaurants(allRestaurants);
  const { t } = useContext(LanguageContext);
  
  useEffect(() => {
    if (location) {
      toast.success('Location found! Searching for restaurants nearby.');
    }
  }, [location]);

  const handleRetryLocation = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header locationName={location ? 'nearby' : undefined} />
      
      <main className="flex-1 container mx-auto py-4 px-3 pb-16">
        {/* Location Error */}
        {locationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Location Access Needed</AlertTitle>
            <AlertDescription>
              {locationError}. Please allow location access to find restaurants near you.
              <Button 
                variant="outline" 
                onClick={handleRetryLocation} 
                className="mt-2"
                size="sm"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Loading Location */}
        {loadingLocation && !locationError && (
          <div className="text-center py-12">
            <LoadingSpinner size="large" />
            <p className="text-lg mt-4">Finding your location...</p>
            <p className="text-sm text-muted-foreground mt-1">Please allow location access if prompted</p>
          </div>
        )}
        
        {/* Filter Controls */}
        {location && (
          <div className="mb-4 sticky top-16 z-50 bg-gray-50 pt-1 pb-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">{t('restaurants')} {t('nearby')}</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                size="sm"
                className="flex items-center gap-1"
              >
                {showFilters ? (
                  <>
                    <X className="w-4 h-4" /> Hide
                  </>
                ) : (
                  <>
                    <Filter className="w-4 h-4" /> Filter
                  </>
                )}
              </Button>
            </div>
            
            {showFilters && (
              <FilterBar 
                filters={filters} 
                updateFilters={updateFilters} 
                className="mb-3 rounded-lg shadow-sm"
              />
            )}
          </div>
        )}
        
        {/* Loading Restaurants */}
        {loadingRestaurants && !restaurantsError && location && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="mt-2">Finding delicious places nearby...</p>
          </div>
        )}
        
        {/* Restaurant Error */}
        {restaurantsError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading restaurants</AlertTitle>
            <AlertDescription>{restaurantsError}</AlertDescription>
          </Alert>
        )}
        
        {/* Restaurant List */}
        {!loadingRestaurants && filteredRestaurants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
        
        {/* No Results */}
        {!loadingRestaurants && filteredRestaurants.length === 0 && allRestaurants.length > 0 && (
          <div className="text-center py-12">
            <p className="text-lg">No restaurants match your filters.</p>
            <Button 
              onClick={() => updateFilters({
                mealType: 'main',
                dietary: 'none',
                priceLevel: [1, 2, 3, 4],
                sortBy: 'distance',
                open: false,
                minRating: 0
              })} 
              variant="outline" 
              className="mt-2"
            >
              Reset Filters
            </Button>
          </div>
        )}
        
        {/* Load More */}
        {hasMore && filteredRestaurants.length > 0 && (
          <div className="text-center mt-8 pb-8">
            <Button onClick={loadMore} variant="outline">
              Load More
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
