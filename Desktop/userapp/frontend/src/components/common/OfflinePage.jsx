import { Image, StyleSheet, View } from 'react-native';
import Text from '../ui/Text';

const OfflinePage = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../../../assets/images/no_internet.png')} 
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>
        Please check your network settings and try again.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  icon: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default OfflinePage;