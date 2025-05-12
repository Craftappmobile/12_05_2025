/**
 * @fileoverview Вкладка розрахунків у деталях проєкту
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { projectsService } from '../../services/projectsService';
import Calculation from '../../database/models/Calculation';
import { Edit, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Імпортуємо нову утиліту для Bridgeless режиму
import { BridgelessSafeComponent } from '../../utils/BridgelessCompat';

interface ProjectCalculationsTabProps {
  projectId: string;
  onRefresh?: () => void;
}

/**
 * Компонент вкладки розрахунків в деталях проєкту
 */
const ProjectCalculationsTab: React.FC<ProjectCalculationsTabProps> = ({ projectId, onRefresh }) => {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [expandedCalculationId, setExpandedCalculationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation();
  
  useEffect(() => {
    loadCalculations();
  }, [projectId]);
  
  /**
   * Завантаження розрахунків проєкту
   */
  const loadCalculations = async () => {
    try {
      setIsLoading(true);
      const calculationsList = await projectsService.getProjectCalculations(projectId);
      setCalculations(calculationsList);
    } catch (error) {
      console.error('Помилка при завантаженні розрахунків:', error);
      Alert.alert(
        'Помилка', 
        'Не вдалося завантажити розрахунки проєкту'
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Розгортання/згортання деталей розрахунку
   */
  const toggleExpand = (calculationId: string) => {
    if (expandedCalculationId === calculationId) {
      setExpandedCalculationId(null);
    } else {
      setExpandedCalculationId(calculationId);
    }
  };
  
  /**
   * Перехід до калькулятора для редагування
   */
  const navigateToCalculator = (calculation: Calculation) => {
    // Визначаємо, який калькулятор відкрити
    switch (calculation.calculatorType) {
      case 'YarnCalculator':
        navigation.navigate('YarnCalculator', {
          inputData: calculation.inputValues,
          editMode: true,
          calculationId: calculation.id,
          projectId: projectId
        });
        break;
      // Інші типи калькуляторів можна додати тут
      default:
        Alert.alert('Інформація', 'Редагування цього типу розрахунків поки не підтримується');
    }
  };
  
  /**
   * Видалення розрахунку
   */
  const deleteCalculation = (calculation: Calculation) => {
    Alert.alert(
      'Підтвердження видалення',
      `Ви впевнені, що хочете видалити розрахунок "${calculation.calculatorTitle}"?`,
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectsService.deleteCalculation(calculation.id);
              setCalculations(calculations.filter(calc => calc.id !== calculation.id));
              if (onRefresh) onRefresh();
            } catch (error) {
              console.error('Помилка при видаленні розрахунку:', error);
              Alert.alert('Помилка', 'Не вдалося видалити розрахунок');
            }
          }
        }
      ]
    );
  };
  
  /**
   * Додавання нового розрахунку
   */
  const addNewCalculation = () => {
    navigation.navigate('CalculatorsList', { projectId });
  };

  // Відображення компонента
  return (
    <View style={styles.container}>
      {/* Заголовок із кнопкою додавання */}
      <View style={styles.header}>
        <Text style={styles.title}>Розрахунки проєкту</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={addNewCalculation}
        >
          <PlusCircle size={24} color="#6B8A5E" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6B8A5E" />
          <Text style={styles.loaderText}>Завантаження розрахунків...</Text>
        </View>
      ) : (
        <ScrollView>
          {calculations.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                Ще немає розрахунків для цього проєкту.
                Натисніть кнопку "+" вгорі, щоб додати перший розрахунок.
              </Text>
            </View>
          ) : (
            calculations.map((calculation) => (
              <View key={calculation.id} style={styles.calculationCard}>
                {/* Заголовок розрахунку */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(calculation.id)}
                  style={styles.calculationHeader}
                >
                  <View>
                    <Text style={styles.calculationType}>{calculation.calculatorTitle}</Text>
                    <Text style={styles.calculationDate}>
                      {new Date(calculation.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  {expandedCalculationId === calculation.id ? 
                    <ChevronUp size={20} color="#6B8A5E" /> : 
                    <ChevronDown size={20} color="#6B8A5E" />
                  }
                </TouchableOpacity>
                
                {/* Деталі розрахунку */}
                {expandedCalculationId === calculation.id && (
                  <View style={styles.calculationDetails}>
                    {/* Вхідні дані */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Вхідні дані:</Text>
                      {Object.entries(JSON.parse(calculation.inputValues)).map(([key, value]) => (
                        <Text key={key} style={styles.inputItem}>
                          {key}: <Text style={styles.inputValue}>{value}</Text>
                        </Text>
                      ))}
                    </View>
                    
                    {/* Результати */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Результати:</Text>
                      {Object.entries(JSON.parse(calculation.results)).map(([key, value]) => (
                        <Text key={key} style={styles.resultItem}>
                          {key}: <Text style={styles.resultValue}>{value}</Text>
                        </Text>
                      ))}
                    </View>
                    
                    {/* Примітки */}
                    {calculation.notes && (
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Примітки:</Text>
                        <Text>{calculation.notes}</Text>
                      </View>
                    )}
                    
                    {/* Кнопки дій */}
                    <View style={styles.actionsContainer}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => navigateToCalculator(calculation)}
                      >
                        <Edit size={16} color="#FFFFFF" />
                        <Text style={styles.editButtonText}>Редагувати</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteCalculation(calculation)}
                      >
                        <Text style={styles.deleteButtonText}>Видалити</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3E28',
  },
  addButton: {
    padding: 8,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A6741',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 16,
    lineHeight: 24,
  },
  calculationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  calculationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calculationDate: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  calculationDetails: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputItem: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  inputValue: {
    fontWeight: '500',
  },
  resultItem: {
    fontSize: 14,
    marginBottom: 6,
    color: '#444',
  },
  resultValue: {
    fontWeight: '500',
    color: '#4a6e45',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#4a6e45',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d9534f',
  },
  deleteButtonText: {
    color: '#d9534f',
    fontSize: 14,
    fontWeight: '500',
  },
});

// Створюємо безпечну версію компонента для Bridgeless режиму
const BridgelessSafeCalcTab = BridgelessSafeComponent(ProjectCalculationsTab, 'ProjectCalculationsTab');

export default BridgelessSafeCalcTab;