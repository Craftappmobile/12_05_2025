/**
 * Спрощений компонент вкладки лічильника
 * 
 * Цей компонент не використовує withObservables, а працює з базою даних напряму
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Plus, Minus, RotateCcw } from 'lucide-react-native';
import { database } from '../../database';
import { Button } from '../../components/ui';

interface SimpleProjectCounterTabProps {
  projectId: string;
  onRefresh?: () => void;
  onProgressChange?: (progress: number) => void;
}

class SimpleProjectCounterTab extends React.Component<SimpleProjectCounterTabProps, any> {
  // Явно встановлюємо displayName для компонента
  static displayName = 'SimpleProjectCounterTab';
  
  constructor(props: SimpleProjectCounterTabProps) {
    super(props);
    this.state = {
      loading: false,
      projectData: null,
      currentRow: 0,
      totalRows: 100,
      customIncrement: 1
    };
  }
  
  componentDidMount() {
    this.fetchProjectData();
  }
  
  componentDidUpdate(prevProps: SimpleProjectCounterTabProps) {
    if (prevProps.projectId !== this.props.projectId) {
      this.fetchProjectData();
    }
    
    // Оновлення прогресу при зміні значень
    const { currentRow, totalRows } = this.state;
    if (totalRows > 0) {
      const progress = Math.min(Math.round((currentRow / totalRows) * 100), 100);
      if (this.props.onProgressChange) {
        this.props.onProgressChange(progress);
      }
      // Зберігаємо прогрес у базі даних
      this.updateProjectProgress(progress);
    }
  }
  
  
  fetchProjectData = async () => {
    try {
      this.setState({ loading: true });
      
      // Отримуємо дані проєкту
      const project = await database.get('projects').find(this.props.projectId);
      
      this.setState({
        projectData: project,
        currentRow: project.currentRow || 0,
        totalRows: project.totalRows || 100,
        loading: false
      });
    } catch (err) {
      console.error('Помилка при завантаженні даних проєкту:', err);
      this.setState({ loading: false });
      Alert.alert('Помилка', `Не вдалося завантажити дані проєкту: ${err.message}`);
    }
  };
  
  // Функція оновлення прогресу проєкту
  updateProjectProgress = async (progress: number) => {
    try {
      const { currentRow, totalRows } = this.state;
      const { projectId, onRefresh } = this.props;
      
      await database.action(async () => {
        const projectToUpdate = await database.get('projects').find(projectId);
        await projectToUpdate.update(project => {
          project.progress = progress;
          project.currentRow = currentRow;
          project.totalRows = totalRows;
        });
      });
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Помилка при оновленні прогресу:', err);
    }
  };
  
  // Збільшення лічильника на вказану кількість
  incrementCounter = (amount: number) => {
    const { currentRow, totalRows } = this.state;
    const newValue = currentRow + amount;
    this.setState({
      currentRow: newValue <= totalRows ? newValue : totalRows
    });
  };
  
  // Зменшення лічильника на вказану кількість
  decrementCounter = (amount: number) => {
    const { currentRow } = this.state;
    const newValue = currentRow - amount;
    this.setState({
      currentRow: newValue >= 0 ? newValue : 0
    });
  };
  
  // Скидання лічильника
  resetCounter = () => {
    Alert.alert(
      'Скидання лічильника',
      'Ви впевнені, що хочете скинути лічильник до 0?',
      [
        {
          text: 'Скасувати',
          style: 'cancel'
        },
        {
          text: 'Скинути',
          onPress: () => this.setState({ currentRow: 0 })
        }
      ]
    );
  };
  
  // Зміна загальної кількості рядів
  handleTotalRowsChange = (text: string) => {
    const value = parseInt(text) || 0;
    this.setState({
      totalRows: value > 0 ? value : 1
    });
  };
  
  // Зміна поточного ряду
  handleCurrentRowChange = (text: string) => {
    const { totalRows } = this.state;
    const value = parseInt(text) || 0;
    this.setState({
      currentRow: value >= 0 ? (value <= totalRows ? value : totalRows) : 0
    });
  };
  
  // Зміна кроку збільшення/зменшення
  handleCustomIncrementChange = (text: string) => {
    const value = parseInt(text) || 0;
    this.setState({
      customIncrement: value > 0 ? value : 1
    });
  };
  
  render() {
    const { loading, projectData, currentRow, totalRows, customIncrement } = this.state;
    
    if (loading && !projectData) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B8A5E" />
          <Text style={styles.loadingText}>Завантаження лічильника...</Text>
        </View>
      );
    }
    
    return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6B8A5E" />
        </View>
      )}
      
      {/* Блок прогресу */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Прогрес</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Ряд: {currentRow} з {totalRows}</Text>
            <Text style={styles.progressPercentage}>
              {totalRows > 0 ? Math.min(Math.round((currentRow / totalRows) * 100), 100) : 0}%
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[styles.progressBar, { width: `${totalRows > 0 ? Math.min(Math.round((currentRow / totalRows) * 100), 100) : 0}%` }]} 
            />
          </View>
        </View>
        
        <View style={styles.rowsInputContainer}>
          <View style={styles.rowInputGroup}>
            <Text style={styles.inputLabel}>Поточний ряд:</Text>
            <TextInput
              style={styles.rowInput}
              value={currentRow.toString()}
              onChangeText={this.handleCurrentRowChange}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.rowInputGroup}>
            <Text style={styles.inputLabel}>Усього рядів:</Text>
            <TextInput
              style={styles.rowInput}
              value={totalRows.toString()}
              onChangeText={this.handleTotalRowsChange}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
      
      {/* Блок лічильника */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Лічильник рядів</Text>
        
        {/* Кнопки швидкого доступу */}
        <View style={styles.quickButtonsContainer}>
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => this.decrementCounter(5)}
          >
            <Text style={styles.quickButtonText}>-5</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => this.decrementCounter(1)}
          >
            <Text style={styles.quickButtonText}>-1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={this.resetCounter}
          >
            <RotateCcw size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => this.incrementCounter(1)}
          >
            <Text style={styles.quickButtonText}>+1</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickButton}
            onPress={() => this.incrementCounter(5)}
          >
            <Text style={styles.quickButtonText}>+5</Text>
          </TouchableOpacity>
        </View>
        
        {/* Основний лічильник */}
        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => this.decrementCounter(customIncrement)}
          >
            <Minus size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.counterValueContainer}>
            <Text style={styles.counterValue}>{currentRow}</Text>
            <Text style={styles.counterLabel}>поточний ряд</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => this.incrementCounter(customIncrement)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Налаштування кроку */}
        <View style={styles.customIncrementContainer}>
          <Text style={styles.customIncrementLabel}>Крок зміни:</Text>
          <TextInput
            style={styles.customIncrementInput}
            value={customIncrement.toString()}
            onChangeText={this.handleCustomIncrementChange}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      {/* Підказки */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipTitle}>Підказки:</Text>
        <Text style={styles.tipText}>• Натисніть на кнопки +/- для зміни поточного ряду</Text>
        <Text style={styles.tipText}>• Використовуйте кнопку скидання для обнулення лічильника</Text>
        <Text style={styles.tipText}>• Змініть крок для збільшення/зменшення значення на потрібну кількість</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Зберегти зміни" 
          onPress={() => this.updateProjectProgress(Math.min(Math.round((currentRow / totalRows) * 100), 100))}
          style={styles.saveButton} 
        />
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B8A5E',
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B8A5E',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5EBE2',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6B8A5E',
    borderRadius: 6,
  },
  rowsInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  rowInputGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B8A5E',
    marginBottom: 4,
  },
  rowInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2E3E28',
  },
  // Блок лічильника
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickButton: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  counterButton: {
    backgroundColor: '#6B8A5E',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValueContainer: {
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 4,
  },
  counterLabel: {
    fontSize: 14,
    color: '#6B8A5E',
  },
  customIncrementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIncrementLabel: {
    fontSize: 14,
    color: '#6B8A5E',
    marginRight: 8,
  },
  customIncrementInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    color: '#2E3E28',
    width: 60,
    textAlign: 'center',
  },
  // Підказки
  tipsSection: {
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#5D4037',
    marginBottom: 4,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  saveButton: {
    backgroundColor: '#6B8A5E',
  },
});

export default SimpleProjectCounterTab;