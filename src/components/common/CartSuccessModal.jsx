import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useModal } from '../../context/ModalProvider';
import Text from "../ui/Text";

const CartSuccessModal = () => {
  const { isCartSuccessModalOpen, setIsCartSuccessModalOpen } = useModal();
  const router = useRouter();

  const onClose = () => {
    setIsCartSuccessModalOpen(false);
  };

  const onViewCart = () => {
    setIsCartSuccessModalOpen(false);
    router.push("/(modal)/cart");
  };

  return (
    <Modal
      visible={isCartSuccessModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            </View>
            
            <Text style={styles.message}>Added to cart!</Text>
            
            <TouchableOpacity style={styles.viewCartButton} onPress={onViewCart}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>View Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  viewCartButton: {
    backgroundColor: '#3898B3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CartSuccessModal;