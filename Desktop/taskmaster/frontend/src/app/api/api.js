import axios from "axios";
import Constants from 'expo-constants';
import { supabase } from "../../data/supabaseClient";
import { Platform } from 'react-native';

// Get API URL - use local IP for Android development, production URL for production
const getApiBaseURL = () => {
  let apiUrl = Constants.expoConfig?.extra?.expoPublicApiUrl;
  
  if (!apiUrl) {
    console.warn('API URL not configured');
    return '';
  }
  
  // Remove trailing slash if present
  apiUrl = apiUrl.replace(/\/+$/, '');
  
  // Only replace localhost in development mode
  // In production, apiUrl should be your production domain (e.g., https://api.yourapp.com)
  const isDevelopment = apiUrl.includes('localhost') || apiUrl.includes('192.168.');
  
  if (isDevelopment && Platform.OS === 'android' && apiUrl.includes('localhost')) {
    // Replace localhost with your computer's IP address for local development
    // Update this IP if your computer's IP changes
    apiUrl = apiUrl.replace('localhost', '192.168.29.190');
  }
  
  // Ensure /api/v1 is included in the base URL
  if (!apiUrl.endsWith('/api/v1')) {
    apiUrl = `${apiUrl}/api/v1`;
  }
  
  return apiUrl;
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
