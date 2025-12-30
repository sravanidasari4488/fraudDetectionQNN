import { View, Text, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function DeleteAccountPage() {
  const router = useRouter();

  const handleOpenApp = () => {
    // Try to open the app, fallback to Play Store
    const appScheme = 'onlyclick://';
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.onlyclick.user';
    
    Linking.canOpenURL(appScheme).then(supported => {
      if (supported) {
        Linking.openURL(appScheme);
      } else {
        Linking.openURL(playStoreUrl);
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Delete Your Account</Text>
        
        <Text style={styles.sectionTitle}>How to Delete Your Account</Text>
        <Text style={styles.text}>
          To delete your Only Click account and all associated data, please follow these steps:
        </Text>
        
        <View style={styles.stepsContainer}>
          <Text style={styles.step}>
            1. Open the Only Click app on your device
          </Text>
          <Text style={styles.step}>
            2. Navigate to your Profile section
          </Text>
          <Text style={styles.step}>
            3. Tap on "Advanced Options"
          </Text>
          <Text style={styles.step}>
            4. Select "Delete Account"
          </Text>
          <Text style={styles.step}>
            5. Confirm the deletion when prompted
          </Text>
        </View>

        <Text style={styles.sectionTitle}>What Gets Deleted</Text>
        <Text style={styles.text}>
          When you delete your account, the following data will be permanently removed:
        </Text>
        <View style={styles.listContainer}>
          <Text style={styles.listItem}>• Your user profile and personal information</Text>
          <Text style={styles.listItem}>• All your bookings and service history</Text>
          <Text style={styles.listItem}>• Your saved addresses and location data</Text>
          <Text style={styles.listItem}>• Your cart and preferences</Text>
          <Text style={styles.listItem}>• All associated app data</Text>
        </View>

        <Text style={styles.warning}>
          ⚠️ This action cannot be undone. All your data will be permanently deleted.
        </Text>

        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.text}>
          If you're having trouble deleting your account through the app, or if you have any questions, please contact our support team.
        </Text>

        <View style={styles.buttonContainer}>
          <Text 
            style={styles.button}
            onPress={handleOpenApp}
          >
            Open Only Click App
          </Text>
        </View>

        <Text style={styles.footer}>
          Last updated: {new Date().toLocaleDateString()}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  stepsContainer: {
    marginLeft: 10,
    marginBottom: 20,
  },
  step: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
  },
  listContainer: {
    marginLeft: 10,
    marginBottom: 20,
  },
  listItem: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 8,
  },
  warning: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    padding: 16,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  footer: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 20,
  },
});

