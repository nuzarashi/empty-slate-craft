
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Filter, 
  Coffee, 
  Beer, 
  SortAsc, 
  MapPin, 
  Star, 
  DollarSign, 
  Clock,
  Leaf
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

import type { FilterOptions, MealType, DietaryRestriction, SortOption } from '../types';

interface FilterBarProps {
  filters: FilterOptions;
  updateFilters: (newFilters: Partial<FilterOptions>) => void;
  className?: string;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, updateFilters, className }) => {
  const handleMealTypeChange = (mealType: MealType) => {
    updateFilters({ mealType });
  };

  const handleDietaryChange = (dietary: DietaryRestriction) => {
    updateFilters({ dietary });
  };

  const handleSortChange = (sortBy: SortOption) => {
    updateFilters({ sortBy });
  };

  const handleMinRatingChange = (value: number[]) => {
    updateFilters({ minRating: value[0] });
  };

  const handlePriceChange = (value: number[]) => {
    // Now we're using a min and max slider for price range
    updateFilters({ priceLevel: Array.from({ length: value[1] - value[0] + 1 }, (_, i) => i + value[0]) });
  };

  // Get the min and max price for the range slider
  const minPrice = Math.min(...filters.priceLevel);
  const maxPrice = Math.max(...filters.priceLevel);
  
  return (
    <div className={cn("bg-white px-4 py-3 border-b", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* Meal Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              {filters.mealType === 'main' ? <Coffee className="w-4 h-4" /> : <Beer className="w-4 h-4" />}
              <span>{filters.mealType === 'main' ? 'Main Meal' : 'Drinking'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Meal Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleMealTypeChange('main')}>
              <Coffee className="w-4 h-4 mr-2" />
              <span>Main Meal</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMealTypeChange('drinking')}>
              <Beer className="w-4 h-4 mr-2" />
              <span>Drinking</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Dietary Restrictions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Leaf className="w-4 h-4" />
              <span>{filters.dietary === 'none' ? 'Any Diet' : filters.dietary}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Dietary Restrictions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDietaryChange('none')}>
              Any
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDietaryChange('vegetarian')}>
              Vegetarian
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDietaryChange('vegan')}>
              Vegan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDietaryChange('gluten-free')}>
              Gluten Free
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDietaryChange('halal')}>
              Halal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort By */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <SortAsc className="w-4 h-4" />
              <span>
                {filters.sortBy === 'distance' && 'Distance'}
                {filters.sortBy === 'rating' && 'Rating'}
                {filters.sortBy === 'price-asc' && 'Price: Low to High'}
                {filters.sortBy === 'price-desc' && 'Price: High to Low'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSortChange('distance')}>
              <MapPin className="w-4 h-4 mr-2" />
              Distance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('rating')}>
              <Star className="w-4 h-4 mr-2" />
              Rating
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('price-asc')}>
              <DollarSign className="w-4 h-4 mr-2" />
              Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('price-desc')}>
              <DollarSign className="w-4 h-4 mr-2" />
              Price: High to Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Open Now Toggle */}
        <div className="flex items-center ml-auto space-x-2">
          <Switch
            id="open-now"
            checked={filters.open}
            onCheckedChange={(checked) => updateFilters({ open: checked })}
          />
          <Label htmlFor="open-now" className="text-sm flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Open Now
          </Label>
        </div>
      </div>
      
      <div className="mt-4 px-2">
        {/* Rating Filter */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Label className="text-sm">Minimum Rating</Label>
            <span className="text-sm font-medium">{filters.minRating}+ <Star className="inline w-4 h-4 text-food-yellow" fill="gold" strokeWidth={0.5} /></span>
          </div>
          <Slider
            defaultValue={[filters.minRating]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={handleMinRatingChange}
            className="w-full"
          />
        </div>
        
        {/* Price Range Filter - Now with Min and Max knobs */}
        <div>
          <div className="flex justify-between mb-1">
            <Label className="text-sm">Price Range</Label>
            <span className="text-sm font-medium">
              {Array(minPrice).fill('$').join('')} - {Array(maxPrice).fill('$').join('')}
            </span>
          </div>
          <Slider
            defaultValue={[minPrice, maxPrice]}
            value={[minPrice, maxPrice]}
            min={1}
            max={4}
            step={1}
            onValueChange={handlePriceChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
