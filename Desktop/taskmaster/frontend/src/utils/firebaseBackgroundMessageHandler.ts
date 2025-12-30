/**
 * Background Message Handler for Firebase Cloud Messaging
 * 
 * This file handles notifications when the app is in the background.
 * React Native Firebase requires this to be registered separately.
 * 
 * IMPORTANT: This file must be imported/registered at the app entry point
 * before the app fully initializes.
 */

import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// Register background handler
// This function is called when app is in background and receives a notification
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification received:', remoteMessage);
  
  // Background notifications are automatically displayed in the notification tray
  // You can add custom logic here if needed, such as:
  // - Updating local storage
  // - Queuing notifications for when app opens
  // - Scheduling local notifications
  
  if (remoteMessage.data) {
    console.log('Background notification data:', remoteMessage.data);
  }
  
  if (remoteMessage.notification) {
    console.log('Background notification:', remoteMessage.notification.title, remoteMessage.notification.body);
  }
});

// Only register on Android
if (Platform.OS === 'android') {
  console.log('Background message handler registered for Android');
}

