
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Restaurant, FilterOptions, MealType, DietaryRestriction, DietaryPreference } from '../types';

const mealTypeKeywords: Record<MealType, string[]> = {
  main: ['restaurant', 'food', 'meal', 'dinner', 'lunch'],
  drinking: ['bar', 'pub', 'izakaya', 'tavern', 'brewery', 'lounge']
};

const dietaryKeywords: Record<DietaryRestriction, string[]> = {
  none: [],
  vegetarian: ['vegetarian', 'veg'],
  vegan: ['vegan'],
  'gluten-free': ['gluten-free', 'gluten free', 'gf'],
  halal: ['halal']
};

const useRestaurants = (restaurants: Restaurant[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    mealType: 'main',
    dietary: 'none',
    priceLevel: [1, 2, 3, 4],
    sortBy: 'distance',
    open: false,
    minRating: 0
  });
  
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference | null>(null);

  // Load saved dietary preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('diningPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.dietary) {
          setDietaryPreferences(preferences.dietary);
        }
        
        // Also update price levels based on budget
        if (preferences.budget && Array.isArray(preferences.budget) && preferences.budget.length === 2) {
          const [min, max] = preferences.budget;
          const priceLevels = Array.from({ length: max - min + 1 }, (_, i) => min + i);
          setFilters(prev => ({
            ...prev,
            priceLevel: priceLevels
          }));
        }
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
      }
    }
  }, []);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      // Filter by price level
      if (restaurant.price_level && !filters.priceLevel.includes(restaurant.price_level)) {
        return false;
      }

      // Filter by open status if requested
      if (filters.open && restaurant.opening_hours && !restaurant.opening_hours.open_now) {
        return false;
      }

      // Filter by rating
      if (restaurant.rating < filters.minRating) {
        return false;
      }

      // Filter by meal type (checking the types and name for keywords)
      if (filters.mealType !== 'main') {
        const mealKeywords = mealTypeKeywords[filters.mealType];
        const matchesMealType = restaurant.types.some(type => 
          mealKeywords.includes(type)
        ) || mealKeywords.some(keyword => 
          restaurant.name.toLowerCase().includes(keyword)
        );
        
        if (!matchesMealType) {
          return false;
        }
      }

      // Filter by dietary restrictions from the filter menu
      if (filters.dietary !== 'none') {
        const dietaryKeywordList = dietaryKeywords[filters.dietary];
        const matchesDietary = restaurant.types.some(type => 
          dietaryKeywordList.includes(type)
        ) || dietaryKeywordList.some(keyword => 
          restaurant.name.toLowerCase().includes(keyword)
        );
        
        // Skip restaurants that don't match dietary requirements
        if (!matchesDietary) {
          return false;
        }
      }
      
      // Filter by dietary preferences from preferences menu
      if (dietaryPreferences) {
        const hasRequiredDietary = Object.entries(dietaryPreferences).some(([key, isRequired]) => {
          if (isRequired) {
            const prefKey = key as keyof DietaryPreference;
            return restaurant.dietaryPreferences && restaurant.dietaryPreferences[prefKey];
          }
          return false;
        });
        
        // If we have dietary preferences set, only show restaurants that match at least one
        const hasDietaryPreferences = Object.values(dietaryPreferences).some(value => value);
        if (hasDietaryPreferences && !hasRequiredDietary) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-asc':
          return (a.price_level || 0) - (b.price_level || 0);
        case 'price-desc':
          return (b.price_level || 0) - (a.price_level || 0);
        case 'distance':
        default:
          return (a.distance || Infinity) - (b.distance || Infinity);
      }
    });
  }, [restaurants, filters, dietaryPreferences]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    restaurants: filteredRestaurants,
    filters,
    updateFilters,
    dietaryPreferences,
    setDietaryPreferences
  };
};

export default useRestaurants;
