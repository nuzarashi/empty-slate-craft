
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, ExternalLink, ChevronLeft, ChevronRight, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import useGoogleMaps from '@/hooks/useGoogleMaps';
import { generateReviewSummary } from '@/utils/reviewSummary';
import type { Restaurant, Review } from '@/types';
import { formatDistance, formatDuration } from '@/utils/formatters';

type ReviewSortOption = 'recent' | 'helpful';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { fetchRestaurantDetails } = useGoogleMaps({ location: null });
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('recent');
  const [reviewSummaries, setReviewSummaries] = useState<{[key: string]: string}>({});

  // Function to get photo URL
  const getPhotoUrl = (photoRef: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM`;
  };

  // Navigation functions for photo carousel
  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? photoUrls.length - 1 : prevIndex - 1
    );
  };

  // Sort reviews based on selected option
  const getSortedReviews = () => {
    if (!restaurant?.reviews) return [];
    
    return [...restaurant.reviews].sort((a, b) => {
      if (reviewSort === 'recent') {
        return b.time - a.time; // Most recent first
      } else {
        // For 'helpful', in a real scenario we would use a helpfulness score
        // For demo purposes, we'll mix rating and recency
        return (b.rating * 10000 + b.time) - (a.rating * 10000 + a.time);
      }
    });
  };

  // Generate AI summary for individual reviews
  const getReviewSummary = async (reviewIndex: number, reviewText: string) => {
    if (reviewSummaries[reviewIndex] || !reviewText) return;
    
    try {
      const summary = await generateReviewSummary([{ 
        author_name: '', 
        rating: 0, 
        text: reviewText,
        time: 0,
        relative_time_description: ''
      }]);
      
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: summary
      }));
    } catch (error) {
      console.error('Error generating review summary:', error);
    }
  };

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log("Fetching restaurant details for ID:", id);
        const details = await fetchRestaurantDetails(id);
        if (details) {
          setRestaurant(details);
          
          // Generate photo URLs
          if (details.photos && details.photos.length > 0) {
            // Limit to 5 photos max
            const urls = details.photos.slice(0, 5).map(photo => 
              getPhotoUrl(photo.photo_reference)
            );
            setPhotoUrls(urls);
          } else {
            // Fallback image
            setPhotoUrls([`https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(details.name)}`]);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [id, fetchRestaurantDetails]);

  useEffect(() => {
    // Generate summaries for reviews when they load
    if (restaurant?.reviews) {
      restaurant.reviews.forEach((review, index) => {
        getReviewSummary(index, review.text);
      });
    }
  }, [restaurant?.reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-muted-foreground">Loading restaurant details...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="p-4 flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl mb-4">Restaurant not found</p>
          <Link to="/restaurants">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to restaurants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    opening_hours,
    distance,
    duration,
    reviewSummary,
    reviews
  } = restaurant;
  
  // Format price level as $ symbols
  const priceDisplay = price_level ? '$'.repeat(price_level) : 'Unknown price';
  const priceClass = price_level ? `price-level-${price_level}` : '';

  // Get sorted reviews
  const sortedReviews = getSortedReviews();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locationName={name} />
      
      <main className="pb-16">
        {/* Hero image with carousel */}
        <div className="relative w-full h-64 md:h-80">
          {photoUrls.length > 0 && (
            <>
              <img 
                src={photoUrls[currentPhotoIndex]} 
                alt={`${name} - photo ${currentPhotoIndex+1}`}
                className="w-full h-full object-cover" 
              />
              
              {photoUrls.length > 1 && (
                <>
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevPhoto} 
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Photo indicator dots */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                    {photoUrls.map((_, index) => (
                      <div 
                        key={index} 
                        className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                        aria-label={`Go to photo ${index+1}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => setCurrentPhotoIndex(index)}
                      ></div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          
          <Link 
            to="/restaurants"
            className="absolute top-4 left-4 bg-white/70 rounded-full p-2 backdrop-blur-sm shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Restaurant info */}
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
              <Star className="w-6 h-6 text-food-yellow mr-1" fill="gold" strokeWidth={0.5} />
              <span className="font-medium text-lg">{rating}</span>
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
                {opening_hours.open_now ? 'Open Now' : 'Closed'}
              </div>
            )}
          </div>

          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${restaurant.place_id || restaurant.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-food-red hover:text-food-orange flex items-center transition-colors"
          >
            View on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        
        {/* Review summary */}
        {reviewSummary && (
          <div className="p-4 bg-white mt-2 rounded-lg shadow-sm mx-4">
            <h2 className="text-lg font-semibold mb-2">AI Review Summary</h2>
            <p className="text-gray-700">{reviewSummary}</p>
          </div>
        )}
        
        {/* Review sorting dropdown */}
        {reviews && reviews.length > 0 && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Reviews</h2>
              <Select
                value={reviewSort}
                onValueChange={(value: string) => setReviewSort(value as ReviewSortOption)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort reviews by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {sortedReviews.map((review, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{review.author_name}</div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'text-food-yellow' : 'text-gray-300'}`}
                          fill={i < review.rating ? 'gold' : 'none'}
                          strokeWidth={0.5}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* AI summary instead of full review text */}
                  <p className="text-sm text-gray-700">
                    {reviewSummaries[index] || (
                      <>
                        <span className="text-xs text-muted-foreground">Generating AI summary...</span>
                        <br />
                        {review.text.length > 100 ? `${review.text.substring(0, 100)}...` : review.text}
                      </>
                    )}
                  </p>
                  
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-muted-foreground">
                      {review.relative_time_description}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      <span>Helpful</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RestaurantDetails;
