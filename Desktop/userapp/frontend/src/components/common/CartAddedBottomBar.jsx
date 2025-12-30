import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from "../ui/Text";

const CartAddedBottomBar = ({ isVisible, onClose, cartItemCount = 0 }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onViewCart = () => {
    router.push("/(modal)/cart");
  };

  // Show if visible or if cart has items (permanent once items added)
  if (!isVisible && cartItemCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: insets.bottom + 50 }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Ionicons name="cart" size={20} color="#3898B3" />
          <Text style={styles.addedText}>
            {cartItemCount > 0 ? `${cartItemCount} item${cartItemCount > 1 ? 's' : ''} in cart` : 'Added to cart'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewCartButton} onPress={onViewCart}>
          <Text style={styles.buttonText}>View Cart</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 66,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  viewCartButton: {
    backgroundColor: '#0a99c0ff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CartAddedBottomBar;