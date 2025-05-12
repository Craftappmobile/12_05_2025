/**
 * @fileoverview Екран створення нового проєкту
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui';
import { projectsService } from '../../services/projectsService';
import { ArrowLeft } from 'lucide-react-native';

interface CreateProjectProps {
  navigation: any;
  route: any;
}

/**
 * Компонент екрану створення нового проєкту
 */
const CreateProject: React.FC<CreateProjectProps> = ({ navigation, route }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planned' | 'in_progress' | 'completed' | 'archived'>('planned');
  const [yarnType, setYarnType] = useState('');
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string, yarnType?: string }>({});

  /**
   * Обробка створення проєкту
   */
  const handleCreate = async () => {
    try {
      // Валідація
      const validationErrors: { name?: string, yarnType?: string } = {};
      
      if (!name.trim()) {
        validationErrors.name = 'Введіть назву проєкту';
      }
      
      // Якщо є помилки, показуємо їх
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsLoading(true);
      setErrors({});

      // Створення проєкту
      const projectId = await projectsService.createProject({
        name: name.trim(),
        description: description.trim(),
        status,
        progress: status === 'completed' ? 100 : status === 'in_progress' ? 70 : 0, // Встановлюємо прогрес залежно від статусу
        yarnType: yarnType.trim(), // Додаємо тип пряжі
        startDate: new Date(),
      });

      // Перехід до деталей проєкту
      navigation.navigate('ProjectDetails', { projectId });
      
      // Додатково, якщо була передана функція зворотного виклику
      if (route.params?.onProjectCreated) {
        route.params.onProjectCreated(projectId);
      }
    } catch (error) {
      console.error('Помилка при створенні проєкту:', error);
      Alert.alert('Помилка', 'Не вдалося створити проєкт. Спробуйте ще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Вибір статусу проєкту
   */
  const handleStatusSelect = (newStatus: 'planned' | 'in_progress' | 'completed' | 'archived') => {
    setStatus(newStatus);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Створення проєкту</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Назва проєкту*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Введіть назву проєкту"
            placeholderTextColor="#999"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Опис проєкту</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Додайте опис проєкту"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Тип пряжі</Text>
          <TextInput
            style={[styles.input, errors.yarnType && styles.inputError]}
            value={yarnType}
            onChangeText={setYarnType}
            placeholder="Введіть тип пряжі (напр. Merino Wool)"
            placeholderTextColor="#999"
          />
          {errors.yarnType && <Text style={styles.errorText}>{errors.yarnType}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Статус проєкту</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity 
              style={[styles.statusOption, status === 'planned' && styles.statusOptionSelected]}
              onPress={() => handleStatusSelect('planned')}
            >
              <View style={styles.statusRadio}>
                {status === 'planned' && <View style={styles.statusRadioSelected} />}
              </View>
              <Text style={styles.statusText}>Заплановано</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusOption, status === 'in_progress' && styles.statusOptionSelected]}
              onPress={() => handleStatusSelect('in_progress')}
            >
              <View style={styles.statusRadio}>
                {status === 'in_progress' && <View style={styles.statusRadioSelected} />}
              </View>
              <Text style={styles.statusText}>В процесі</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statusOption, status === 'completed' && styles.statusOptionSelected]}
              onPress={() => handleStatusSelect('completed')}
            >
              <View style={styles.statusRadio}>
                {status === 'completed' && <View style={styles.statusRadioSelected} />}
              </View>
              <Text style={styles.statusText}>Завершено</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Скасувати" 
          onPress={() => navigation.goBack()} 
          variant="outline"
          style={styles.button}
        />
        <Button 
          title="Створити" 
          onPress={handleCreate} 
          style={styles.button}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#e53935',
  },
  errorText: {
    color: '#e53935',
    fontSize: 14,
    marginTop: 4,
  },
  textArea: {
    minHeight: 120,
  },
  statusOptions: {
    marginTop: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusOptionSelected: {
    borderColor: '#6b9c65',
    backgroundColor: '#f0f8f0',
  },
  statusRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6b9c65',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6b9c65',
  },
  statusText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});


// Встановлюємо displayName для компонента
CreateProject.displayName = "CreateProject";

// Імпортуємо безпечну обгортку
import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Створюємо стабільний компонент-обгортку (класовий компонент для кращої сумісності)
export default createSafeNavigationComponent(CreateProject, "CreateProject");