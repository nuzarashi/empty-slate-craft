
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Location } from '../types';

const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const success = (position: GeolocationPosition) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      setLoading(false);
    };

    const error = () => {
      setError('Unable to retrieve your location');
      setLoading(false);
      toast.error('Unable to retrieve your location. Please allow location access.');
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, []);

  return { location, loading, error };
};

export default useLocation;
