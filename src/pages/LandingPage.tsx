
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

type DietaryPreference = {
  vegan: boolean;
  vegetarian: boolean;
  glutenFree: boolean;
  lowCarb: boolean;
  noSeafood: boolean;
  noRawFood: boolean;
  halal: boolean;
};

type PreferencesValues = {
  budget: number[];
  maxDistance: number[];
  dietary: DietaryPreference;
};

const dietaryOptions = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'glutenFree', label: 'Gluten Free' },
  { id: 'lowCarb', label: 'Low Carb' },
  { id: 'noSeafood', label: 'No Seafood' },
  { id: 'noRawFood', label: 'No Raw Food' },
  { id: 'halal', label: 'Halal' },
] as const;

const LandingPage = () => {
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
    // This data would be passed to the restaurants page
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-food-cream to-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
        <div className="max-w-md w-full space-y-6 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold font-display text-food-dark">What to Eat</h1>
          <p className="text-food-dark/80">
            Discover delicious restaurants nearby based on your preferences and location.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <span>Budget Range</span>
                      <span className="font-medium">${field.value[0]} - ${field.value[1]}</span>
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
                      <span>Max Walking Distance</span>
                      <span className="font-medium">{field.value[0]} min</span>
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
                <FormLabel>Dietary Preferences</FormLabel>
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
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <Link to="/restaurants" className="w-full">
                <Button 
                  type="submit"
                  className="w-full bg-food-orange hover:bg-food-red text-white rounded-full flex items-center justify-center gap-2"
                >
                  Find Restaurants <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </form>
          </Form>
          
          <p className="text-xs text-muted-foreground">
            This app will request your location to find nearby restaurants
          </p>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
