/**
 * Спрощений компонент вкладки розрахунків
 * 
 * Цей компонент не використовує withObservables, а працює з базою даних напряму
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button } from '../../components/ui';
import Text from '../../components/Text';
import { ArrowRight, Calculator, Plus } from 'lucide-react-native';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';

interface SimpleProjectCalculationsTabProps {
  projectId: string;
  onRefresh?: () => void;
  navigation?: any; // Опціональний об'єкт навігації для направлення на інші екрани
}

class SimpleProjectCalculationsTab extends React.Component<SimpleProjectCalculationsTabProps, any> {
  // Явно встановлюємо displayName для компонента
  static displayName = 'SimpleProjectCalculationsTab';
  
  constructor(props: SimpleProjectCalculationsTabProps) {
    super(props);
    this.state = {
      loading: true,
      calculations: []
    };
  }
  
  componentDidMount() {
    this.fetchCalculations();
  }
  
  componentDidUpdate(prevProps: SimpleProjectCalculationsTabProps) {
    if (prevProps.projectId !== this.props.projectId) {
      this.fetchCalculations();
    }
  }

  // Завантаження розрахунків
  fetchCalculations = async () => {
    try {
      this.setState({ loading: true });
      
      // Отримуємо розрахунки для проєкту напряму з бази даних
      const calculationsRecords = await database.collections
        .get('calculations')
        .query(
          Q.where('project_id', this.props.projectId),
          Q.sortBy('created_at', 'desc')
        )
        .fetch();
      
      // Перетворюємо записи в масив об'єктів
      const calculationsData = calculationsRecords.map(calc => ({
        id: calc.id,
        calculatorType: calc.calculatorType,
        calculatorTitle: calc.calculatorTitle,
        inputValues: typeof calc.inputValues === 'string' ? JSON.parse(calc.inputValues) : calc.inputValues,
        results: typeof calc.results === 'string' ? JSON.parse(calc.results) : calc.results,
        notes: calc.notes,
        createdAt: calc.createdAt
      }));
      
      this.setState({
        calculations: calculationsData,
        loading: false
      });
    } catch (err) {
      console.error('Помилка при завантаженні розрахунків:', err);
      this.setState({ loading: false });
      Alert.alert('Помилка', `Не вдалося завантажити розрахунки: ${err.message}`);
    }
  };

  // Навігація до деталей розрахунку
  navigateToCalculationDetails = (calculationId: string) => {
    const { navigation } = this.props;
    if (navigation?.navigate) {
      navigation.navigate('CalculationDetails', { calculationId });
    } else {
      Alert.alert('Інформація', 'Компонент перегляду деталей розрахунку буде доступний у наступних версіях');
    }
  };

  // Навігація до списку калькуляторів
  navigateToCalculatorsList = () => {
    const { navigation, projectId } = this.props;
    if (navigation?.navigate) {
      navigation.navigate('CalculatorsList', { projectId });
    } else {
      Alert.alert('Інформація', 'Компонент вибору калькулятора буде доступний у наступних версіях');
    }
  };

  // Видалення розрахунку
  deleteCalculation = async (calculationId: string) => {
    Alert.alert(
      'Видалення розрахунку',
      'Ви впевнені, що хочете видалити цей розрахунок?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: async () => {
            try {
              this.setState({ loading: true });
              
              await database.action(async () => {
                const calcToDelete = await database.collections.get('calculations').find(calculationId);
                await calcToDelete.markAsDeleted();
                await calcToDelete.destroyPermanently();
              });
              
              // Оновлюємо список розрахунків
              this.fetchCalculations();
              
              if (this.props.onRefresh) this.props.onRefresh();
              
              this.setState({ loading: false });
              Alert.alert('Успіх', 'Розрахунок успішно видалено');
            } catch (error) {
              console.error('Помилка при видаленні розрахунку:', error);
              this.setState({ loading: false });
              Alert.alert('Помилка', 'Не вдалося видалити розрахунок');
            }
          }
        },
      ]
    );
  };

  // Формат відображення результатів розрахунку
  formatResults = (results: any) => {
    if (!results) return 'Немає результатів';
    
    try {
      const formattedResults = Object.entries(results)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      return formattedResults || 'Немає результатів';
    } catch (e) {
      return 'Помилка в форматі результатів';
    }
  };

  // Отримання значка для типу калькулятора
  getCalculatorIcon = (type: string) => {
    // В реальному додатку тут можна повертати різні іконки в залежності від типу
    return <Calculator size={22} color="#6B8A5E" />;
  };

  render() {
    const { loading, calculations } = this.state;
  
    return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6B8A5E" />
        </View>
      )}
      
      {/* Кнопка додавання нового розрахунку */}
      <TouchableOpacity 
        style={styles.addCalculationButton}
        onPress={this.navigateToCalculatorsList}
      >
        <Plus size={18} color="#fff" />
        <Text style={styles.addCalculationText}>Додати новий розрахунок</Text>
      </TouchableOpacity>
      
      {/* Заголовок секції */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Мої розрахунки</Text>
      </View>
      
      {/* Список розрахунків */}
      {calculations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>В цьому проєкті ще немає розрахунків</Text>
          <Text style={styles.emptySubtext}>Натисніть "+", щоб додати перший розрахунок</Text>
        </View>
      ) : (
        calculations.map(calculation => (
          <TouchableOpacity
            key={calculation.id}
            style={styles.calculationCard}
            onPress={() => this.navigateToCalculationDetails(calculation.id)}
          >
            <View style={styles.calculationHeader}>
              <View style={styles.calculationTitleContainer}>
                {this.getCalculatorIcon(calculation.calculatorType)}
                <Text style={styles.calculationTitle}>
                  {calculation.calculatorTitle}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => this.deleteCalculation(calculation.id)}
              >
                <Text style={styles.deleteButtonText}>Видалити</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calculationDate}>
              <Text style={styles.dateText}>
                {new Date(calculation.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsLabel}>Результати:</Text>
              <Text style={styles.resultsText}>
                {this.formatResults(calculation.results)}
              </Text>
            </View>
            
            <View style={styles.viewDetailsContainer}>
              <Text style={styles.viewDetailsText}>Переглянути деталі</Text>
              <ArrowRight size={16} color="#6B8A5E" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
    );
  }
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  addCalculationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B8A5E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  addCalculationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B8A5E',
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  calculationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  calculationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calculationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3E28',
    marginLeft: 8,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#D32F2F',
  },
  calculationDate: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  resultsContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  resultsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B8A5E',
    marginBottom: 4,
  },
  resultsText: {
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6B8A5E',
    marginRight: 4,
  },
});

export default SimpleProjectCalculationsTab;