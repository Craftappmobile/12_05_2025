import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Button } from '../../../components/ui';
import Text from '../../components/Text';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import { database, calculationsCollection } from '../../database';

const CalculationDetails: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { calculationId } = route.params;
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Завантаження деталей розрахунку
  const fetchCalculationDetails = async () => { try {
      setLoading(true);
      
      // Отримуємо розрахунок за ID
      const calculationRecord = await calculationsCollection.find(calculationId);
      
      // Отримуємо проект, до якого належить розрахунок
      const project = await calculationRecord.project.fetch();
      
      // Перетворюємо розрахунок у формат, який потрібен для відображення
      const calculationData = {
        id: calculationRecord.id,
        calculatorType: calculationRecord.calculatorType,
        calculatorTitle: calculationRecord.calculatorTitle,
        inputValues: calculationRecord.inputValues,
        results: calculationRecord.results,
        notes: calculationRecord.notes,
        createdAt: calculationRecord.createdAt,
        project: {
          id: project.id,
          name: project.name },
      };
      
      setCalculation(calculationData);
      setLoading(false);
    } catch (err) {
      console.error('Помилка при завантаженні деталей розрахунку:', err);
      setError(err instanceof Error ? err : new Error('Невідома помилка'));
      setLoading(false);
    }
  };

  // Завантаження деталей розрахунку при монтуванні компонента
  useEffect(() => {
    fetchCalculationDetails();
  }, [calculationId]);

  // Функція для видалення розрахунку
  const handleDeleteCalculation = () => {
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
              const calculationRecord = await calculationsCollection.find(calculationId);
              
              await database.write(async () => {
                await calculationRecord.markAsDeleted();
              });
              
              navigation.goBack();
            } catch (err) {
              console.error('Помилка при видаленні розрахунку:', err);
              Alert.alert(
                'Помилка',
                'Не вдалося видалити розрахунок. Спробуйте ще раз.',
                [{ text: 'OK' }]
              );
            }
          }
        },
      ]
    );
  };

  // Відображення індикатора завантаження
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B8A5E" />
        <Text style={styles.loadingText}>Завантаження деталей розрахунку...</Text>
      </View>
    );
  }

  // Відображення повідомлення про помилку
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Помилка: {error.message}</Text>
        <Button 
          title="Спробувати знову" 
          onPress={fetchCalculationDetails} 
          style={styles.retryButton}
        />
      </View>
    );
  }

  // Якщо розрахунок не знайдено
  if (!calculation) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Розрахунок не знайдено</Text>
        <Button 
          title="Повернутися назад" 
          onPress={() => navigation.goBack()} 
          style={styles.retryButton}
        />
      </View>
    );
  }

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
        
        <Text style={styles.title} numberOfLines={1}>
          {calculation.calculatorTitle}
        </Text>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDeleteCalculation}
        >
          <Trash2 size={24} color="#D32F2F" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Інформація про розрахунок */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Проект:</Text>
            <Text style={styles.infoValue}>{calculation.project.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Дата створення:</Text>
            <Text style={styles.infoValue}>
              {new Date(calculation.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Тип калькулятора:</Text>
            <Text style={styles.infoValue}>{calculation.calculatorType}</Text>
          </View>
        </View>

        {/* Вхідні дані */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Вхідні дані:</Text>
          {Object.entries(calculation.inputValues).map(([key, value]) => (
            <View key={key} style={styles.dataRow}>
              <Text style={styles.dataLabel}>{key}:</Text>
              <Text style={styles.dataValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Результати */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Результати:</Text>
          {Object.entries(calculation.results).map(([key, value]) => (
            <View key={key} style={styles.dataRow}>
              <Text style={styles.dataLabel}>{key}:</Text>
              <Text style={styles.dataValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Нотатки */}
        {calculation.notes && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Нотатки:</Text>
            <Text style={styles.notesText}>{calculation.notes}</Text>
          </View>
        )}
      </ScrollView>
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
    color: '#2E3E28',
    flex: 1,
    textAlign: 'center' },
  deleteButton: { padding: 4 },
  content: { flex: 1,
    padding: 16 },
  infoContainer: { backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee' },
  infoRow: { flexDirection: 'row',
    marginBottom: 8 },
  infoLabel: { fontSize: 14,
    color: '#6B8A5E',
    marginRight: 8,
    width: 120 },
  infoValue: { fontSize: 14,
    color: '#2E3E28',
    flex: 1 },
  sectionContainer: { backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee' },
  sectionTitle: { fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 12 },
  dataRow: { flexDirection: 'row',
    marginBottom: 8 },
  dataLabel: { fontSize: 14,
    color: '#6B8A5E',
    marginRight: 8,
    flex: 1 },
  dataValue: { fontSize: 14,
    fontWeight: '500',
    color: '#2E3E28',
    flex: 1,
    textAlign: 'right' },
  notesText: { fontSize: 14,
    color: '#4A6741',
    lineHeight: 20 },
  centerContainer: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16 },
  loadingText: { marginTop: 16,
    fontSize: 16,
    color: '#4A6741' },
  errorText: { fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center' },
  retryButton: { backgroundColor: '#6B8A5E' },
});


// Встановлюємо displayName для компонента
CalculationDetails.displayName = "CalculationDetails";

// Імпортуємо безпечну обгортку
import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Створюємо стабільний компонент-обгортку (класовий компонент для кращої сумісності)
export default createSafeNavigationComponent(CalculationDetails, "CalculationDetails");
