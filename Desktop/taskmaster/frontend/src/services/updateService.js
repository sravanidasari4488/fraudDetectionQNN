import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const STORAGE_KEY_LAST_CHECKED_VERSION = 'lastCheckedAppVersion';
const STORAGE_KEY_UPDATE_DISMISSED = 'updateDismissedForVersion';

/**
 * Get the current app version from app.config.js
 */
export const getCurrentAppVersion = () => {
  return Constants.expoConfig?.version || '1.0.0';
};

/**
 * Compare two version strings (e.g., "1.0.0" vs "1.0.1")
 * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
const compareVersions = (version1, version2) => {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
};

/**
 * Get API base URL from environment variables
 */
const getApiBaseURL = () => {
  let apiUrl = Constants.expoConfig?.extra?.expoPublicApiUrl;
  
  if (!apiUrl) {
    console.warn('API URL not configured');
    return '';
  }
  
  // Remove trailing slash if present
  apiUrl = apiUrl.replace(/\/+$/, '');
  
  // Only replace localhost in development mode
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

/**
 * Check if an update is available
 * Returns: { updateAvailable: boolean, latestVersion: string }
 */
export const checkForUpdate = async () => {
  try {
    const currentVersion = getCurrentAppVersion();
    const baseURL = getApiBaseURL();
    
    if (!baseURL) {
      console.log('API URL not configured, skipping update check');
      return { updateAvailable: false, latestVersion: currentVersion };
    }
    
    // Get latest version from backend
    const response = await fetch(`${baseURL}/app-version`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log('Failed to check for updates');
      return { updateAvailable: false, latestVersion: currentVersion };
    }
    
    const data = await response.json();
    
    if (!data || !data.success) {
      console.log('Failed to check for updates');
      return { updateAvailable: false, latestVersion: currentVersion };
    }
    
    const latestVersion = data.data?.version || currentVersion;
    
    // Compare versions
    const comparison = compareVersions(currentVersion, latestVersion);
    const updateAvailable = comparison < 0; // Current version is less than latest
    
    return {
      updateAvailable,
      latestVersion,
      currentVersion
    };
  } catch (error) {
    console.error('Error checking for update:', error);
    return { updateAvailable: false, latestVersion: getCurrentAppVersion() };
  }
};

/**
 * Check if update popup should be shown
 * This prevents showing the popup if:
 * 1. User is already on the latest version
 * 
 * Note: We show the popup every time the app opens if an update is available,
 * regardless of previous dismissals, to encourage users to update.
 */
export const shouldShowUpdatePopup = async (latestVersion) => {
  try {
    const currentVersion = getCurrentAppVersion();
    
    // If user is on latest version, don't show popup
    if (currentVersion === latestVersion) {
      return false;
    }
    
    // Always show popup if update is available (user can dismiss temporarily)
    return true;
  } catch (error) {
    console.error('Error checking if should show update popup:', error);
    return true; // Default to showing if there's an error
  }
};

/**
 * Mark that user has dismissed the update for a specific version
 */
export const markUpdateDismissed = async (version) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_UPDATE_DISMISSED, version);
  } catch (error) {
    console.error('Error marking update as dismissed:', error);
  }
};

/**
 * Clear dismissed update flag (useful when user updates the app)
 */
export const clearDismissedUpdate = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY_UPDATE_DISMISSED);
    await AsyncStorage.setItem(STORAGE_KEY_LAST_CHECKED_VERSION, getCurrentAppVersion());
  } catch (error) {
    console.error('Error clearing dismissed update:', error);
  }
};

