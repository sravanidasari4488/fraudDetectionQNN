import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from "../ui/Text";

const CartPageBottomBar = ({ cartItemCount, isVisible, onProceed }) => {
  const insets = useSafeAreaInsets();

  if (!isVisible || cartItemCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]}>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#3898B3',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 40,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default CartPageBottomBar;