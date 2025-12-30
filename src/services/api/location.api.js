import api from '../../app/api/api.js';

export const saveUserLocation = async ({ latitude, longitude, formattedAddress }) => {
  const payload = {
    latitude,
    longitude,
    formatted_address: formattedAddress,
  };

  const response = await api.post('/api/v1/location/update', payload);
  return response.data;
};




