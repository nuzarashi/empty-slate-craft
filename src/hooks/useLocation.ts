
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

    // Higher accuracy options
    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    const success = (position: GeolocationPosition) => {
      console.log("Geolocation obtained:", position.coords.latitude, position.coords.longitude);
      
      // Verify coords are valid numbers
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        console.log("Invalid coordinates detected");
        setError('Invalid geolocation coordinates. Please refresh and try again.');
        setLoading(false);
        toast.error('Invalid location data received');
        return;
      }
      
      setLocation({
        lat: lat,
        lng: lng
      });
      console.log("Location set successfully to:", lat, lng);
      setLoading(false);
    };

    const error = (err: GeolocationPositionError) => {
      console.log("Geolocation error:", err.code, err.message);
      let errorMessage = 'Unable to retrieve your location.';
      
      switch(err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please allow access and refresh.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please try again later.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out. Please check your connection and try again.';
          break;
      }
      
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    };

    console.log("Requesting geolocation...");
    navigator.geolocation.getCurrentPosition(success, error, geoOptions);

    // Set a backup timeout in case geolocation takes too long
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Geolocation timeout");
        setError('Location request timed out. Please refresh and try again.');
        setLoading(false);
        toast.error('Location request timed out');
      }
    }, 20000); // Extended timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  return { location, loading, error };
};

export default useLocation;
