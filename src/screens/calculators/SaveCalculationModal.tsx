/**
 * @fileoverview Модальне вікно для вибору проєкту при збереженні результатів калькулятора
 */

import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { projectsService } from '../../services/projectsService';
import Project from '../../database/models/Project';
import { useNavigation } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { sanitizer } from '../../utils/enhancedSanitizers';
import { handleError, validateRequiredParams } from '../../utils/errorHandling';

interface SaveCalculationModalProps {
  visible: boolean;
  calculatorType: string;
  calculatorTitle: string;
  inputData: Record<string, any>;
  result: Record<string, any>;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Модальне вікно для вибору проєкту при збереженні результатів калькулятора
 */
const SaveCalculationModal: React.FC<SaveCalculationModalProps> = ({
  visible,
  calculatorType,
  calculatorTitle,
  inputData,
  result,
  onClose,
  onSaved
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  
  // Завантаження списку проєктів
  useEffect(() => {
    if (visible) {
      loadProjects();
    }
  }, [visible]);
  
  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const userProjects = await projectsService.getUserProjects();
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        setSelectedProjectId(userProjects[0].id);
        setIsCreatingNew(false);
      } else {
        setSelectedProjectId(null);
        setIsCreatingNew(true);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      Alert.alert(
        'Помилка', 
        'Не вдалося завантажити список проєктів'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Валідація вхідних даних
      if (!calculatorType || !calculatorTitle) {
        throw new Error('Відсутні обов\'язкові дані калькулятора');
      }
      
      // Санітизація даних
      console.log('Перед санітизацією, inputData:', typeof inputData, inputData);
      const sanitizedInputData = sanitizer(inputData);
      console.log('Після санітизації:', sanitizedInputData);
      
      console.log('Перед санітизацією, result:', typeof result, result);
      const sanitizedResult = sanitizer(result);
      console.log('Після санітизації:', sanitizedResult);
      
      if (isCreatingNew) {
        // Створення нового проєкту та додавання розрахунку
        const validationError = validateRequiredParams({name: newProjectName}, ['name']);
        if (validationError) {
          Alert.alert('Помилка', validationError);
          setIsLoading(false);
          return;
        }
        
        const newProjectId = await projectsService.createProject({
          name: newProjectName,
          description: newProjectDescription,
          status: 'in_progress',
          startDate: new Date(),
        });
        
        // Логуємо дії для відлагодження
        console.log('Створено новий проєкт з ID:', newProjectId);
        console.log('Дані для збереження:', {
          type: calculatorType,
          sanitizedInputData,
          sanitizedResult,
        });
        
        await projectsService.addCalculationToProject(newProjectId, {
          type: calculatorType,
          title: calculatorTitle,
          inputData: sanitizedInputData,
          result: sanitizedResult,
        });
        
        // Чистимо поля для наступного використання
        setNewProjectName('');
        setNewProjectDescription('');
        
      } else if (selectedProjectId) {
        // Додавання розрахунку до існуючого проєкту
        console.log('Додавання розрахунку до існуючого проєкту з ID:', selectedProjectId);
        
        await projectsService.addCalculationToProject(selectedProjectId, {
          type: calculatorType,
          title: calculatorTitle,
          inputData: sanitizedInputData,
          result: sanitizedResult,
        });
      } else {
        throw new Error('Не вибрано проєкт для збереження');
      }
      
      // Закриваємо модальне вікно та повідомляємо про успіх
      onSaved();
      Alert.alert('Успіх', 'Розрахунок успішно збережено до проєкту');
      
    } catch (error) {
      const errorMessage = handleError(error, 'збереження розрахунку');
      Alert.alert('Помилка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Перехід до створення нового проєкту
  const handleCreateNewProject = () => {
    setIsCreatingNew(true);
    setSelectedProjectId(null);
  };
  
  // Вибір існуючого проєкту
  const handleSelectExistingProject = () => {
    if (projects.length > 0) {
      setIsCreatingNew(false);
      setSelectedProjectId(projects[0]?.id || null);
    } else {
      Alert.alert('Інформація', 'У вас ще немає проєктів. Створіть новий проєкт.');
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Зберегти результат</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6b9c65" />
              <Text style={styles.loadingText}>Завантаження...</Text>
            </View>
          ) : (
            <>
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.option}
                  onPress={handleCreateNewProject}
                >
                  <View style={[
                    styles.radioButton, 
                    isCreatingNew && styles.radioButtonSelected
                  ]} />
                  <Text style={styles.optionText}>Створити новий проєкт</Text>
                </TouchableOpacity>
                
                {isCreatingNew && (
                  <View style={styles.newProjectForm}>
                    <Text style={styles.inputLabel}>Назва проєкту:</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newProjectName}
                      onChangeText={setNewProjectName}
                      placeholder="Введіть назву проєкту"
                      placeholderTextColor="#999"
                    />
                    
                    <Text style={styles.inputLabel}>Опис (опціонально):</Text>
                    <TextInput
                      style={[styles.textInput, styles.textAreaInput]}
                      value={newProjectDescription}
                      onChangeText={setNewProjectDescription}
                      placeholder="Додайте короткий опис проєкту"
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.option, projects.length === 0 && styles.disabledOption]}
                  onPress={handleSelectExistingProject}
                  disabled={projects.length === 0}
                >
                  <View style={[
                    styles.radioButton, 
                    !isCreatingNew && projects.length > 0 && styles.radioButtonSelected
                  ]} />
                  <Text style={[
                    styles.optionText,
                    projects.length === 0 && styles.disabledText
                  ]}>
                    Вибрати існуючий проєкт{projects.length === 0 ? ' (немає проєктів)' : ''}
                  </Text>
                </TouchableOpacity>
                
                {!isCreatingNew && projects.length > 0 && (
                  <FlatList
                    data={projects}
                    keyExtractor={item => item.id}
                    style={styles.projectsList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.projectItem,
                          selectedProjectId === item.id && styles.selectedProjectItem
                        ]}
                        onPress={() => setSelectedProjectId(item.id)}
                      >
                        <Text style={styles.projectName}>{item.name}</Text>
                        <Text style={styles.projectDate}>
                          Створено: {item.createdAt.toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Скасувати</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!isCreatingNew && !selectedProjectId) || 
                    (isCreatingNew && !newProjectName) ? styles.disabledButton : {}
                  ]}
                  onPress={handleSave}
                  disabled={(!isCreatingNew && !selectedProjectId) || (isCreatingNew && !newProjectName)}
                >
                  <Text style={styles.saveButtonText}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledOption: {
    opacity: 0.5,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b9c65',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6b9c65',
    backgroundColor: '#6b9c65',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
  newProjectForm: {
    marginLeft: 32,
    marginBottom: 16,
    width: '90%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  projectsList: {
    maxHeight: 200,
    marginLeft: 32,
  },
  projectItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f8f0',
    marginBottom: 8,
  },
  selectedProjectItem: {
    backgroundColor: '#dcebd9',
    borderWidth: 1,
    borderColor: '#6b9c65',
  },
  projectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  projectDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6b9c65',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#b5c9b2',
  },
});

export default SaveCalculationModal;