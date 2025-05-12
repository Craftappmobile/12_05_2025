/**
 * Стабільна обгортка для компонента ProjectDetails з підтримкою Bridgeless режиму
 * 
 * Цей файл створює повністю незалежний компонент
 * для уникнення помилок з displayName у Bridgeless режимі
 *
 * ПОВНА ПЕРЕРОБКА: Замість обгортки для існуючого компонента
 * тепер це повністю автономний компонент без залежностей
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Button } from '../../components/ui';
import Text from '../../components/Text';
import { Edit, Trash2, ArrowLeft, Plus, Star } from 'lucide-react-native';
import { database } from '../../database';

// Для запобігання помилок створюємо повністю незалежний компонент

const StableBridgelessProjectDetails = (props) => {
  // Створюємо локальний стан для компонента
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  
  // Захист від відсутніх параметрів
  if (!props?.route?.params?.projectId) {
    useEffect(() => {
      setTimeout(() => {
        if (props?.navigation?.goBack) {
          props.navigation.goBack();
        }
      }, 2000);
    }, []);
    
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Помилка: ID проєкту не передано</Text>
      </View>
    );
  }
  
  const { projectId } = props.route.params;
  
  // Завантаження деталей проекту
  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      
      // Отримуємо колекцію проектів
      const projectsCollection = database.get('projects');
      
      // Отримуємо проект за ID
      const projectRecord = await projectsCollection.find(projectId);
      
      // Отримуємо розрахунки для проекту
      const calculations = await projectRecord.calculations.fetch();
      
      // Перетворюємо проект у формат, який потрібен для відображення
      const projectWithCalculations = {
        id: projectRecord.id,
        name: projectRecord.name,
        description: projectRecord.description,
        status: projectRecord.status,
        startDate: projectRecord.startDate,
        endDate: projectRecord.endDate,
        isFavorite: projectRecord.isFavorite,
        createdAt: projectRecord.createdAt,
        updatedAt: projectRecord.updatedAt,
        calculations: calculations.map(calc => ({
          id: calc.id,
          calculatorType: calc.calculatorType,
          calculatorTitle: calc.calculatorTitle,
          inputValues: calc.inputValues,
          results: calc.results,
          notes: calc.notes,
          createdAt: calc.createdAt 
        })),
      };
      
      setProject(projectWithCalculations);
      setLoading(false);
    } catch (err) {
      console.error('Помилка при завантаженні деталей проекту:', err);
      setError(err instanceof Error ? err : new Error('Невідома помилка'));
      setLoading(false);
    }
  };

  // Завантаження деталей проекту при монтуванні компонента
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Функція для переключення статусу "улюблений"
  const toggleFavorite = async () => {
    if (project) {
      try {
        // Отримуємо колекцію проектів
        const projectsCollection = database.get('projects');
        const projectRecord = await projectsCollection.find(project.id);
        
        // Оновлюємо запис
        await projectRecord.update(proj => {
          proj.isFavorite = !project.isFavorite;
        });
        
        // Оновлюємо локальний стан
        fetchProjectDetails();
      } catch (err) {
        console.error('Помилка при оновленні статусу:', err);
        Alert.alert('Помилка', 'Не вдалося оновити статус проекту');
      }
    }
  };

  // Функція для видалення проекту
  const handleDeleteProject = () => {
    if (!project) return;
    
    Alert.alert(
      'Видалення проекту',
      `Ви впевнені, що хочете видалити проект "${project.name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: async () => {
            try {
              const projectsCollection = database.get('projects');
              const projectRecord = await projectsCollection.find(project.id);
              await projectRecord.markAsDeleted();
              await database.adapter.batch();
              
              if (props?.navigation?.goBack) {
                props.navigation.goBack();
              }
            } catch (err) {
              console.error('Помилка при видаленні проекту:', err);
              Alert.alert('Помилка', 'Не вдалося видалити проект');
            }
          }
        },
      ]
    );
  };

  // Функція для переходу до деталей розрахунку
  const navigateToCalculationDetails = (calculationId) => {
    if (props?.navigation?.navigate) {
      props.navigation.navigate('CalculationDetails', { calculationId });
    }
  };

  // Функція для отримання тексту статусу
  const getStatusText = (status) => {
    switch (status) {
      case 'planned': return 'Заплановано';
      case 'in_progress': return 'В процесі';
      case 'completed': return 'Завершено';
      case 'archived': return 'Архівовано';
      default: return 'Невідомо';
    }
  };

  // Функція для отримання кольору статусу
  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return '#E5EBE2';
      case 'in_progress': return '#6B8A5E';
      case 'completed': return '#4CAF50';
      case 'archived': return '#9E9E9E';
      default: return '#E5EBE2';
    }
  };
  
  // Навігація до редагування проекту
  const navigateToEditProject = () => {
    if (props?.navigation?.navigate && project) {
      props.navigation.navigate('EditProject', { project });
    }
  };
  
  // Навігація до списку калькуляторів
  const navigateToCalculatorsList = () => {
    if (props?.navigation?.navigate && project) {
      props.navigation.navigate('CalculatorsList', { projectId: project.id });
    }
  };

  // Відображення індикатора завантаження
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B8A5E" />
        <Text style={styles.loadingText}>Завантаження деталей проекту...</Text>
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
          onPress={fetchProjectDetails} 
          style={styles.retryButton}
        />
      </View>
    );
  }

  // Якщо проект не знайдено
  if (!project) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Проект не знайдено</Text>
        <Button 
          title="Повернутися до списку" 
          onPress={() => props?.navigation?.goBack()} 
          style={styles.retryButton}
        />
      </View>
    );
  }
  
  // Основний вміст сторінки
  return (
    <View style={styles.container}>
      {/* Заголовок з кнопками дій */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => props?.navigation?.goBack()}
        >
          <ArrowLeft size={24} color="#2E3E28" />
        </TouchableOpacity>
        
        <Text style={styles.title} numberOfLines={1}>
          {project.name}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={toggleFavorite}
          >
            <Star 
              size={24} 
              color="#6B8A5E" 
              fill={project.isFavorite ? "#6B8A5E" : "none"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={navigateToEditProject}
          >
            <Edit size={24} color="#6B8A5E" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDeleteProject}
          >
            <Trash2 size={24} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Вкладки проекту */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          <TouchableOpacity style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]}
            onPress={() => setActiveTab('info')}>
            <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>Інформація</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tabButton, activeTab === 'calculations' && styles.activeTabButton]}
            onPress={() => setActiveTab('calculations')}>
            <Text style={[styles.tabText, activeTab === 'calculations' && styles.activeTabText]}>Розрахунки</Text>
            {project.calculations.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{project.calculations.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tabButton, activeTab === 'notes' && styles.activeTabButton]}
            onPress={() => setActiveTab('notes')}>
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Нотатки</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.tabButton, activeTab === 'photos' && styles.activeTabButton]}
            onPress={() => setActiveTab('photos')}>
            <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>Фотографії</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {activeTab === 'info' && (
        <ScrollView style={styles.content}>
          {/* Інформація про проект */}
          <View style={styles.projectInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Статус:</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(project.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Дата створення:</Text>
              <Text style={styles.infoValue}>
                {new Date(project.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            {project.startDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Дата початку:</Text>
                <Text style={styles.infoValue}>
                  {new Date(project.startDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {project.endDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Дата завершення:</Text>
                <Text style={styles.infoValue}>
                  {new Date(project.endDate).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>

          {/* Опис проекту */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Опис</Text>
            <Text style={styles.description}>
              {project.description || 'Немає опису'}
            </Text>
          </View>
          
          {/* Швидкий перегляд розрахунків */}
          <View style={styles.calculationsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Розрахунки</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setActiveTab('calculations')}
              >
                <Text style={styles.viewAllText}>Переглянути всі</Text>
              </TouchableOpacity>
            </View>
            
            {project.calculations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  У цьому проекті ще немає розрахунків
                </Text>
                <Button 
                  title="Додати розрахунок" 
                  onPress={navigateToCalculatorsList} 
                  style={styles.addCalculationButton}
                />
              </View>
            ) : (
              <View style={styles.calculationsList}>
                {project.calculations.slice(0, 3).map(calculation => (
                  <TouchableOpacity 
                    key={calculation.id}
                    style={styles.calculationItem}
                    onPress={() => navigateToCalculationDetails(calculation.id)}
                  >
                    <View>
                      <Text style={styles.calculationTitle}>
                        {calculation.calculatorTitle}
                      </Text>
                      <Text style={styles.calculationDate}>
                        {new Date(calculation.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.calculationResults}>
                      {Object.entries(calculation.results || {}).slice(0, 2).map(([key, value]) => (
                        <Text key={key} style={styles.resultText} numberOfLines={1}>
                          {key}: {value}
                        </Text>
                      ))}
                      {Object.keys(calculation.results || {}).length > 2 && (
                        <Text style={styles.moreResults}>...</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                
                {project.calculations.length > 3 && (
                  <TouchableOpacity 
                    style={styles.showMoreButton}
                    onPress={() => setActiveTab('calculations')}
                  >
                    <Text style={styles.showMoreText}>
                      Показати ще {project.calculations.length - 3} розрахунки
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      )}
      
      {activeTab === 'calculations' && (
        <View style={styles.notImplementedContainer}>
          <Text style={styles.notImplementedText}>Вкладка Розрахунки буде доступна в наступних версіях</Text>
        </View>
      )}
      
      {activeTab === 'notes' && (
        <View style={styles.notImplementedContainer}>
          <Text style={styles.notImplementedText}>Вкладка Нотатки буде доступна в наступних версіях</Text>
        </View>
      )}
      
      {activeTab === 'photos' && (
        <View style={styles.notImplementedContainer}>
          <Text style={styles.notImplementedText}>Вкладка Фотографії буде доступна в наступних версіях</Text>
        </View>
      )}
    </View>
  );
};

// Встановлюємо displayName для компонента
StableBridgelessProjectDetails.displayName = 'StableBridgelessProjectDetails';

// Стилі для компонента
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: { 
    padding: 4
  },
  title: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E3E28',
    flex: 1,
    marginHorizontal: 16
  },
  headerActions: { 
    flexDirection: 'row'
  },
  actionButton: { 
    padding: 4,
    marginLeft: 8
  },
  // Вкладки
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabScroll: {
    flexGrow: 0,
  },
  tabButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#6B8A5E',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#2E3E28',
    fontWeight: '600',
  },
  badgeContainer: {
    backgroundColor: '#6B8A5E',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  content: { 
    flex: 1,
    padding: 16
  },
  projectInfo: { 
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  infoRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  infoLabel: { 
    fontSize: 14,
    color: '#6B8A5E',
    marginRight: 8,
    width: 120
  },
  infoValue: { 
    fontSize: 14,
    color: '#2E3E28'
  },
  statusBadge: { 
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  statusText: { 
    fontSize: 12,
    color: '#2E3E28'
  },
  descriptionContainer: { 
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  sectionTitle: { 
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 8
  },
  description: { 
    fontSize: 14,
    color: '#4A6741',
    lineHeight: 20
  },
  calculationsContainer: { 
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  sectionHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  addButton: { 
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B8A5E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    color: '#6B8A5E',
    fontSize: 14,
  },
  emptyContainer: { 
    padding: 16,
    alignItems: 'center'
  },
  emptyText: { 
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 16,
    textAlign: 'center'
  },
  addCalculationButton: { 
    backgroundColor: '#6B8A5E'
  },
  calculationsList: { 
    marginTop: 8
  },
  calculationItem: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  calculationTitle: { 
    fontSize: 16,
    fontWeight: '500',
    color: '#2E3E28',
    marginBottom: 4
  },
  calculationDate: { 
    fontSize: 12,
    color: '#6B8A5E'
  },
  calculationResults: { 
    flex: 1,
    marginLeft: 16
  },
  resultText: { 
    fontSize: 12,
    color: '#4A6741',
    textAlign: 'right'
  },
  moreResults: { 
    fontSize: 12,
    color: '#6B8A5E',
    textAlign: 'right'
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  showMoreText: {
    color: '#6B8A5E',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  loadingText: { 
    marginTop: 16,
    fontSize: 16,
    color: '#4A6741'
  },
  errorText: { 
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center'
  },
  retryButton: { 
    backgroundColor: '#6B8A5E'
  },
  notImplementedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notImplementedText: {
    fontSize: 16,
    color: '#6B8A5E',
    textAlign: 'center',
  },
});

// Експортуємо компонент
export default StableBridgelessProjectDetails;