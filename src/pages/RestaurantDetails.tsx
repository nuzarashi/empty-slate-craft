
import React, { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, ExternalLink, ChevronLeft, ChevronRight, ThumbsUp, Utensils, Music, User } from 'lucide-react';
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
import type { Restaurant, Review, ReviewSortOption } from '@/types';
import type { CategorySummary } from '@/utils/reviewSummary';
import { formatDistance, formatDuration } from '@/utils/formatters';
import { LanguageContext } from '@/components/LanguageSelector';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { fetchRestaurantDetails } = useGoogleMaps({ location: null });
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [reviewSort, setReviewSort] = useState<ReviewSortOption>('recent');
  const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
  const [reviewSummaries, setReviewSummaries] = useState<{[key: string]: string}>({});
  const [isGeneratingMainSummary, setIsGeneratingMainSummary] = useState<boolean>(false);
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const { language, t } = useContext(LanguageContext);
  const [isLoadingNewReviews, setIsLoadingNewReviews] = useState<boolean>(false);

  const getPhotoUrl = (photoRef: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyBzl37_a_xWe3MbIJlPJOfO7Il--DSO3AM`;
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? photoUrls.length - 1 : prevIndex - 1
    );
  };

  // Handle sort change explicitly - now also refetches restaurant details with new sort
  const handleSortChange = useCallback(async (value: string) => {
    console.log("Sorting changed to:", value);
    
    if (value === reviewSort) {
      console.log("Sort value unchanged, skipping refetch");
      return;
    }
    
    setReviewSort(value as ReviewSortOption);
    setIsLoadingNewReviews(true);
    
    if (id) {
      try {
        console.log("Fetching new reviews with sort:", value);
        // Pass the review sort option to fetch appropriate reviews
        const details = await fetchRestaurantDetails(id, value as ReviewSortOption);
        if (details) {
          console.log("New details fetched successfully:", details);
          setRestaurant(details);
          // Clear existing review summaries to regenerate them
          setReviewSummaries({});
          
          // Generate a summary of all reviews
          if (details.reviews && details.reviews.length > 0) {
            generateAllReviewsSummary(details.reviews);
          }
        }
      } catch (error) {
        console.error("Error fetching restaurant details with new sort:", error);
      } finally {
        setIsLoadingNewReviews(false);
      }
    }
  }, [id, fetchRestaurantDetails, reviewSort]);

  // Updated sorting function with memoization to prevent unnecessary calculations
  const updateSortedReviews = useCallback(() => {
    if (!restaurant?.reviews) return;
    
    console.log("Updating sorted reviews with sort option:", reviewSort);
    const reviews = [...restaurant.reviews].sort((a, b) => {
      if (reviewSort === 'recent') {
        return b.time - a.time; // Most recent first
      } else {
        return (b.rating * 10000 + b.time) - (a.rating * 10000 + a.time);
      }
    });
    
    console.log("Sorted reviews count:", reviews.length);
    setSortedReviews(reviews);
  }, [restaurant?.reviews, reviewSort]);

  // Helper to detect if text is Japanese
  const isJapaneseText = (text: string): boolean => {
    // Check for Japanese characters (Hiragana, Katakana, Kanji)
    const japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF]/;
    return japaneseRegex.test(text);
  };

  const getReviewSummary = async (reviewIndex: number, reviewText: string) => {
    if (reviewSummaries[reviewIndex] || !reviewText) return;
    
    // If UI language is Japanese but review is already in Japanese, use the original
    if (language === 'ja' && isJapaneseText(reviewText)) {
      console.log("Review is already in Japanese, skipping translation for index:", reviewIndex);
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: reviewText
      }));
      return;
    }
    
    try {
      const summary = await generateReviewSummary([{ 
        author_name: '', 
        rating: 0, 
        text: reviewText,
        time: 0,
        relative_time_description: ''
      }], language);
      
      setReviewSummaries(prev => ({
        ...prev,
        [reviewIndex]: summary.summary
      }));
    } catch (error) {
      console.error('Error generating review summary:', error);
    }
  };

  // Generate a summary for all reviews
  const generateAllReviewsSummary = async (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) return;
    
    setIsGeneratingMainSummary(true);
    try {
      const summary = await generateReviewSummary(reviews, language);
      setCategorySummary(summary);
    } catch (error) {
      console.error('Error generating all reviews summary:', error);
    } finally {
      setIsGeneratingMainSummary(false);
    }
  };

  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        console.log("Fetching restaurant details for ID:", id, "with sort:", reviewSort);
        // Pass the current review sort option
        const details = await fetchRestaurantDetails(id, reviewSort);
        if (details) {
          console.log("Restaurant details loaded:", details.name, "with", details.reviews?.length || 0, "reviews");
          setRestaurant(details);
          
          if (details.photos && details.photos.length > 0) {
            const urls = details.photos.slice(0, 5).map(photo => 
              getPhotoUrl(photo.photo_reference)
            );
            setPhotoUrls(urls);
          } else {
            setPhotoUrls([`https://via.placeholder.com/800x600/F4D35E/2D3047?text=${encodeURIComponent(details.name)}`]);
          }

          // Generate a summary of all reviews
          if (details.reviews && details.reviews.length > 0) {
            generateAllReviewsSummary(details.reviews);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantDetails();
  }, [id, fetchRestaurantDetails, reviewSort]);

  // Regenerate summary when language changes
  useEffect(() => {
    if (restaurant?.reviews && restaurant.reviews.length > 0) {
      generateAllReviewsSummary(restaurant.reviews);
      // Clear existing review summaries to regenerate them in the new language
      setReviewSummaries({});
    }
  }, [language, restaurant?.reviews]);

  // Reset review summaries when language changes
  useEffect(() => {
    setReviewSummaries({});
  }, [language]);

  // Update sortedReviews whenever restaurant data or sort option changes
  useEffect(() => {
    updateSortedReviews();
  }, [restaurant?.reviews, reviewSort, updateSortedReviews]);

  // Generate review summaries for sorted reviews
  useEffect(() => {
    if (sortedReviews.length > 0) {
      console.log("Generating summaries for", sortedReviews.length, "sorted reviews");
      sortedReviews.forEach((review, index) => {
        getReviewSummary(index, review.text);
      });
    }
  }, [sortedReviews, language]);

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

  const {
    name,
    vicinity,
    rating,
    user_ratings_total,
    price_level,
    opening_hours,
    distance,
    duration,
  } = restaurant;
  
  const priceDisplay = price_level ? '$'.repeat(price_level) : 'Unknown price';
  const priceClass = price_level ? `price-level-${price_level}` : '';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locationName={name} />
      
      <main className="pb-16">
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
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${restaurant.place_id || restaurant.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-food-red hover:text-food-orange flex items-center transition-colors"
          >
            {t('view_on_google_maps')} <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        
        {(categorySummary || isGeneratingMainSummary) && (
          <div className="p-4 bg-white mt-2 rounded-lg shadow-sm mx-4">
            <h2 className="text-lg font-semibold mb-3">{t('what_people_say')}</h2>
            
            {isGeneratingMainSummary ? (
              <div className="flex items-center mb-4">
                <LoadingSpinner size="small" />
                <p className="ml-2 text-muted-foreground">{t('generating_summary')}</p>
              </div>
            ) : categorySummary && (
              <>
                {/* No general summary to avoid conflicting with bullet points */}
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Utensils className="w-5 h-5 text-food-red mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">{t('cuisine')}:</span> {categorySummary.cuisine}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Music className="w-5 h-5 text-food-red mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">{t('atmosphere')}:</span> {categorySummary.atmosphere}
                    </div>
                  </li>
                  <li className="flex items-start">
                    <User className="w-5 h-5 text-food-red mr-2 mt-0.5" />
                    <div>
                      <span className="font-medium">{t('service')}:</span> {categorySummary.service}
                    </div>
                  </li>
                </ul>
              </>
            )}
          </div>
        )}
        
        {restaurant?.reviews && restaurant.reviews.length > 0 && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">{t('reviews')}</h2>
              
              <div className="relative">
                {isLoadingNewReviews && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    <LoadingSpinner size="small" />
                  </div>
                )}
                <Select
                  value={reviewSort}
                  onValueChange={handleSortChange}
                  disabled={isLoadingNewReviews}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('sort_reviews_by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">{t('most_recent')}</SelectItem>
                    <SelectItem value="helpful">{t('most_helpful')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                          className={`w-5 h-5 ${i < review.rating ? 'text-food-yellow' : 'text-gray-300'}`}
                          fill={i < review.rating ? 'gold' : 'none'}
                          strokeWidth={0.5}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    {reviewSummaries[index] ? (
                      reviewSummaries[index]
                    ) : (
                      <>
                        <span className="text-xs text-muted-foreground">{t('generating_ai_summary')}</span>
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
                      <span>{t('helpful')}</span>
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
