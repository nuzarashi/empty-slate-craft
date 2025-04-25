
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Restaurant, FilterOptions, MealType } from '../types';

const mealTypeKeywords: Record<MealType, string[]> = {
  main: ['restaurant', 'food', 'meal', 'dinner', 'lunch'],
  drinking: ['bar', 'pub', 'izakaya', 'tavern', 'brewery', 'lounge', 'night_club']
};

// Define a threshold for "few" results when drinking filter is active
const MIN_DRINKING_RESULTS_THRESHOLD = 5; // Adjust if needed

const useRestaurants = (
    restaurants: Restaurant[],
    hasMorePages: boolean, // Flag indicating if more pages *can* be fetched
    loadMoreCallback: () => void, // Callback to trigger loading more
    isLoading: boolean // Loading state flag from parent hook
) => {
  const [filters, setFilters] = useState<FilterOptions>({
    mealType: 'main',
    priceLevel: [1, 2, 3, 4],
    sortBy: 'distance',
    open: false,
    minRating: 0
  });

  const [needsMoreDrinkingResults, setNeedsMoreDrinkingResults] = useState(false);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('diningPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        
        // Set mealType from preferences
        if (preferences.mealType) {
          setFilters(prev => ({
            ...prev,
            mealType: preferences.mealType
          }));
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
    // Perform initial filtering based on current filters and preferences
    const initialFilter = restaurants.filter(restaurant => {
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

      // Filter by meal type
      if (filters.mealType === 'drinking') {
        if (!restaurant.isDrinking) {
          return false; // Must be flagged as drinking
        }
      } else if (filters.mealType === 'main' && restaurant.isDrinking) {
         // If looking for 'main' but it's a drinking place, check if it also serves food
         const hasMainFoodType = restaurant.types.some(type => mealTypeKeywords.main.includes(type));
         if (!hasMainFoodType) {
             return false;
         }
      }

      return true;
    });

    // Check if we need more results specifically for the drinking filter
    const isDrinkingFilterActive = filters.mealType === 'drinking';
    const currentDrinkingCount = initialFilter.length; // Count *after* filtering
    const canLoadMore = hasMorePages;

    // Set the flag if drinking filter is on, results are few, and more pages exist & not currently loading
    setNeedsMoreDrinkingResults(
        isDrinkingFilterActive &&
        currentDrinkingCount < MIN_DRINKING_RESULTS_THRESHOLD &&
        canLoadMore &&
        !isLoading // Prevent triggering if already loading
    );

    // Finally, sort the filtered results
    return initialFilter.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0); // Handle potential undefined rating
        case 'price-asc':
          return (a.price_level || 5) - (b.price_level || 5); // Treat undefined price as highest
        case 'price-desc':
          return (b.price_level || 0) - (a.price_level || 0); // Treat undefined price as lowest
        case 'distance':
        default:
          return (a.distance ?? Infinity) - (b.distance ?? Infinity); // Handle potential undefined distance
      }
    });
  }, [restaurants, filters, hasMorePages, isLoading]); // Include isLoading dependency

  // Effect to automatically load more if needed for drinking results
  useEffect(() => {
    // Only trigger loadMore if the flag is true AND we are not currently loading
    if (needsMoreDrinkingResults && !isLoading) {
      console.log(`Filter requires more drinking results (${filteredRestaurants.length}/${MIN_DRINKING_RESULTS_THRESHOLD}), automatically loading more...`);
      loadMoreCallback();
    }
  }, [needsMoreDrinkingResults, isLoading, loadMoreCallback, filteredRestaurants.length]); // Add dependencies

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    restaurants: filteredRestaurants,
    filters,
    updateFilters
  };
};

export default useRestaurants;
