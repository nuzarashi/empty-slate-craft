import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import useGoogleMaps from '@/hooks/useGoogleMaps';
import type { Restaurant } from '@/types';
import { LanguageContext } from '@/components/LanguageSelector';
import PhotoCarousel from '@/components/restaurant-details/PhotoCarousel';
import RestaurantHeader from '@/components/restaurant-details/RestaurantHeader';
import ReviewSummary from '@/components/restaurant-details/ReviewSummary';
import ReviewList from '@/components/restaurant-details/ReviewList';
import { useReviewHandling } from '@/hooks/useReviewHandling';
import { useRestaurantPhotos } from '@/hooks/useRestaurantPhotos';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { fetchRestaurantDetails } = useGoogleMaps({ location: null });
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { t, language } = useContext(LanguageContext);
  
  const { photoUrls } = useRestaurantPhotos(restaurant);
  const { 
    sortedReviews, 
    reviewSummaries, 
    isGeneratingMainSummary, 
    categorySummary,
  } = useReviewHandling({ restaurant });

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log("Fetching restaurant details for ID:", id);
        const details = await fetchRestaurantDetails(id);
        if (details) {
          console.log("Restaurant details loaded:", details.name, "with", details.reviews?.length || 0, "reviews");
          setRestaurant(details);
        }
      } catch (error) {
        console.error("Error loading restaurant details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [id, fetchRestaurantDetails, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">{t('loading_restaurant_details')}</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4 flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl mb-4">{t('restaurant_not_found')}</p>
          <Link to="/restaurants">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back_to_restaurants')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locationName={restaurant.name} />
      
      <main className="pb-16">
        <div className="relative">
          <PhotoCarousel photoUrls={photoUrls} restaurantName={restaurant.name} />
          
          <Link 
            to="/restaurants"
            className="absolute top-4 left-4 bg-white/70 rounded-full p-2 backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <RestaurantHeader restaurant={restaurant} />
        
        <ReviewSummary 
          categorySummary={categorySummary} 
          isGeneratingMainSummary={isGeneratingMainSummary} 
        />
        
        {restaurant?.reviews && restaurant.reviews.length > 0 && (
          <ReviewList 
            sortedReviews={sortedReviews}
            reviewSummaries={reviewSummaries}
          />
        )}
      </main>
    </div>
  );
};

export default RestaurantDetails;
