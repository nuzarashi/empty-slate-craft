
import React from 'react';
import { MapPin, Utensils } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  locationName?: string;
}

const Header: React.FC<HeaderProps> = ({ locationName = "your area" }) => {
  const isMobile = useIsMobile();
  
  return (
    <header className="sticky top-0 z-10 bg-white border-b py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-food-red to-food-orange p-2 rounded-full">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold font-display">MunchMap</h1>
        </div>
        
        {locationName && (
          <div className="flex items-center text-sm">
            <MapPin className="w-4 h-4 mr-1 text-food-orange" />
            <span className={isMobile ? "max-w-[150px] truncate" : ""}>
              {locationName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
