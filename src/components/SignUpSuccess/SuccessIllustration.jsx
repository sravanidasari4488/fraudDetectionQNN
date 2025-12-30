import { Image, StyleSheet, View } from 'react-native';
import Text from "../ui/Text";
export default function SuccessIllustration() {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={styles.icon}
          resizeMode="contain"
        />
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  checkmark: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
