/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * 
 * Handles:
 * - Requesting notification permissions
 * - Getting and refreshing FCM tokens
 * - Listening for foreground notifications
 * - Handling background notifications
 * - Handling notification taps when app is killed
 * 
 * This service works with React Native Firebase for Android only.
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { getMessaging } from '../config/firebaseConfig';
import api from '../lib/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_STORAGE_KEY = '@fcm_token';
const PERMISSION_REQUESTED_KEY = '@notification_permission_requested';

/**
 * Request notification permissions for Android 13+
 * For Android 13 (API 33+), POST_NOTIFICATIONS permission is required
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    console.log('Notification permissions only needed on Android');
    return false;
  }

  try {
    // Check Android version
    const androidVersion = Platform.Version;
    
    // Android 13+ (API 33+) requires runtime permission
    if (androidVersion >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message: 'TaskMaster needs notification permission to send you important updates and job alerts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } else {
      // Android 12 and below don't require runtime permission
      console.log('Android version < 13, no runtime permission needed');
      return true;
    }
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get the current FCM token
 * This token is unique per device and app installation
 */
export const getFCMToken = async (): Promise<string | null> => {
  if (Platform.OS !== 'android') {
    console.log('FCM tokens only available on Android');
    return null;
  }

  try {
    const messagingInstance = getMessaging();
    if (!messagingInstance) {
      console.error('Firebase Messaging not initialized');
      return null;
    }

    // Request notification permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted, cannot get FCM token');
      return null;
    }

    // Get the FCM token
    const token = await messagingInstance.getToken();
    
    if (token) {
      console.log('FCM Token retrieved:', token.substring(0, 20) + '...');
      // Store token locally
      await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
      
      // Save token to backend
      await saveTokenToBackend(token);
      
      return token;
    } else {
      console.error('Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Save FCM token to backend
 * Replace the endpoint with your actual backend endpoint
 */
const saveTokenToBackend = async (token: string): Promise<void> => {
  try {
    // Save FCM token to backend
    // Endpoint: /api/v1/notifications/token (protected route)
    await api.post('/notifications/token', {
      fcmToken: token,
      platform: 'android',
      timestamp: new Date().toISOString(),
    });
    console.log('FCM token saved to backend');
  } catch (error) {
    console.error('Error saving FCM token to backend:', error);
    // Don't throw - token saving failure shouldn't break the app
  }
};

/**
 * Delete FCM token (when user logs out, etc.)
 */
export const deleteFCMToken = async (): Promise<void> => {
  try {
    const messagingInstance = getMessaging();
    if (!messagingInstance) {
      return;
    }

    await messagingInstance.deleteToken();
    await AsyncStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    console.log('FCM token deleted');
  } catch (error) {
    console.error('Error deleting FCM token:', error);
  }
};

/**
 * Refresh FCM token
 * Call this when token might have changed (e.g., app update)
 */
export const refreshFCMToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = getMessaging();
    if (!messagingInstance) {
      return null;
    }

    // Delete old token
    await messagingInstance.deleteToken();
    
    // Get new token
    return await getFCMToken();
  } catch (error) {
    console.error('Error refreshing FCM token:', error);
    return null;
  }
};

/**
 * Initialize notification listeners
 * Call this in your app's root component (e.g., _layout.tsx)
 */
export const initializeNotificationListeners = (): void => {
  if (Platform.OS !== 'android') {
    return;
  }

  const messagingInstance = getMessaging();
  if (!messagingInstance) {
    console.error('Firebase Messaging not initialized');
    return;
  }

  // Listen for foreground messages
  // This is called when app is in foreground
  const unsubscribeForeground = messagingInstance.onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);
    
    // Handle the notification here
    // You can show an in-app notification, update UI, etc.
    if (remoteMessage.notification) {
      const { title, body } = remoteMessage.notification;
      
      // Show alert or custom notification component
      Alert.alert(
        title || 'New Notification',
        body || 'You have a new notification',
        [{ text: 'OK' }]
      );
    }

    // Handle custom data
    if (remoteMessage.data) {
      console.log('Notification data:', remoteMessage.data);
      // You can navigate to specific screens based on data
      // Example: if (remoteMessage.data.type === 'job') { navigateToJobScreen(); }
    }
  });

  // Note: Background message handler is registered in firebaseBackgroundMessageHandler.ts
  // at the app entry point. This is required by React Native Firebase.

  // Handle notification taps when app is killed
  // This is called when user taps a notification and app is not running
  messagingInstance
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
        // Handle navigation or action based on notification data
        handleNotificationTap(remoteMessage);
      }
    });

  // Handle notification taps when app is in background
  messagingInstance.onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification caused app to open from background state:', remoteMessage);
    // Handle navigation or action based on notification data
    handleNotificationTap(remoteMessage);
  });

  console.log('Notification listeners initialized');

  // Return cleanup function
  return () => {
    unsubscribeForeground();
  };
};

/**
 * Handle notification tap
 * Navigate to appropriate screen based on notification data
 */
const handleNotificationTap = (remoteMessage: any): void => {
  if (remoteMessage.data) {
    const { type, id, screen } = remoteMessage.data;
    
    // Handle navigation based on notification type
    // Example:
    // if (type === 'job') {
    //   navigation.navigate('JobDetails', { jobId: id });
    // } else if (type === 'booking') {
    //   navigation.navigate('BookingDetails', { bookingId: id });
    // }
    
    console.log('Notification tap handled:', { type, id, screen });
  }
};

/**
 * Check if notification permission has been requested
 */
export const hasNotificationPermissionBeenRequested = async (): Promise<boolean> => {
  try {
    const requested = await AsyncStorage.getItem(PERMISSION_REQUESTED_KEY);
    return requested === 'true';
  } catch {
    return false;
  }
};

/**
 * Mark notification permission as requested
 */
export const markNotificationPermissionRequested = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(PERMISSION_REQUESTED_KEY, 'true');
  } catch (error) {
    console.error('Error marking permission as requested:', error);
  }
};

/**
 * Initialize FCM service
 * Call this once when app starts
 */
export const initializeFCM = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    // Check if Firebase is available
    // React Native Firebase auto-initializes from google-services.json
    const { initializeFirebase } = require('../config/firebaseConfig');
    const isInitialized = initializeFirebase();
    
    if (!isInitialized) {
      console.warn('Firebase not initialized - check google-services.json');
      return;
    }

    // Set up listeners first (before requesting permissions)
    initializeNotificationListeners();

    // Request permissions and get token
    const token = await getFCMToken();
    if (token) {
      console.log('FCM initialized successfully with token');
    } else {
      console.warn('FCM token not available - user may have denied permissions');
    }
  } catch (error) {
    console.error('Error initializing FCM:', error);
  }
};

export default {
  requestNotificationPermissions,
  getFCMToken,
  deleteFCMToken,
  refreshFCMToken,
  initializeNotificationListeners,
  initializeFCM,
  hasNotificationPermissionBeenRequested,
  markNotificationPermissionRequested,
};

