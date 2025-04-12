
export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  place_id?: string; // Added place_id for compatibility with Google API
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number; // 1-4 representing $ to $$$$
  photos?: {
    photo_reference: string;
    width: number;
    height: number;
  }[];
  geometry: {
    location: Location;
  };
  opening_hours?: {
    open_now?: boolean;
  };
  types: string[];
  distance?: number; // Walking distance in meters (added by our app)
  duration?: number; // Walking duration in seconds (added by our app)
  reviews?: Review[];
  reviewSummary?: string; // AI-generated summary (added by our app)
}

export interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export type MealType = 'main' | 'drinking';
export type DietaryRestriction = 'none' | 'vegetarian' | 'vegan' | 'gluten-free' | 'halal';
export type SortOption = 'distance' | 'rating' | 'price-asc' | 'price-desc';

export interface FilterOptions {
  mealType: MealType;
  dietary: DietaryRestriction;
  priceLevel: number[]; // Array of price levels (1-4)
  sortBy: SortOption;
  open: boolean; // Only show open restaurants
  minRating: number; // Minimum star rating (1-5)
}
