
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };
  
  return (
    <div className="flex justify-center items-center p-4">
      <div className={`animate-spin rounded-full border-4 border-t-food-orange border-r-food-orange border-b-transparent border-l-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};

export default LoadingSpinner;
