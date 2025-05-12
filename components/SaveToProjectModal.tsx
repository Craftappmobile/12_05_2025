import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button } from './ui';
import { X, Plus } from 'lucide-react-native';
import { useProjects } from '../src/hooks/useProjects';

interface SaveToProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calculatorTitle: string;
  inputValues: Record<string, any>;
  results: Record<string, any> | null;
  onSave: (projectId: string, projectName: string, isNewProject: boolean) => void;
}

export function SaveToProjectModal({ 
  open, 
  onOpenChange, 
  calculatorTitle, 
  inputValues, 
  results, 
  onSave 
}: SaveToProjectModalProps) {
  const { projects, loading, error, fetchProjects, createProject, addCalculationToProject } = useProjects();
  const [projectOption, setProjectOption] = useState<'existing' | 'new'>('existing');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [validationError, setValidationError] = useState('');

  // Завантаження проектів при відкритті модального вікна
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open, fetchProjects]);

  const handleSave = async () => {
    // Валідація
    if (projectOption === 'new' && newProjectName.trim() === '') {
      setValidationError('Введіть назву проєкту');
      return;
    }
    
    if (projectOption === 'existing' && !selectedProject) {
      setValidationError('Виберіть проєкт');
      return;
    }

    try {
      if (projectOption === 'new') {
        // Створення нового проекту
        const success = await createProject({
          name: newProjectName.trim(),
          description: newProjectDescription.trim(),
          status: 'in_progress',
          startDate: new Date(),
          isFavorite: false,
        });

        if (success) {
          // Отримуємо оновлений список проектів
          await fetchProjects();
          
          // Знаходимо ID нового проекту (останній створений)
          const newProject = projects[projects.length - 1];
          
          if (newProject) {
            // Додаємо розрахунок до нового проекту
            await addCalculationToProject(newProject.id, {
              calculatorType: calculatorTitle,
              calculatorTitle: calculatorTitle,
              inputValues,
              results: results || {},
            });
            
            // Виклик функції збереження
            onSave(newProject.id, newProjectName, true);
          }
        }
      } else {
        // Додаємо розрахунок до існуючого проекту
        const project = projects.find(p => p.id === selectedProject);
        
        if (project) {
          await addCalculationToProject(project.id, {
            calculatorType: calculatorTitle,
            calculatorTitle: calculatorTitle,
            inputValues,
            results: results || {},
          });
          
          // Виклик функції збереження
          onSave(project.id, project.name, false);
        }
      }

      // Скидання стану і закриття модального вікна
      resetState();
      onOpenChange(false);
    } catch (err) {
      console.error('Помилка при збереженні розрахунку:', err);
      setValidationError('Помилка при збереженні. Спробуйте ще раз.');
    }
  };

  const resetState = () => {
    setProjectOption('existing');
    setNewProjectName('');
    setNewProjectDescription('');
    setSelectedProject('');
    setValidationError('');
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
            <Text style={styles.modalTitle}>Зберегти результат</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <X size={20} color="#4A6741" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              Оберіть проєкт, до якого хочете зберегти результати розрахунків.
            </Text>

            {validationError ? <Text style={styles.errorText}>{validationError}</Text> : null}
            {error ? <Text style={styles.errorText}>Помилка: {error.message}</Text> : null}

            <View style={styles.optionsContainer}>
              <TouchableOpacity 
                style={[
                  styles.optionButton, 
                  projectOption === 'new' && styles.optionButtonSelected
                ]}
                onPress={() => setProjectOption('new')}
              >
                <View style={styles.radioButton}>
                  <View style={projectOption === 'new' ? styles.radioButtonSelected : null} />
                </View>
                <Text style={styles.optionText}>Створити новий проєкт</Text>
              </TouchableOpacity>

              {projectOption === 'new' && (
                <View style={styles.newProjectInput}>
                  <Text style={styles.inputLabel}>Назва:</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="Введіть назву проєкту"
                    placeholderTextColor="#999"
                  />
                  
                  <Text style={styles.inputLabel}>Опис:</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newProjectDescription}
                    onChangeText={setNewProjectDescription}
                    placeholder="Введіть опис проєкту (необов'язково)"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[
                  styles.optionButton, 
                  projectOption === 'existing' && styles.optionButtonSelected
                ]}
                onPress={() => setProjectOption('existing')}
              >
                <View style={styles.radioButton}>
                  <View style={projectOption === 'existing' ? styles.radioButtonSelected : null} />
                </View>
                <Text style={styles.optionText}>Вибрати існуючий:</Text>
              </TouchableOpacity>

              {projectOption === 'existing' && (
                <View style={styles.projectsList}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#6B8A5E" style={styles.loader} />
                  ) : projects.length === 0 ? (
                    <Text style={styles.noProjectsText}>
                      У вас ще немає проєктів. Створіть новий.
                    </Text>
                  ) : (
                    projects.map(project => (
                      <TouchableOpacity
                        key={project.id}
                        style={[
                          styles.projectItem,
                          selectedProject === project.id && styles.projectItemSelected
                        ]}
                        onPress={() => setSelectedProject(project.id)}
                      >
                        <Text style={styles.projectName}>{project.name}</Text>
                        <View style={styles.checkmark}>
                          {selectedProject === project.id && (
                            <View style={styles.checkmarkInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>

            <View style={styles.calculationInfo}>
              <Text style={styles.infoTitle}>Інформація про розрахунок:</Text>
              <Text style={styles.infoItem}>Калькулятор: {calculatorTitle}</Text>
              <Text style={styles.infoItem}>Дата: {new Date().toLocaleDateString()}</Text>
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
              title="Зберегти" 
              onPress={handleSave} 
              style={styles.saveButton}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4EF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBE2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#F7FAF5',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B8A5E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B8A5E',
  },
  optionText: {
    fontSize: 16,
    color: '#2E3E28',
  },
  newProjectInput: {
    marginLeft: 28,
    marginTop: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1DBCD',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#2E3E28',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  projectsList: {
    marginLeft: 28,
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
  noProjectsText: {
    fontSize: 14,
    color: '#4A6741',
    fontStyle: 'italic',
    marginVertical: 16,
  },
  projectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBE2',
  },
  projectItemSelected: {
    backgroundColor: '#F7FAF5',
  },
  projectName: {
    fontSize: 16,
    color: '#2E3E28',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6B8A5E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B8A5E',
  },
  calculationInfo: {
    backgroundColor: '#F7FAF5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5EBE2',
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5EBE2',
  },
  cancelButton: {
    marginRight: 8,
    borderColor: '#6B8A5E',
  },
  saveButton: {
    backgroundColor: '#6B8A5E',
  },
});
