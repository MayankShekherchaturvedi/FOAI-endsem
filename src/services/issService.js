import axios from 'axios';
import { calculateSpeed } from '../utils/haversine';

const ISS_NOW_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const ASTROS_URL = 'https://www.howmanypeopleareinspacerightnow.com/peopleinspace.json';
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';

let lastPosition = null;
let lastTimestamp = null;

export const fetchISSPosition = async () => {
  try {
    const response = await axios.get(ISS_NOW_URL);
    // wheretheiss API returns the object directly
    if (!response.data || !response.data.latitude) {
      throw new Error('Failed to fetch ISS position');
    }

    const position = {
      lat: parseFloat(response.data.latitude),
      lng: parseFloat(response.data.longitude),
      timestamp: response.data.timestamp * 1000 // Convert to ms
    };

    let speed = 0;
    if (lastPosition && lastTimestamp) {
      speed = calculateSpeed(
        lastPosition.lat,
        lastPosition.lng,
        position.lat,
        position.lng,
        position.timestamp - lastTimestamp
      );
    } else {
      // Use the provided velocity if available, otherwise approx
      speed = response.data.velocity ? response.data.velocity : 27580; 
    }

    lastPosition = position;
    lastTimestamp = position.timestamp;

    return { ...position, speed };
  } catch (error) {
    console.error('Error fetching ISS position:', error);
    throw error;
  }
};

export const fetchAstros = async () => {
  try {
    const response = await axios.get(ASTROS_URL);
    // howmanypeopleareinspacerightnow API
    if (!response.data || typeof response.data.number === 'undefined') {
      throw new Error('Failed to fetch astronauts');
    }
    return {
      number: response.data.number,
      people: response.data.people
    };
  } catch (error) {
    console.error('Error fetching astronauts:', error);
    throw error;
  }
};

export const fetchLocationName = async (lat, lng) => {
  try {
    const response = await axios.get(GEOCODE_URL, {
      params: {
        format: 'json',
        lat,
        lon: lng,
        zoom: 10
      }
    });
    
    if (response.data && response.data.error) {
       return 'Ocean / Uncharted Region';
    }

    const address = response.data.address;
    if (address) {
      return address.city || address.town || address.village || address.state || address.country || 'Ocean / Uncharted Region';
    }
    return 'Ocean / Uncharted Region';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Ocean / Uncharted Region';
  }
};
