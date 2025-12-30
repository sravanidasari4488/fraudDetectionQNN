import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModal } from '../../context/ModalProvider';
import Text from "../ui/Text";

const CartBottomBar = () => {
  const { isCartBottomBarVisible, cartItemCount } = useModal();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onViewCart = () => {
    router.push("/(modal)/cart");
  };

  if (!isCartBottomBarVisible || cartItemCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity style={styles.button} onPress={onViewCart}>
        <View style={styles.content}>
          <View style={styles.leftContent}>
            <Ionicons name="cart" size={18} color="#fff" />
            <Text style={styles.text}>
              {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in cart
            </Text>
          </View>
          <View style={styles.rightContent}>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
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
    minHeight: 40,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
});

export default CartBottomBar;