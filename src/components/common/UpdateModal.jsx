import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../ui/Text';
import { getAndroidPackageName, getPlayStoreUrl } from '../../services/appVersionService';

export default function UpdateModal({ visible, onClose, latestVersion }) {
  const handleUpdate = async () => {
    try {
      const packageName = getAndroidPackageName();
      const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
      const marketUrl = `market://details?id=${packageName}`;
      
      // Try market:// first (opens Play Store app directly)
      const canOpenMarket = await Linking.canOpenURL(marketUrl);
      if (canOpenMarket) {
        await Linking.openURL(marketUrl);
      } else {
        // Fallback to web URL
        await Linking.openURL(playStoreUrl);
      }
    } catch (error) {
      console.error('[UpdateModal] Failed to open Play Store:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // Prevent dismissing - update is required
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-download-outline" size={64} color="#3898B3" />
          </View>

          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version {latestVersion ? `(${latestVersion})` : ''} of OnlyClick is available. Please update to continue using the app with the latest features and improvements.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdate}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.updateButtonText}>Update Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  updateButton: {
    backgroundColor: '#3898B3',
    width: '100%',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

