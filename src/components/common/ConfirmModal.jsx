import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../ui/Text';

/**
 * ConfirmModal
 * props:
 *  - visible: boolean
 *  - title: string
 *  - message: string
 *  - buttons: [{ text, onPress, style }] (if not provided, shows single OK button)
 *  - onRequestClose: function
 */
export default function ConfirmModal({ visible, title, message, buttons, onRequestClose }) {
  useEffect(() => {
    // no-op placeholder for potential accessibility focus handling
  }, [visible]);

  const vertical = !!(buttons && buttons.length > 2);

  const renderButtons = () => {
    // Single-button (or no buttons) -> full-width primary action
    if (!buttons || buttons.length === 0) {
      return (
        <TouchableOpacity style={[styles.buttonBase, styles.buttonFull]} onPress={onRequestClose}>
          <Text style={[styles.buttonText, styles.primaryButtonText]}>OK</Text>
        </TouchableOpacity>
      );
    }

    // Helper to decide style class based on btn.style or label (yes/no)
    const getBtnStyleClass = (btn) => {
      const label = (btn.text || '').toString().trim().toLowerCase();
      if (btn.style === 'destructive' || label === 'remove' || label === 'delete') return styles.destructive;
      if (btn.style === 'cancel' || label === 'no' || label === 'cancel' || label === 'close') return styles.cancel;
      // positive labels
      if (['yes', 'ok', 'confirm', 'continue', 'save', 'confirm', 'submit'].includes(label)) return styles.positive;
      return styles.primaryButton;
    };

    // If many buttons, stack vertically to avoid overflow
    const vertical = buttons.length > 2;

    if (vertical) {
      return buttons.map((btn, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            styles.buttonBase,
            styles.buttonFull,
            idx > 0 ? styles.buttonSpacing : null,
            getBtnStyleClass(btn),
          ]}
          onPress={() => {
            try {
              btn.onPress && btn.onPress();
            } finally {
              onRequestClose && onRequestClose();
            }
          }}
        >
          <Text style={[styles.buttonText, getBtnStyleClass(btn) === styles.destructive ? styles.destructiveText : null]}>{btn.text}</Text>
        </TouchableOpacity>
      ));
    }

    // Default: horizontal layout (2 or fewer buttons)
    return buttons.map((btn, idx) => (
      <TouchableOpacity
        key={idx}
        style={[styles.buttonBase, { flex: 1, marginLeft: idx === 0 ? 0 : 10 }, getBtnStyleClass(btn)]}
        onPress={() => {
          try {
            btn.onPress && btn.onPress();
          } finally {
            // close modal if caller expects that behaviour via onRequestClose
            onRequestClose && onRequestClose();
          }
        }}
      >
        <Text style={[styles.buttonText, getBtnStyleClass(btn) === styles.destructive ? styles.destructiveText : null]}>{btn.text}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={[styles.buttons, vertical ? styles.buttonsVertical : styles.buttonsHorizontal]}>{renderButtons()}</View>
        </View>
      </View>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  message: PropTypes.string,
  buttons: PropTypes.array,
  onRequestClose: PropTypes.func,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '94%',
    maxWidth: 520,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttons: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  buttonsHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  buttonsVertical: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  buttonBase: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonFull: {
    width: '100%',
  },
  buttonSpacing: {
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#0097B3',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  cancel: {
    backgroundColor: '#f5f5f5',
  },
  destructive: {
    backgroundColor: '#ff6b6b',
  },
  positive: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  destructiveText: {
    color: 'white',
  },
});
