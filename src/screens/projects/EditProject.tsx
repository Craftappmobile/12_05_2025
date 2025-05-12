import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '../../../components/ui';
import Text from '../../components/Text';
import { ArrowLeft } from 'lucide-react-native';
import { useProjects } from '../../hooks/useProjects';

const EditProject: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { project } = route.params;
  const { updateProject } = useProjects();
  
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Функція для збереження змін
  const handleSave = async () => {
    // Валідація
    if (!name.trim()) {
      setErrors({ name: 'Введіть назву проекту' });
      return;
    }

    try { // Оновлення проекту
      const success = await updateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        status });

      if (success) {
        // Показуємо сповіщення про успішне оновлення
        Alert.alert(
          'Успішно оновлено',
          'Проект успішно оновлено',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      } else {
        // Показуємо сповіщення про помилку
        Alert.alert(
          'Помилка',
          'Не вдалося оновити проект. Спробуйте ще раз.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Помилка при оновленні проекту:', error);
      Alert.alert(
        'Помилка',
        'Не вдалося оновити проект. Спробуйте ще раз.',
        [{ text: 'OK' }]
      );
    }
  };

  // Функція для скасування змін
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#2E3E28" />
        </TouchableOpacity>
        <Text style={styles.title}>Редагування проекту</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
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

            <TouchableOpacity 
              style={[
                styles.statusOption,
                status === 'completed' && styles.statusOptionSelected
              ]}
              onPress={() => setStatus('completed')}
            >
              <View style={styles.radioButton}>
                <View style={status === 'completed' ? styles.radioButtonSelected : null} />
              </View>
              <Text style={styles.statusText}>Завершено</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.statusOption,
                status === 'archived' && styles.statusOptionSelected
              ]}
              onPress={() => setStatus('archived')}
            >
              <View style={styles.radioButton}>
                <View style={status === 'archived' ? styles.radioButtonSelected : null} />
              </View>
              <Text style={styles.statusText}>Архівовано</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Скасувати" 
          onPress={handleCancel} 
          variant="outline"
          style={styles.cancelButton}
        />
        <Button 
          title="Зберегти" 
          onPress={handleSave} 
          style={styles.saveButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee' },
  backButton: { padding: 4 },
  title: { fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3E28' },
  content: { flex: 1,
    padding: 16 },
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
    color: '#2E3E28',
    backgroundColor: '#fff' },
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
  footer: { flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee' },
  cancelButton: { flex: 1,
    marginRight: 8,
    borderColor: '#6B8A5E' },
  saveButton: { flex: 1,
    marginLeft: 8,
    backgroundColor: '#6B8A5E' },
});


// Встановлюємо displayName для компонента
EditProject.displayName = "EditProject";

// Імпортуємо безпечну обгортку
import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Створюємо стабільний компонент-обгортку (класовий компонент для кращої сумісності)
export default createSafeNavigationComponent(EditProject, "EditProject");
