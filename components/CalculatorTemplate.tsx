import React, { useState } from 'react';
import { useProjects } from '../src/hooks/useProjects';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card, Input, Button, Text } from './ui';
import { HelpCircle, Save } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { HelpModal } from './HelpModal';
import { SaveToProjectModal } from './SaveToProjectModal';

interface CalculatorTemplateProps {
  title: string;
  description?: string;
  fields: {
    id: string;
    label: string;
    type: "text" | "number" | "select";
    options?: { value: string; label: string }[];
    placeholder?: string;
    unit?: string;
  }[];
  calculate: (values: Record<string, any>) => Record<string, any>;
  helpInfo?: {
    purpose: string;
    steps: { step: string; description: string }[];
    tips?: string[];
    videoUrl?: string;
  };
  route?: any; // Для отримання параметрів навігації
  navigation?: any; // Для навігації
}

export function CalculatorTemplate({ 
  title, 
  description, 
  fields, 
  calculate, 
  helpInfo,
  route,
  navigation
}: CalculatorTemplateProps) {
  // Отримуємо projectId з параметрів навігації, якщо він є
  const projectId = route?.params?.projectId;
  const [values, setValues] = useState<Record<string, any>>({});
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, value: string | number) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const { addCalculationToProject } = useProjects();

  const handleCalculate = async () => {
    // Валідація полів перед розрахунком
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(field => {
      if (field.type === 'number' && values[field.id]) {
        if (isNaN(Number(values[field.id])) || Number(values[field.id]) <= 0) {
          newErrors[field.id] = `Введіть коректне значення для ${field.label}`;
          hasErrors = true;
        }
      }
    });

    setErrors(newErrors);
    if (hasErrors) return;

    const calculationResults = calculate(values);
    setResults(calculationResults);

    // Якщо projectId передано, автоматично зберігаємо розрахунок до проекту
    if (projectId && navigation) {
      try {
        await addCalculationToProject(projectId, {
          calculatorType: title,
          calculatorTitle: title,
          inputValues: values,
          results: calculationResults,
        });

        // Показуємо сповіщення про успішне збереження
        Alert.alert(
          'Успішно збережено',
          'Розрахунок збережено до проекту',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.navigate('ProjectDetails', { projectId }) 
            }
          ]
        );
      } catch (error) {
        console.error('Помилка при збереженні розрахунку:', error);
        Alert.alert(
          'Помилка',
          'Не вдалося зберегти розрахунок. Спробуйте ще раз.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const resetCalculator = () => {
    setValues({});
    setResults(null);
    setErrors({});
  };

  const handleSaveToProject = async (projectId: string, projectName: string, isNewProject: boolean) => {
    try {
      // Тут буде логіка збереження до проекту
      console.log('Збереження до проекту:', {
        projectId,
        projectName,
        isNewProject,
        calculatorTitle: title,
        inputValues: values,
        results,
        date: new Date().toISOString(),
      });
      
      // Показуємо сповіщення про успішне збереження
      Alert.alert(
        'Успішно збережено',
        `Розрахунок збережено до проекту "${projectName}"`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Показуємо сповіщення про помилку
      Alert.alert(
        'Помилка',
        'Не вдалося зберегти розрахунок. Спробуйте ще раз.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card className="bg-white shadow-md">
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            {helpInfo && (
              <TouchableOpacity 
                style={styles.helpButton} 
                onPress={() => setHelpModalOpen(true)}
              >
                <HelpCircle size={20} color="#4A6741" />
              </TouchableOpacity>
            )}
          </View>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>

        <View style={styles.content}>
          {fields.map((field) => (
            <View key={field.id} style={styles.fieldContainer}>
              <Text style={styles.label}>
                {field.label}
                {field.unit && <Text style={styles.unit}> ({field.unit})</Text>}
              </Text>
              
              {field.type === "select" ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values[field.id] || ''}
                    onValueChange={(value) => handleInputChange(field.id, value)}
                    style={styles.picker}
                  >
                    <Picker.Item 
                      label={field.placeholder || "Оберіть..."} 
                      value="" 
                    />
                    {field.options?.map((option) => (
                      <Picker.Item 
                        key={option.value} 
                        label={option.label} 
                        value={option.value} 
                      />
                    ))}
                  </Picker>
                </View>
              ) : (
                <Input
                  value={values[field.id] || ''}
                  onChangeText={(text) => handleInputChange(field.id, text)}
                  placeholder={field.placeholder}
                  keyboardType={field.type === "number" ? "numeric" : "default"}
                  error={errors[field.id]}
                />
              )}
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <Button 
              title="Розрахувати" 
              onPress={handleCalculate} 
              style={styles.calculateButton}
            />
            <Button 
              title="Скинути" 
              onPress={resetCalculator} 
              variant="outline"
              style={styles.resetButton}
            />
          </View>

          {results && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Результати:</Text>
              {Object.entries(results).map(([key, value]) => (
                <View key={key} style={styles.resultRow}>
                  <Text style={styles.resultLabel}>{key}:</Text>
                  <Text style={styles.resultValue}>{value}</Text>
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => setSaveModalOpen(true)}
              >
                <Save size={16} color="#4A6741" style={styles.saveIcon} />
                <Text style={styles.saveButtonText}>Зберегти до проєкту</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Card>

      {/* Help Modal */}
      {helpInfo && (
        <HelpModal
          open={helpModalOpen}
          onOpenChange={setHelpModalOpen}
          title={title}
          purpose={helpInfo.purpose}
          steps={helpInfo.steps}
          tips={helpInfo.tips}
          videoUrl={helpInfo.videoUrl}
        />
      )}

      {/* Save to Project Modal */}
      <SaveToProjectModal
        open={saveModalOpen}
        onOpenChange={setSaveModalOpen}
        calculatorTitle={title}
        inputValues={values}
        results={results}
        onSave={handleSaveToProject}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#F0F4EF',
    padding: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBE2',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  description: {
    fontSize: 14,
    color: '#4A6741',
    marginTop: 4,
  },
  helpButton: {
    padding: 4,
    borderRadius: 20,
  },
  content: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A6741',
    marginBottom: 6,
  },
  unit: {
    color: '#6B8A5E',
    fontWeight: 'normal',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1DBCD',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  calculateButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#6B8A5E',
  },
  resetButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#6B8A5E',
  },
  resultContainer: {
    padding: 16,
    backgroundColor: '#F7FAF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5EBE2',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E3E28',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultLabel: {
    color: '#4A6741',
  },
  resultValue: {
    fontWeight: '500',
    color: '#2E3E28',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 10,
    backgroundColor: '#E5EBE2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1DBCD',
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#4A6741',
    fontWeight: '500',
  },
});
