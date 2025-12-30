import axios from "axios";
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import supabase from "../../data/supabaseClient.js";

const fallbackBaseURL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5500' // Android emulator -> host machine
  : 'http://localhost:5500'; // iOS simulator/web

const baseURL = process.env.NEXT_PUBLIC_API_URL
  || Constants.expoConfig?.extra?.expoPublicApiUrl
  || fallbackBaseURL;

// console.log('[API] Base URL:', baseURL);
// console.log('[API] Platform:', Platform.OS);

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 second timeout
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('[API] Request:', config.method?.toUpperCase(), config.url);
  return config;
}, (error) => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', {
      message: error.message,
      code: error.code,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      fullURL: error.config?.baseURL + error.config?.url,
    });

    // Provide more helpful error messages
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.userMessage = `Cannot connect to server. Please check:\n1. Backend is running on ${baseURL}\n2. Phone and laptop are on same WiFi\n3. Firewall allows connections`;
    } else if (error.code === 'ETIMEDOUT') {
      error.userMessage = 'Request timed out. Server may be slow or unreachable.';
    } else if (error.response) {
      error.userMessage = error.response.data?.error || error.response.data?.message || 'Server error occurred';
    } else {
      error.userMessage = error.message || 'Network error occurred';
    }

    return Promise.reject(error);
  }
);

export default api;

