import { Ionicons } from '@expo/vector-icons';
import { Linking, Platform } from 'react-native';
import React from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../ui/Text';

export default function UpdateDialog({ 
  visible, 
  onClose,
  latestVersion,
  currentVersion
}) {
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const openPlayStore = async () => {
    const packageName = 'com.onlyclick.serviceprovider'; // From app.config.js
    
    try {
      let playStoreUrl;
      
      if (Platform.OS === 'android') {
        // Try to open Play Store app first
        playStoreUrl = `market://details?id=${packageName}`;
        
        try {
          await Linking.openURL(playStoreUrl);
        } catch (error) {
          // Fallback to web Play Store if app is not available
          playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
          await Linking.openURL(playStoreUrl);
        }
      } else {
        // iOS - App Store
        // For now, just show a message or handle iOS separately if needed
        console.log('iOS update not implemented yet');
      }
    } catch (error) {
      console.error('Error opening Play Store:', error);
      // Final fallback to web Play Store
      try {
        await Linking.openURL(`https://play.google.com/store/apps/details?id=${packageName}`);
      } catch (fallbackError) {
        console.error('Error opening Play Store fallback:', fallbackError);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose} // Allow back button to close (but it will show again)
    >
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View 
          style={[
            styles.alertContainer, 
            { transform: [{ scale: scaleValue }] }
          ]}
        >
          {/* Header with Icon */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: '#4ab9cf' }]}>
              <Ionicons
                name="cloud-download-outline"
                size={32}
                color="#fff"
              />
            </View>
            <Text style={styles.title}>Update Available</Text>
          </View>

          {/* Message */}
          <Text style={styles.message}>
            A new version ({latestVersion}) of TaskMaster is available. Please update to continue using the app with the latest features and improvements.
          </Text>

          {currentVersion && (
            <View style={styles.versionInfo}>
              <Text style={styles.versionText}>
                Current Version: {currentVersion}
              </Text>
              <Text style={styles.versionText}>
                Latest Version: {latestVersion}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.laterButton]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={openPlayStore}
              activeOpacity={0.8}
            >
              <Ionicons name="storefront" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.note}>
            Please update to the latest version to continue using the app. This dialog will not appear again once you update.
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  versionInfo: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  laterButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  laterButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#4ab9cf',
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

