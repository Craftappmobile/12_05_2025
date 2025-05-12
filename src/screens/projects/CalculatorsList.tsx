/**
 * @fileoverview Компонент для вибору калькулятора при додаванні розрахунку до проєкту
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import Text from '../../components/Text';
import { ArrowLeft, Calculator, Ruler, Scissors, Repeat, CornerDownRight } from 'lucide-react-native';

interface CalculatorItem {
  id: string;
  name: string;
  description: string;
  route: string;
  icon: React.ReactNode;
}

/**
 * Компонент для вибору калькулятора при додаванні розрахунку до проєкту
 */
const CalculatorsList: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { projectId } = route.params;

  // Список доступних калькуляторів
  const calculators: CalculatorItem[] = [
    { 
      id: 'yarn', 
      name: 'Калькулятор витрати пряжі', 
      description: 'Розрахунок кількості пряжі, потрібної для виробу',
      route: 'YarnCalculator',
      icon: <Calculator size={24} color="#4a6e45" />
    },
    { 
      id: 'hat', 
      name: 'Калькулятор шапки', 
      description: 'Розрахунок петель для в\'язання шапки',
      route: 'HatCalculator',
      icon: <Ruler size={24} color="#4a6e45" />
    },
    { 
      id: 'vneck', 
      name: 'Калькулятор V-горловини', 
      description: 'Розрахунок зменшення петель для V-вирізу',
      route: 'VNeckDecreaseCalculator',
      icon: <Scissors size={24} color="#4a6e45" />
    },
    { 
      id: 'adaptation', 
      name: 'Адаптація майстер-класу', 
      description: 'Масштабування та адаптація схеми',
      route: 'AdaptationCalculator',
      icon: <Repeat size={24} color="#4a6e45" />
    },
    // Тут можна додати інші калькулятори
  ];

  /**
   * Функція для переходу до вибраного калькулятора
   */
  const navigateToCalculator = (route: string) => {
    navigation.navigate(route, { projectId });
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
        <Text style={styles.title}>Виберіть калькулятор</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Виберіть калькулятор для створення нового розрахунку. Результати будуть збережені у проєкті.
        </Text>

        <View style={styles.calculatorsList}>
          {calculators.map(calculator => (
            <TouchableOpacity
              key={calculator.id}
              style={styles.calculatorItem}
              onPress={() => navigateToCalculator(calculator.route)}
            >
              <View style={styles.iconContainer}>
                {calculator.icon}
              </View>
              <View style={styles.calculatorInfo}>
                <Text style={styles.calculatorName}>{calculator.name}</Text>
                <Text style={styles.calculatorDescription}>{calculator.description}</Text>
              </View>
              <CornerDownRight size={20} color="#6B8A5E" style={styles.arrowIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { 
    padding: 4,
  },
  title: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  content: { 
    flex: 1,
    padding: 16,
  },
  description: { 
    fontSize: 16,
    color: '#4A6741',
    marginBottom: 16,
    lineHeight: 22,
  },
  calculatorsList: { 
    marginBottom: 24,
  },
  calculatorItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  calculatorIcon: { 
    marginRight: 12,
  },
  calculatorInfo: {
    flex: 1,
  },
  calculatorName: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3E28',
    marginBottom: 4,
  },
  calculatorDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    opacity: 0.6,
  },
});


// Встановлюємо displayName для компонента
CalculatorsList.displayName = "CalculatorsList";

// Імпортуємо безпечну обгортку
import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Створюємо стабільний компонент-обгортку (класовий компонент для кращої сумісності)
export default createSafeNavigationComponent(CalculatorsList, "CalculatorsList");
