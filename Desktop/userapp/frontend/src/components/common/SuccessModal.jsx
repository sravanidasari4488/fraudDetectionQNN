import { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useModal } from '../../context/ModalProvider';
import Text from "../ui/Text";

const SuccessModal = () => {
  const { isSuccessModalOpen, setIsSuccessModalOpen } = useModal();

  const onClose = () => {
    setIsSuccessModalOpen(false);
  };

  // Auto-close after 2 seconds
  useEffect(() => {
    if (isSuccessModalOpen) {
      const timer = setTimeout(() => {
        setIsSuccessModalOpen(false);
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccessModalOpen, setIsSuccessModalOpen]);

  return (
    <Modal
      visible={isSuccessModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>Profile updated successfully</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '70%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: '#0097B3',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SuccessModal;
