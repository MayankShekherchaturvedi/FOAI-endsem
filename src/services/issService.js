import axios from 'axios';
import { calculateSpeed } from '../utils/haversine';

const ISS_NOW_URL = 'http://api.open-notify.org/iss-now.json';
const ASTROS_URL = 'http://api.open-notify.org/astros.json';
const GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';

let lastPosition = null;
let lastTimestamp = null;

export const fetchISSPosition = async () => {
  try {
    const response = await axios.get(ISS_NOW_URL);
    if (response.data.message !== 'success') {
      throw new Error('Failed to fetch ISS position');
    }

    const position = {
      lat: parseFloat(response.data.iss_position.latitude),
      lng: parseFloat(response.data.iss_position.longitude),
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
      // Approximate average speed of ISS if no previous data
      speed = 27580; 
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
    if (response.data.message !== 'success') {
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
