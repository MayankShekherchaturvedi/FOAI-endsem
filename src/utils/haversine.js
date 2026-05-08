/**
 * Calculates the great-circle distance between two points on a sphere
 * given their longitudes and latitudes.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRadian = (angle) => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);
  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  return RADIUS_OF_EARTH_IN_KM * c;
};

/**
 * Calculates speed in km/h given two positions and the time difference between them
 */
export const calculateSpeed = (lat1, lon1, lat2, lon2, timeMs) => {
  if (timeMs === 0) return 0;
  const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
  const timeHours = timeMs / (1000 * 60 * 60);
  return distanceKm / timeHours;
};
