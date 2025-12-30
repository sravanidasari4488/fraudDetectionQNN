import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Text from "../ui/Text";
const OTPButton = ({ otpLength, onSubmit, loading }) => {
  return (
    <TouchableOpacity
      style={[
        styles.proceedButton,
        otpLength < 4 && styles.disabledButton,
        loading && { opacity: 0.7 },
      ]}
      onPress={onSubmit}
      disabled={otpLength < 4}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.proceedButtonText}>PROCEED</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  proceedButton: {
    backgroundColor: '#3898B3',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  proceedButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default OTPButton;