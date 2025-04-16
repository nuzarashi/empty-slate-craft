
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoCarouselProps {
  photoUrls: string[];
  restaurantName: string;
}

const PhotoCarousel = ({ photoUrls, restaurantName }: PhotoCarouselProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photoUrls.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => 
      prevIndex === 0 ? photoUrls.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-64 md:h-80">
      {photoUrls.length > 0 && (
        <>
          <img 
            src={photoUrls[currentPhotoIndex]} 
            alt={`${restaurantName} - photo ${currentPhotoIndex+1}`}
            className="w-full h-full object-cover" 
          />
          
          {photoUrls.length > 1 && (
            <>
              <button 
                onClick={prevPhoto} 
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                {photoUrls.map((_, index) => (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                    aria-label={`Go to photo ${index+1}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setCurrentPhotoIndex(index)}
                  ></div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoCarousel;
