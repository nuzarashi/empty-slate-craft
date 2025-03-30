
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  maxDistance: number;
  dietary: {
    vegan: boolean;
    vegetarian: boolean;
    glutenFree: boolean;
    lowCarb: boolean;
    noSeafood: boolean;
    noRawFood: boolean;
    halal: boolean;
  };
}

interface PreferencesMenuProps {
  initialPreferences: DiningPreferences;
  onPreferencesChange: (preferences: DiningPreferences) => void;
}

const dietaryOptions = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'glutenFree', label: 'Gluten Free' },
  { id: 'lowCarb', label: 'Low Carb' },
  { id: 'noSeafood', label: 'No Seafood' },
  { id: 'noRawFood', label: 'No Raw Food' },
  { id: 'halal', label: 'Halal' },
] as const;

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
                  <FormLabel>Budget (${field.value[0]})</FormLabel>
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
                  <FormLabel>Max Walking Distance ({field.value} min)</FormLabel>
                  <FormControl>
                    <Slider 
                      min={5} 
                      max={30} 
                      step={5} 
                      value={[field.value]} 
                      onValueChange={(val) => field.onChange(val[0])} 
                      className="py-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Dietary Preferences</FormLabel>
              <div className="grid grid-cols-1 gap-2">
                {dietaryOptions.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name={`dietary.${option.id as keyof DiningPreferences['dietary']}`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
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
          </form>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PreferencesMenu;
