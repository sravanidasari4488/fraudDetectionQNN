import * as Location from 'expo-location';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('[locationService] Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Google Maps requests will fail.');
}

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED || status === 'granted';
}

export async function fetchCurrentPosition(options = {}) {
  const { accuracy = Location.Accuracy.Balanced, timeout = 10000 } = options;
  return Location.getCurrentPositionAsync({ accuracy, timeout });
}

export async function reverseGeocodeWithGoogle(latitude, longitude) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key missing');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();

  if (json.status !== 'OK' || !json.results?.length) {
    throw new Error(json.error_message || 'Unable to reverse geocode coordinates');
  }

  return json.results[0];
}

export async function geocodeAddressWithGoogle(address) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key missing');
  }

  if (!address || !address.trim()) {
    throw new Error('Address is required for geocoding');
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const json = await response.json();

  if (json.status !== 'OK' || !json.results?.length) {
    throw new Error(json.error_message || 'Unable to geocode address');
  }

  return json.results[0];
}

export async function fetchPlacePredictions(input, options = {}) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key missing');
  }

  if (!input || !input.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    input,
    key: GOOGLE_MAPS_API_KEY,
    sessiontoken: options.sessionToken || undefined,
    components: options.components || 'country:in',
    language: options.language || 'en',
    radius: options.radius ? String(options.radius) : undefined,
    location: options.location ? `${options.location.latitude},${options.location.longitude}` : undefined,
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`);
  const json = await res.json();

  if (json.status !== 'OK') {
    if (json.status === 'ZERO_RESULTS') return [];
    throw new Error(json.error_message || 'Failed to fetch place predictions');
  }

  return json.predictions;
}

export async function fetchPlaceDetails(placeId) {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key missing');
  }

  if (!placeId) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAPS_API_KEY,
    fields: 'formatted_address,geometry,address_component'
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${params}`);
  const json = await res.json();

  if (json.status !== 'OK') {
    throw new Error(json.error_message || 'Failed to fetch place details');
  }

  return json.result;
}

export function parseAddressComponents(addressComponents = []) {
  const component = (type) => addressComponents.find((comp) => comp.types.includes(type))?.long_name || '';

  return {
    houseNumber: `${component('street_number')} ${component('route')}`.trim(),
    district: component('sublocality_level_1') || component('sublocality') || component('administrative_area_level_2'),
    city: component('locality') || component('administrative_area_level_2') || component('administrative_area_level_1'),
    pincode: component('postal_code'),
    state: component('administrative_area_level_1'),
    country: component('country'),
  };
}

export function buildLocationObject({
  formattedAddress,
  coords,
  addressComponents,
  additionalFields = {},
}) {
  const parsed = parseAddressComponents(addressComponents);
  return {
    formattedAddress,
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null,
    houseNumber: parsed.houseNumber,
    district: parsed.district,
    city: parsed.city,
    state: parsed.state,
    country: parsed.country,
    pincode: parsed.pincode,
    additionalInfo: additionalFields.additionalInfo || '',
  };
}


