
import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DietaryPreference } from '@/types';
import { toast } from 'sonner';
import { LanguageContext } from '@/components/LanguageSelector';

type PreferencesValues = {
  budget: number[];
  maxDistance: number[];
  dietary: DietaryPreference;
};

const dietaryOptions = [
  { id: 'vegan', label: 'vegan' },
  { id: 'vegetarian', label: 'vegetarian' },
  { id: 'glutenFree', label: 'gluten_free' },
  { id: 'lowCarb', label: 'low_carb' },
  { id: 'noSeafood', label: 'no_seafood' },
  { id: 'noRawFood', label: 'no_raw_food' },
  { id: 'halal', label: 'halal' },
] as const;

const LandingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useContext(LanguageContext);
  
  const form = useForm<PreferencesValues>({
    defaultValues: {
      budget: [1, 4], // Min and max budget
      maxDistance: [15], // Max walking distance in minutes
      dietary: {
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        lowCarb: false,
        noSeafood: false,
        noRawFood: false,
        halal: false,
      }
    }
  });

  const watchBudget = form.watch('budget');
  const watchMaxDistance = form.watch('maxDistance');

  const handleSubmit = (data: PreferencesValues) => {
    console.log('Preferences:', data);
    setIsSubmitting(true);
    
    // Save preferences to localStorage to be accessed on restaurants page
    localStorage.setItem('diningPreferences', JSON.stringify(data));
    toast.success(t('preferences_saved'));
    
    // Redirect happens via Link component
    setIsSubmitting(false);
  };

  // Display budget as $ symbols
  const minBudgetDisplay = Array(watchBudget[0]).fill('$').join('');
  const maxBudgetDisplay = Array(watchBudget[1]).fill('$').join('');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-food-cream to-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="max-w-md w-full space-y-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold font-display text-food-dark">{t('what_to_eat')}</h1>
          <p className="text-food-dark/80">
            {t('discover_restaurants')}
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <span>{t('budget_range')}</span>
                      <span className="font-medium">{minBudgetDisplay} - {maxBudgetDisplay}</span>
                    </FormLabel>
                    <FormControl>
                      <Slider 
                        min={1} 
                        max={4} 
                        step={1} 
                        value={field.value} 
                        onValueChange={field.onChange} 
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxDistance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <span>{t('max_walking_distance')}</span>
                      <span className="font-medium">{field.value[0]} {t('min')}</span>
                    </FormLabel>
                    <FormControl>
                      <Slider 
                        min={5} 
                        max={30} 
                        step={5} 
                        value={field.value} 
                        onValueChange={field.onChange} 
                        className="py-4"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="space-y-3">
                <FormLabel>{t('dietary_preferences')}</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name={`dietary.${option.id}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {t(option.label)}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-food-orange hover:bg-food-red text-white rounded-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <Link to="/restaurants" className="w-full flex items-center justify-center gap-2">
                  {t('find_restaurants')} <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </form>
          </Form>
          
          <p className="text-xs text-muted-foreground">
            {t('location_permission')}
          </p>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
