import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from "../ui/Text";
export default function SuccessMessage({ onContinue }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Your account is ready! Let's set up a few things to get you started with the best experience.
      </Text>
      
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
