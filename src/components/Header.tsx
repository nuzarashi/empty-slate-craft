
import React from 'react';
import { MapPin, Utensils } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  locationName?: string;
}

const Header: React.FC<HeaderProps> = ({ locationName = "your area" }) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md shadow-sm py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-food-orange p-2 rounded-full">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-food-dark md:text-2xl">MunchMap</h1>
        </div>
        
        {!isMobile && locationName && (
          <div className="flex items-center text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">Finding food in {locationName}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
