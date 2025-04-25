
export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  place_id?: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  price_level?: number;
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
  distance?: number;
  duration?: number;
  reviews?: Review[];
  reviewSummary?: string;
  isDrinking?: boolean;
}

export interface Review {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
}

export type MealType = 'main' | 'drinking';
export type SortOption = 'distance' | 'rating' | 'price-asc' | 'price-desc';

export interface FilterOptions {
  mealType: MealType;
  priceLevel: number[];
  sortBy: SortOption;
  open: boolean;
  minRating: number;
}

export interface CategorySummary {
  summary: string;
  cuisine: string;
  atmosphere: string;
  service: string;
}
