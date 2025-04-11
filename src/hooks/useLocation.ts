
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Location } from '../types';

const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
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
      console.log("Geolocation permission denied");
      setError('Unable to retrieve your location. Please allow location access and refresh.');
      setLoading(false);
      toast.error('Unable to retrieve your location');
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    // Set a backup timeout in case geolocation takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Geolocation timeout");
        setError('Location request timed out. Please refresh and try again.');
        setLoading(false);
        toast.error('Location request timed out');
      }
    }, 15000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  return { location, loading, error };
};

export default useLocation;
