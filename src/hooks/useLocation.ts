
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import type { Location } from '../types';

// Fixed fallback coordinates for Iwatsuki, Saitama City, Japan
const IWATSUKI_COORDINATES: Location = {
  lat: 35.9506, 
  lng: 139.6917
};

const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported, using fallback location");
      setLocation(IWATSUKI_COORDINATES);
      setLoading(false);
      toast.info('Using Iwatsuki, Saitama City as your location');
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
      console.log("Geolocation permission denied, using fallback location");
      setError('Using default location for Iwatsuki, Saitama City');
      setLocation(IWATSUKI_COORDINATES);
      setLoading(false);
      toast.info('Using Iwatsuki, Saitama City as your location');
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    // Set a backup timeout to use fallback location if geolocation takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Geolocation timeout, using fallback location");
        setLocation(IWATSUKI_COORDINATES);
        setLoading(false);
        toast.info('Using Iwatsuki, Saitama City as your location');
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [loading]);

  return { location, loading, error };
};

export default useLocation;
