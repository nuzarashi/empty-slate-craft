
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoCarouselProps {
  photoUrls: string[];
  restaurantName: string;
}

const PhotoCarousel = ({ photoUrls, restaurantName }: PhotoCarouselProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset current index when photo URLs change
    setCurrentPhotoIndex(0);
    setIsLoaded(false);
  }, [photoUrls]);

  // Ensure we have valid photo URLs
  const validPhotoUrls = photoUrls.filter(url => url && url.length > 0);

  const nextPhoto = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % validPhotoUrls.length);
  };

  const prevPhoto = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? validPhotoUrls.length - 1 : prevIndex - 1
    );
  };

  const goToPhoto = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentPhotoIndex(index);
  };

  const handleImageLoaded = () => {
    setIsLoaded(true);
  };

  // Fallback if no photos
  if (validPhotoUrls.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">{restaurantName}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="animate-pulse w-8 h-8 rounded-full bg-gray-300"></div>
        </div>
      )}
      
      <img 
        src={validPhotoUrls[currentPhotoIndex]} 
        alt={`${restaurantName} - photo ${currentPhotoIndex+1}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleImageLoaded}
        onError={() => console.error(`Failed to load image: ${validPhotoUrls[currentPhotoIndex]}`)}
      />
        
      {validPhotoUrls.length > 1 && (
        <>
          <button 
            onClick={prevPhoto} 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors z-10"
            aria-label="Previous photo"
            type="button"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={nextPhoto}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors z-10"
            aria-label="Next photo"
            type="button"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1 z-10">
            {validPhotoUrls.map((_, index) => (
              <button 
                key={index} 
                className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                aria-label={`Go to photo ${index+1}`}
                onClick={(e) => goToPhoto(index, e)}
                type="button"
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoCarousel;
