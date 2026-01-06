import { StyleSheet, View } from 'react-native';
import Text from "../ui/Text";
export default function SuccessHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Success!</Text>
      <Text style={styles.subtitle}>Account Setup Complete</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});
