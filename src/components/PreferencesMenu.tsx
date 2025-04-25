
import React from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { Settings } from 'lucide-react';

export interface DiningPreferences {
  budget: number[];
  maxDistance: number[];
  mealType: 'main' | 'drinking';
}

interface PreferencesMenuProps {
  initialPreferences: DiningPreferences;
  onPreferencesChange: (preferences: DiningPreferences) => void;
}

const PreferencesMenu: React.FC<PreferencesMenuProps> = ({ 
  initialPreferences, 
  onPreferencesChange 
}) => {
  const form = useForm<DiningPreferences>({
    defaultValues: initialPreferences,
  });

  const handleSubmit = (data: DiningPreferences) => {
    onPreferencesChange(data);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Preferences</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-4 bg-white" align="end">
        <DropdownMenuLabel className="font-bold">Dining Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <Form {...form}>
          <form onChange={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex justify-between">
                    <span>Budget Range</span>
                    <span>${field.value[0]} - ${field.value[1]}</span>
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
                    <span>{field.value[0]} min</span>
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
                <FormItem className="space-y-2">
                  <FormLabel>Meal Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="main" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Main Meal
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="drinking" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Drinks (Nijikai)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PreferencesMenu;
