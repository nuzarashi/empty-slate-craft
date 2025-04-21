
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="min-h-screen bg-gradient-to-b from-food-cream to-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-food-dark mb-4">
              {t('what_to_eat')}
            </h1>
            <p className="text-lg text-food-dark/80 max-w-md mx-auto">
              {t('discover_restaurants')}
            </p>
          </div>
          
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-display text-center text-food-dark">
                {t('your_preferences')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="flex justify-between text-food-dark">
                          <span className="font-medium">{t('budget_range')}</span>
                          <span className="font-semibold text-food-orange">{minBudgetDisplay} - {maxBudgetDisplay}</span>
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
                      <FormItem className="space-y-3">
                        <FormLabel className="flex justify-between text-food-dark">
                          <span className="font-medium">{t('max_walking_distance')}</span>
                          <span className="font-semibold text-food-orange">{field.value[0]} {t('min')}</span>
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
                    <FormLabel className="font-medium text-food-dark">{t('dietary_preferences')}</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {dietaryOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name={`dietary.${option.id}` as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0 bg-white/50 p-3 rounded-lg hover:bg-white/80 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-food-orange data-[state=checked]:border-food-orange"
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-medium cursor-pointer text-food-dark">
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
                    className="w-full bg-food-orange hover:bg-food-red text-white rounded-full py-6 flex items-center justify-center gap-2 mt-8 shadow-md"
                    disabled={isSubmitting}
                  >
                    <Link to="/restaurants" className="w-full flex items-center justify-center gap-2">
                      {t('find_restaurants')} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </form>
              </Form>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                {t('location_permission')}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
