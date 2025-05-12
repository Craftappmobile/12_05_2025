/**
 * Стабільний покращений компонент деталей проєкту
 * 
 * Реалізує інтерфейс, описаний у вимогах UX:
 * - Заголовок проєкту
 * - Індикатор прогресу
 * - Таби (Нотатки, Лічильник, Розрахунки)
 * - Вміст вкладок відповідно до вибраного табу
 * 
 * Цей компонент використовує спрощені версії вкладок, що не залежать від withObservables
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Edit, Trash2, ArrowLeft, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { database } from '../../database';

// Імпортуємо спрощені версії вкладок, що не використовують withObservables
import SimpleProjectNotesTab from './SimpleProjectNotesTab';
import SimpleProjectCounterTab from './SimpleProjectCounterTab';
import SimpleProjectCalculationsTab from './SimpleProjectCalculationsTab';

// Інтерфейс для типізації props
interface StableImprovedProjectDetailsProps {
  navigation: any;
  route: {
    params?: {
      projectId?: string;
    };
  };
}

// Інтерфейс для типізації state
interface StableImprovedProjectDetailsState {
  loading: boolean;
  error: Error | null;
  project: any;
  activeTab: string;
  progress: number;
}

/**
 * Класовий компонент для відображення деталей проєкту
 * Використовуємо клас замість функції для уникнення проблем з displayName
 * у Bridgeless режимі
 */
class StableImprovedProjectDetails extends React.Component<StableImprovedProjectDetailsProps, StableImprovedProjectDetailsState> {
  // Важливо встановити displayName для компонента
  static displayName = 'StableImprovedProjectDetails';
  
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      error: null,
      project: null,
      activeTab: 'notes', // Початковий таб - 'notes'
      progress: 70,       // Прогрес проєкту за замовчуванням
    };
  }
  
  componentDidMount() {
    this.fetchProjectDetails();
  }
  
  // Завантаження деталей проекту
  fetchProjectDetails = async () => {
    try {
      const { route } = this.props;
      if (!route?.params?.projectId) {
        this.setState({ loading: false, error: new Error('ID проєкту не передано') });
        return;
      }
      
      const { projectId } = route.params;
      this.setState({ loading: true });
      
      // Отримуємо колекцію проектів
      const projectsCollection = database.get('projects');
      
      // Отримуємо проект за ID
      const projectRecord = await projectsCollection.find(projectId);
      
      // Перетворюємо проект у формат, який потрібен для відображення
      const projectData = {
        id: projectRecord.id,
        name: projectRecord.name,
        description: projectRecord.description,
        status: projectRecord.status,
        progress: projectRecord.progress || 0, // Додаємо поле progress
        startDate: projectRecord.startDate,
        endDate: projectRecord.endDate,
        isFavorite: projectRecord.isFavorite,
        createdAt: projectRecord.createdAt,
        updatedAt: projectRecord.updatedAt,
      };
      
      this.setState({
        project: projectData,
        loading: false,
        error: null,
        progress: projectData.progress || 70 // Використовуємо progress з бази даних або значення за замовч
      });
      
    } catch (err) {
      console.error('Помилка при завантаженні деталей проекту:', err);
      this.setState({
        loading: false,
        error: err instanceof Error ? err : new Error('Невідома помилка')
      });
    }
  };

  // Функція для переключення статусу "улюблений"
  toggleFavorite = async () => {
    try {
      const { project } = this.state;
      if (!project) return;
      
      // Отримуємо колекцію проектів
      const projectsCollection = database.get('projects');
      const projectRecord = await projectsCollection.find(project.id);
      
      // Оновлюємо запис
      await projectRecord.update(proj => {
        proj.isFavorite = !project.isFavorite;
      });
      
      // Оновлюємо локальний стан
      this.fetchProjectDetails();
    } catch (err) {
      console.error('Помилка при оновленні статусу:', err);
      Alert.alert('Помилка', 'Не вдалося оновити статус проекту');
    }
  };

  // Функція для отримання тексту статусу
  getStatusText = (status) => {
    switch (status) {
      case 'planned': return 'Заплановано';
      case 'in_progress': return 'В процесі';
      case 'completed': return 'Завершено';
      case 'archived': return 'Архівовано';
      default: return 'Невідомо';
    }
  };
  
  // Зміна активної вкладки
  setActiveTab = (tab) => {
    this.setState({ activeTab: tab });
  };
  
  // Оновлення прогресу
  updateProgress = (progress) => {
    this.setState({ progress });
  };
  
  render() {
    const { loading, error, project, activeTab, progress } = this.state;
    const { navigation, route } = this.props;
    const projectId = route?.params?.projectId;
    
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6B8A5E" />
          <Text style={styles.loadingText}>Завантаження деталей проекту...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Помилка: {error.message}</Text>
          <Button 
            title="Спробувати знову" 
            onPress={this.fetchProjectDetails} 
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (!project) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Проект не знайдено</Text>
          <Button 
            title="Повернутися до списку" 
            onPress={() => navigation?.goBack()} 
            style={styles.retryButton}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        {/* Заголовок з кнопками навігації */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
          >
            <ArrowLeft size={20} color="#2E3E28" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navigationButton}>
            <ChevronLeft size={20} color="#2E3E28" />
          </TouchableOpacity>
          
          <Text style={styles.title} numberOfLines={1}>
            {project.name}
          </Text>
          
          <TouchableOpacity style={styles.navigationButton}>
            <ChevronRight size={20} color="#2E3E28" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={this.toggleFavorite}
            >
              <Star 
                size={20} 
                color="#6B8A5E" 
                fill={project.isFavorite ? "#6B8A5E" : "none"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Статус і прогрес */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{this.getStatusText(project.status)}</Text>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>

        {/* Індикатор прогресу */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {/* Вкладки проекту */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'notes' && styles.activeTabButton]}
            onPress={() => this.setActiveTab('notes')}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Нотатки</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'counter' && styles.activeTabButton]}
            onPress={() => this.setActiveTab('counter')}
          >
            <Text style={[styles.tabText, activeTab === 'counter' && styles.activeTabText]}>Лічильник</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'calculations' && styles.activeTabButton]}
            onPress={() => this.setActiveTab('calculations')}
          >
            <Text style={[styles.tabText, activeTab === 'calculations' && styles.activeTabText]}>Розрахунки</Text>
          </TouchableOpacity>
        </View>
        
        {/* Вміст вкладки */}
        {activeTab === 'notes' && (
          <SimpleProjectNotesTab 
            projectId={projectId} 
            onRefresh={this.fetchProjectDetails}
          />
        )}
        
        {activeTab === 'counter' && (
          <SimpleProjectCounterTab 
            projectId={projectId} 
            onRefresh={this.fetchProjectDetails}
            onProgressChange={this.updateProgress}
          />
        )}
        
        {activeTab === 'calculations' && (
          <SimpleProjectCalculationsTab 
            projectId={projectId} 
            onRefresh={this.fetchProjectDetails}
            navigation={navigation}
          />
        )}
      </View>
    );
  }
}

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
  navigationButton: {
    padding: 4,
  },
  title: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
    flex: 1,
    textAlign: 'center'
  },
  headerActions: { 
    flexDirection: 'row'
  },
  actionButton: { 
    padding: 4,
  },
  // Статус і прогрес
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B8A5E'
  },
  progressText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E3E28'
  },
  // Індикатор прогресу
  progressContainer: {
    height: 8,
    backgroundColor: '#E5EBE2',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6B8A5E',
  },
  // Вкладки
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center'
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
  // Центрований контейнер для завантаження/помилок
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
});

export default StableImprovedProjectDetails;