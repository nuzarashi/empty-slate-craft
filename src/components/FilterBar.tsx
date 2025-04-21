
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
import { useContext } from 'react';
import { LanguageContext } from './LanguageSelector';
import type { FilterOptions, MealType, DietaryRestriction, SortOption, DietaryPreference } from '../types';

interface FilterBarProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: FilterOptions;
  onFilterChange: (newFilters: Partial<FilterOptions>) => void;
  onPreferencesChange: (newPreferences: { dietary: DietaryPreference, budget: number[] }) => void;
  currentDietaryPreferences: DietaryPreference;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  isOpen, 
  onClose, 
  currentFilters, 
  onFilterChange, 
  onPreferencesChange,
  currentDietaryPreferences
}) => {
  const { t } = useContext(LanguageContext);
  
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
    updateFilters({ priceLevel: Array.from({ length: value[1] - value[0] + 1 }, (_, i) => i + value[0]) });
  };

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    onFilterChange(newFilters);
  };

  const minPrice = Math.min(...currentFilters.priceLevel);
  const maxPrice = Math.max(...currentFilters.priceLevel);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex justify-between items-center border-b">
        <h3 className="font-semibold">{t('filters')}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
      
      <div className="bg-white flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('meal_type')}</h4>
            <div className="flex gap-2">
              <Button 
                variant={currentFilters.mealType === 'main' ? "default" : "outline"} 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleMealTypeChange('main')}
              >
                <Coffee className="w-4 h-4" />
                <span>{t('main_meal')}</span>
              </Button>
              <Button 
                variant={currentFilters.mealType === 'drinking' ? "default" : "outline"} 
                size="sm" 
                className="flex-1 gap-1"
                onClick={() => handleMealTypeChange('drinking')}
              >
                <Beer className="w-4 h-4" />
                <span>{t('drinks')}</span>
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('dietary')}</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                {value: 'none', label: 'none'},
                {value: 'vegetarian', label: 'vegetarian'},
                {value: 'vegan', label: 'vegan'},
                {value: 'gluten-free', label: 'gluten_free'},
                {value: 'halal', label: 'halal'}
              ].map((item) => (
                <Button 
                  key={item.value}
                  variant={currentFilters.dietary === item.value ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleDietaryChange(item.value as DietaryRestriction)}
                  className="justify-start"
                >
                  {item.value === 'none' ? null : <Leaf className="w-4 h-4 mr-1" />}
                  {t(item.label)}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('sort_by')}</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant={currentFilters.sortBy === 'distance' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange('distance')}
                className="justify-start"
              >
                <MapPin className="w-4 h-4 mr-1" />
                {t('distance')}
              </Button>
              <Button 
                variant={currentFilters.sortBy === 'rating' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange('rating')}
                className="justify-start"
              >
                <Star className="w-4 h-4 mr-1" />
                {t('rating')}
              </Button>
              <Button 
                variant={currentFilters.sortBy === 'price-asc' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange('price-asc')}
                className="justify-start col-span-2"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {t('price_low_to_high')}
              </Button>
              <Button 
                variant={currentFilters.sortBy === 'price-desc' ? "default" : "outline"} 
                size="sm"
                onClick={() => handleSortChange('price-desc')}
                className="justify-start col-span-2"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                {t('price_high_to_low')}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">{t('open_now')}</h4>
              <Switch
                checked={currentFilters.open}
                onCheckedChange={(checked) => updateFilters({ open: checked })}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium">{t('min_rating')}</h4>
              <span className="text-sm font-medium">{currentFilters.minRating}+ ⭐</span>
            </div>
            <Slider
              value={[currentFilters.minRating]}
              min={0}
              max={5}
              step={0.5}
              onValueChange={handleMinRatingChange}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <h4 className="text-sm font-medium">{t('price_level')}</h4>
              <span className="text-sm font-medium">
                {Array(minPrice).fill('$').join('')} - {Array(maxPrice).fill('$').join('')}
              </span>
            </div>
            <Slider
              value={[minPrice, maxPrice]}
              min={1}
              max={4}
              step={1}
              onValueChange={handlePriceChange}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 border-t">
        <Button onClick={onClose} className="w-full">
          {t('apply_filters')}
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
