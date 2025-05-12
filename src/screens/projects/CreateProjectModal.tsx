import React, { useState } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Button } from '../../../components/ui';
import Text from '../../components/Text';
import { X } from 'lucide-react-native';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (projectData: {
    name: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed' | 'archived';
  }) => void;
}

const CreateProjectModal = ({ 
  open, 
  onOpenChange, 
  onCreateProject 
}: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed' | 'archived'>('planned');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const handleCreate = () => {
    // Валідація
    if (!name.trim()) {
      setErrors({ name: 'Введіть назву проекту' });
      return;
    }

    // Виклик функції створення проекту
    onCreateProject({ name: name.trim(),
      description: description.trim(),
      status });

    // Скидання стану
    resetState();
  };

  const resetState = () => {
    setName('');
    setDescription('');
    setStatus('planned');
    setErrors({});
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Створення проекту</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <X size={20} color="#4A6741" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Назва проекту*</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.name ? styles.inputError : null
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Введіть назву проекту"
                placeholderTextColor="#999"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Опис</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Введіть опис проекту"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Статус</Text>
              <View style={styles.statusOptions}>
                <TouchableOpacity 
                  style={[
                    styles.statusOption,
                    status === 'planned' && styles.statusOptionSelected
                  ]}
                  onPress={() => setStatus('planned')}
                >
                  <View style={styles.radioButton}>
                    <View style={status === 'planned' ? styles.radioButtonSelected : null} />
                  </View>
                  <Text style={styles.statusText}>Заплановано</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.statusOption,
                    status === 'in_progress' && styles.statusOptionSelected
                  ]}
                  onPress={() => setStatus('in_progress')}
                >
                  <View style={styles.radioButton}>
                    <View style={status === 'in_progress' ? styles.radioButtonSelected : null} />
                  </View>
                  <Text style={styles.statusText}>В процесі</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button 
              title="Скасувати" 
              onPress={handleClose} 
              variant="outline"
              style={styles.cancelButton}
            />
            <Button 
              title="Створити" 
              onPress={handleCreate} 
              style={styles.createButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({ modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center' },
  modalContainer: { width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden' },
  modalHeader: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4EF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBE2' },
  modalTitle: { fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28' },
  closeButton: { padding: 4 },
  modalContent: { padding: 16 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14,
    fontWeight: '500',
    color: '#4A6741',
    marginBottom: 6 },
  input: { borderWidth: 1,
    borderColor: '#D1DBCD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#2E3E28' },
  inputError: { borderColor: '#D32F2F' },
  textArea: { height: 100,
    textAlignVertical: 'top' },
  errorText: { color: '#D32F2F',
    fontSize: 12,
    marginTop: 4 },
  statusOptions: { marginTop: 8 },
  statusOption: { flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8 },
  statusOptionSelected: { backgroundColor: '#F7FAF5' },
  radioButton: { width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B8A5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8 },
  radioButtonSelected: { width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B8A5E' },
  statusText: { fontSize: 16,
    color: '#2E3E28' },
  modalFooter: { flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5EBE2' },
  cancelButton: { marginRight: 8,
    borderColor: '#6B8A5E' },
  createButton: { backgroundColor: '#6B8A5E' },
});

export default CreateProjectModal;