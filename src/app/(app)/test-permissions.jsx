import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import SuccessWelcome from '../../components/SignUpSuccess/SuccessWelcome';
import Text from '../../components/ui/Text';

export default function TestPermissions() {
  const router = useRouter();

  const handleComplete = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Permissions Flow</Text>
      <SuccessWelcome onComplete={handleComplete} />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
