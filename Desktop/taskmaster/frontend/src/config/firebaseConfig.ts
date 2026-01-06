/**
 * Firebase Configuration for React Native Firebase
 * 
 * This file provides Firebase Messaging utilities for Android FCM push notifications.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * STEP 1: Generate native folders (if not already done)
 *   Run: npx expo prebuild --clean
 *   This creates the android/ folder
 * 
 * STEP 2: Download google-services.json from Firebase Console
 *   - Go to Firebase Console > Project Settings > Your apps
 *   - Download google-services.json for Android app
 *   - Package name should be: com.onlyclick.serviceprovider
 * 
 * STEP 3: Place google-services.json
 *   - After running prebuild, place file at: frontend/android/app/google-services.json
 *   - Create the android/app/ folder if it doesn't exist
 * 
 * STEP 4: Build development build
 *   Run: npx expo run:android
 * 
 * IMPORTANT: 
 * - Do not commit google-services.json to version control
 * - React Native Firebase automatically initializes from google-services.json
 * - No manual initialization needed - Firebase is initialized natively
 */

import { Platform } from 'react-native';

// Dynamically import Firebase to handle cases where native module isn't available
let messaging: any = null;
try {
  messaging = require('@react-native-firebase/messaging').default;
} catch (error) {
  // Native module not available - app can still work without Firebase
  console.warn('Firebase Messaging native module not available. Push notifications will be disabled.');
}

/**
 * Initialize Firebase (for React Native Firebase)
 * 
 * Note: React Native Firebase automatically initializes from google-services.json
 * This function just checks if Firebase is available and ready to use.
 */
export const initializeFirebase = (): boolean => {
  // Only initialize on Android
  if (Platform.OS !== 'android') {
    console.log('Firebase initialization skipped - Android only');
    return false;
  }

  // Check if native module is available
  if (!messaging) {
    return false;
  }

  try {
    // Check if Firebase Messaging is available
    // React Native Firebase auto-initializes from google-services.json
    const messagingInstance = messaging();
    if (messagingInstance) {
      console.log('Firebase Messaging initialized successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    // If initialization fails, it might be because google-services.json is missing
    // or incorrectly placed. Check the error message for details.
    return false;
  }
};

/**
 * Get Firebase Messaging instance
 * Returns null if Firebase is not available or not on Android
 */
export const getMessaging = () => {
  if (Platform.OS !== 'android') {
    console.warn('Firebase Messaging only available on Android');
    return null;
  }

  if (!messaging) {
    return null;
  }

  try {
    // React Native Firebase automatically initializes from google-services.json
    return messaging();
  } catch (error) {
    console.error('Error getting Firebase Messaging instance:', error);
    return null;
  }
};

export default {
  initializeFirebase,
  getMessaging,
};

