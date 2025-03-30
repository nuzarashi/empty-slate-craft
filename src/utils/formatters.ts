
export const formatDistance = (meters: number | undefined): string => {
  if (meters === undefined) return 'Unknown distance';
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number | undefined): string => {
  if (seconds === undefined) return 'Unknown time';
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
};
