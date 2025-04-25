
import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { LanguageContext } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PreferencesValues = {
  budget: number[];
  maxDistance: number[];
  mealType: 'main' | 'drinking';
};

const LandingPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useContext(LanguageContext);
  
  const form = useForm<PreferencesValues>({
    defaultValues: {
      budget: [1, 4], // Min and max budget
      maxDistance: [15], // Max walking distance in minutes
      mealType: 'main'
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
                  
                  <FormField
                    control={form.control}
                    name="mealType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="font-medium text-food-dark">{t('meal_type')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-white/50 p-3 rounded-lg hover:bg-white/80 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="main" className="text-food-orange" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer text-food-dark">
                                {t('main_meal')}
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0 bg-white/50 p-3 rounded-lg hover:bg-white/80 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="drinking" className="text-food-orange" />
                              </FormControl>
                              <FormLabel className="font-medium cursor-pointer text-food-dark">
                                {t('drinks')}
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
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
