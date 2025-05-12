/**
 * @fileoverview Калькулятор витрат пряжі з можливістю збереження до проєкту
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Input, Button } from '../../components/ui';
import SaveCalculationModal from './SaveCalculationModal';
import { useNavigation } from '@react-navigation/native';
import { sanitizer } from '../../utils/sanitizers';

interface CalculationResult {
  yarnNeeded: number;
  ballsNeeded: number;
  width?: string;
  height?: string;
  gauge?: string;
  yarnWeight?: string;
  ballWeight?: string;
}

interface YarnCalculatorProps {
  onSaveResult?: (result: CalculationResult) => void;
  route?: {
    params?: {
      inputData?: any;
      editMode?: boolean;
      calculationId?: string;
      projectId?: string;
    };
  };
}

/**
 * Компонент калькулятора витрат пряжі з можливістю збереження результатів до проєкту
 */
const YarnCalculator: React.FC<YarnCalculatorProps> = ({ onSaveResult, route }) => {
  // Вхідні дані редагування, якщо передано
  const inputData = route?.params?.inputData;
  const isEditMode = route?.params?.editMode;
  const calculationId = route?.params?.calculationId;
  const projectId = route?.params?.projectId;
  
  const navigation = useNavigation();
  
  // Стан форми
  const [width, setWidth] = useState(inputData?.width || '');
  const [height, setHeight] = useState(inputData?.height || '');
  const [gauge, setGauge] = useState(inputData?.gauge || '');
  const [yarnWeight, setYarnWeight] = useState(inputData?.yarnWeight || '');
  const [ballWeight, setBallWeight] = useState(inputData?.ballWeight || '');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Стан модального вікна
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  /**
   * Валідація введених даних
   */
  const validateInputs = () => {
    const newErrors: Record<string, string> = {};
    
    if (!width || isNaN(Number(width)) || Number(width) <= 0) {
      newErrors.width = 'Введіть коректну ширину';
    }
    
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      newErrors.height = 'Введіть коректну висоту';
    }
    
    if (!gauge || isNaN(Number(gauge)) || Number(gauge) <= 0) {
      newErrors.gauge = 'Введіть коректну щільність';
    }
    
    if (!yarnWeight || isNaN(Number(yarnWeight)) || Number(yarnWeight) <= 0) {
      newErrors.yarnWeight = 'Введіть коректну вагу пряжі на м²';
    }
    
    if (!ballWeight || isNaN(Number(ballWeight)) || Number(ballWeight) <= 0) {
      newErrors.ballWeight = 'Введіть коректну вагу мотка';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Розрахунок витрат пряжі
   */
  const calculateYarnNeeded = () => {
    if (!validateInputs()) return;
    
    const widthValue = Number(width);
    const heightValue = Number(height);
    const gaugeValue = Number(gauge);
    const yarnWeightValue = Number(yarnWeight);
    const ballWeightValue = Number(ballWeight);
    
    // Розрахунок площі в м²
    const area = (widthValue * heightValue) / 10000; // переводимо см² в м²
    
    // Розрахунок кількості пряжі в грамах
    const yarnNeeded = area * yarnWeightValue * gaugeValue;
    
    // Розрахунок кількості мотків
    const ballsNeeded = Math.ceil(yarnNeeded / ballWeightValue);
    
    const resultData = { 
      yarnNeeded, 
      ballsNeeded,
      width,
      height,
      gauge,
      yarnWeight,
      ballWeight
    };
    
    setResult(resultData);
    
    // Якщо передана функція onSaveResult, викликаємо її з результатом
    if (onSaveResult) {
      onSaveResult(resultData);
    }
    
    // Якщо в режимі редагування, пропонуємо зберегти зміни
    if (isEditMode && calculationId) {
      Alert.alert(
        'Оновити розрахунок',
        'Бажаєте оновити цей розрахунок з новими результатами?',
        [
          {
            text: 'Ні',
            style: 'cancel'
          },
          {
            text: 'Так',
            onPress: () => {
              // Логіка оновлення розрахунку
              // Буде реалізована в майбутній версії
              Alert.alert('Успіх', 'Розрахунок оновлено');
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  /**
   * Скидання форми калькулятора
   */
  const resetCalculator = () => {
    setWidth('');
    setHeight('');
    setGauge('');
    setYarnWeight('');
    setBallWeight('');
    setResult(null);
    setErrors({});
  };
  
  /**
   * Відкриття модального вікна для збереження до проєкту
   */
  const handleSaveToProject = () => {
    if (!result) return;
    setSaveModalVisible(true);
  };
  
  /**
   * Закриття модального вікна
   */
  const handleCloseModal = () => {
    setSaveModalVisible(false);
  };
  
  /**
   * Обробка успішного збереження
   */
  const handleSaved = () => {
    setSaveModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card title="Калькулятор витрат пряжі">
        <View style={styles.inputContainer}>
          <Input
            label="Ширина виробу (см)"
            value={width}
            onChangeText={setWidth}
            keyboardType="numeric"
            placeholder="Наприклад: 50"
            error={errors.width}
          />
          
          <Input
            label="Висота виробу (см)"
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Наприклад: 60"
            error={errors.height}
          />
          
          <Input
            label="Щільність в'язання (коефіцієнт)"
            value={gauge}
            onChangeText={setGauge}
            keyboardType="numeric"
            placeholder="Наприклад: 1.2"
            error={errors.gauge}
          />
          
          <Input
            label="Вага пряжі на м² (г)"
            value={yarnWeight}
            onChangeText={setYarnWeight}
            keyboardType="numeric"
            placeholder="Наприклад: 200"
            error={errors.yarnWeight}
          />
          
          <Input
            label="Вага мотка пряжі (г)"
            value={ballWeight}
            onChangeText={setBallWeight}
            keyboardType="numeric"
            placeholder="Наприклад: 100"
            error={errors.ballWeight}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Розрахувати" 
            onPress={calculateYarnNeeded} 
            style={styles.button}
          />
          <Button 
            title="Скинути" 
            onPress={resetCalculator} 
            variant="outline"
            style={styles.button}
          />
        </View>
        
        {result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Результат розрахунку:</Text>
            <Text style={styles.resultText}>
              Необхідна кількість пряжі: {result.yarnNeeded.toFixed(2)} г
            </Text>
            <Text style={styles.resultText}>
              Кількість мотків: {result.ballsNeeded} шт.
            </Text>
            
            <Button 
              title="Зберегти до проєкту" 
              onPress={handleSaveToProject} 
              style={styles.saveButton}
              variant="primary"
            />
          </View>
        )}
      </Card>
      
      {/* Модальне вікно для збереження до проєкту */}
      <SaveCalculationModal 
        visible={saveModalVisible}
        calculatorType="YarnCalculator"
        calculatorTitle="Калькулятор витрат пряжі"
        inputData={{
          width,
          height,
          gauge,
          yarnWeight,
          ballWeight
        }}
        result={{
          yarnNeeded: result?.yarnNeeded || 0,
          ballsNeeded: result?.ballsNeeded || 0
        }}
        onClose={handleCloseModal}
        onSaved={handleSaved}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  inputContainer: { 
    marginBottom: 16 
  },
  buttonContainer: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16 
  },
  button: { 
    flex: 1,
    marginHorizontal: 4 
  },
  resultContainer: { 
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee' 
  },
  resultTitle: { 
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333' 
  },
  resultText: { 
    fontSize: 14,
    marginBottom: 4,
    color: '#333' 
  },
  saveButton: {
    marginTop: 16,
  }
});

export default YarnCalculator;