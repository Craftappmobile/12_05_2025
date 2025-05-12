import React from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';

interface ShareMenuProps {
  visible: boolean;
  onClose: () => void;
  onShareCommunity: () => void;
  onShareLink: () => void;
}

const ShareMenu: React.FC<ShareMenuProps> = ({
  visible, 
  onClose, 
  onShareCommunity, 
  onShareLink
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <Text style={styles.title}>
            Оберіть спосіб поширення
          </Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onShareCommunity}
          >
            <Text style={styles.menuItemText}>
              До внутрішньої спільноти
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onShareLink}
          >
            <Text style={styles.menuItemText}>
              Поширити за посиланням
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={[styles.menuItemText, styles.cancelText]}>
              Скасувати
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 16,
    textAlign: 'center',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#6B8A5E',
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: '#F5F7F4',
  },
  menuItemText: {
    fontSize: 14,
    color: '#2E3E28',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  cancelText: {
    color: '#9E9E9E',
  },
});

export default ShareMenu;