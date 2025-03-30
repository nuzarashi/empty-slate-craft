
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
      <div className={`animate-spin rounded-full bg-gradient-to-tr from-food-red via-food-orange to-food-yellow ${sizeClasses[size]}`}>
        <div className="h-full w-full rounded-full bg-gray-50 bg-opacity-80" style={{ margin: '2px' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
