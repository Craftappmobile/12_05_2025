import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { useProjects } from '../../hooks/useProjects';

// Компонент для відображення проекту з прогресом
const ProjectItem = ({ project, onPress, onDelete }) => {
  if (!project) return null;
  
  // Функція для форматування дати
  const formatDate = (date) => {
    if (!date) return 'Дата невідома';
    try {
      const d = new Date(date);
      return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
    } catch (e) {
      console.error('Помилка форматування дати:', e);
      return 'Невірний формат дати';
    }
  };

  // Отримуємо кількість розрахунків та потрібне закінчення для слова
  const calculationsCount = project.calculations?.length || 0;
  const getCalculationCountSuffix = (count) => {
    if (count === 1) return '';
    if (count >= 2 && count <= 4) return 'и';
    return 'ів';
  };
  
  // Визначаємо текст статусу та прогрес
  const getStatusText = () => {
    switch(project.status) {
      case 'planned': return 'Не почато';
      case 'in_progress': return 'В процесі';
      case 'completed': return 'Завершено';
      case 'archived': return 'Архівовано';
      default: return 'Невідомо';
    }
  };
  
  // Визначаємо прогрес у відсотках
  const getProgress = () => {
    // Якщо прогрес встановлено явно, використовуємо його
    if (typeof project.progress === 'number') {
      return project.progress;
    }
    
    // Інакше визначаємо на основі статусу
    switch(project.status) {
      case 'planned': return 0;
      case 'completed': return 100;
      case 'in_progress': return 70;
      case 'archived': return 100;
      default: return 0;
    }
  };
  
  // Визначаємо, яку дату показувати
  const getDateLabel = () => {
    if (project.endDate) return `Завершено: ${formatDate(project.endDate)}`;
    if (project.startDate) return `Початок: ${formatDate(project.startDate)}`;
    return `Створено: ${formatDate(project.createdAt)}`;
  };
  
  // Визначаємо тип пряжі
  const getYarnType = () => {
    // TODO: додати поле з типом пряжі в модель
    // Наразі просто повернемо dummy дані
    const dummyYarnTypes = ['Merino Wool', 'Alpaca Blend', 'Sock Yarn', 'Cotton Blend'];
    return dummyYarnTypes[Math.floor(Math.random() * dummyYarnTypes.length)];
  };
  
  const progress = getProgress();
  
  return (
    <View style={styles.projectItem}>
      <View style={styles.projectContent}>
        <Text style={styles.projectName}>🔵 {project.name || 'Без назви'}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {getStatusText()} • {progress}%
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>
        
        <Text style={styles.yarnTypeText}>Пряжа: {getYarnType()}</Text>
        <Text style={styles.dateText}>{getDateLabel()}</Text>
        <Text style={styles.calculationsCountText}>
          🧮 {calculationsCount} розрахунк{getCalculationCountSuffix(calculationsCount)}
        </Text>
        
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.openButton}
            onPress={onPress}
          >
            <Text style={styles.openButtonText}>Відкрити проєкт</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Компонент фільтра
const FilterDropdown = ({ currentFilter, onFilterChange }) => {
  const [expanded, setExpanded] = useState(false);
  
  const filters = [
    { key: 'all', label: 'Всі проєкти' },
    { key: 'in_progress', label: 'В процесі' },
    { key: 'completed', label: 'Завершені' },
    { key: 'planned', label: 'Не почато' },
    { key: 'archived', label: 'Архівовані' },
  ];
  
  const currentFilterLabel = filters.find(f => f.key === currentFilter)?.label || 'Всі проєкти';
  
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.filterButtonText}>
          Фільтр: {currentFilterLabel}
        </Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.filterDropdown}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterItem, filter.key === currentFilter && styles.filterItemActive]}
              onPress={() => {
                onFilterChange(filter.key);
                setExpanded(false);
              }}
            >
              <Text 
                style={[styles.filterItemText, filter.key === currentFilter && styles.filterItemTextActive]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// Головний компонент списку проектів
const ProjectsList = ({ navigation }) => {
  // Використовуємо хук для роботи з проектами
  const projectsHook = { projects: [], loading: false, error: null };
  try {
    Object.assign(projectsHook, useProjects());
  } catch (error) {
    console.error('Error using projects hook:', error);
  }
  
  const { projects, loading, error, fetchProjects, deleteProject } = projectsHook;
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Фільтрація проєктів
  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });
  
  // Безпечний useEffect з перевіркою на наявність слухача
  useEffect(() => {
    if (!navigation || !navigation.addListener) {
      console.log('Navigation object is undefined or missing addListener method');
      return () => {};
    }
    
    try {
      const unsubscribe = navigation.addListener('focus', () => {
        fetchProjects && fetchProjects();
      });
      
      return unsubscribe;
    } catch (e) {
      console.error('Error in navigation listener setup:', e);
      return () => {};
    }
  }, [navigation, fetchProjects]);
  
  // Функція оновлення
  const handleRefresh = async () => {
    if (!fetchProjects) return;
    
    setRefreshing(true);
    try {
      await fetchProjects();
    } catch (e) {
      console.error('Error refreshing projects:', e);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Функція видалення
  const handleDeleteProject = (projectId) => {
    if (!deleteProject || !projectId) return;
    
    Alert.alert(
      'Видалення проекту',
      'Ви впевнені, що хочете видалити цей проект?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: () => {
            try {
              deleteProject(projectId);
            } catch (e) {
              console.error('Error deleting project:', e);
            }
          }
        },
      ]
    );
  };
  
  // Відображення завантаження
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6B8A5E" />
        <Text style={styles.loadingText}>Завантаження проектів...</Text>
      </View>
    );
  }
  
  // Відображення помилки
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Сталася помилка: {error.message || 'Невідома помилка'}
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchProjects}
        >
          <Text style={styles.retryButtonText}>Спробувати знову</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Відображення списку проєктів
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мої Проєкти</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <FilterDropdown 
          currentFilter={filter} 
          onFilterChange={setFilter} 
        />
        
        <TouchableOpacity 
          style={styles.newProjectButton}
          onPress={() => {
            try {
              navigation && navigation.navigate && navigation.navigate('CreateProject');
            } catch (e) {
              console.error('Error navigating to CreateProject:', e);
            }
          }}
        >
          <Text style={styles.newProjectButtonText}>+ НОВИЙ ПРОЄКТ</Text>
        </TouchableOpacity>
      </View>
      
      {(!filteredProjects || filteredProjects.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'all' 
              ? 'У вас ще немає проєктів' 
              : `Немає проєктів з статусом "${filter === 'in_progress' ? 'В процесі' : 
                  filter === 'completed' ? 'Завершено' : 
                  filter === 'planned' ? 'Не почато' : 'Архівовано'}"`
            }
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => {
              try {
                navigation && navigation.navigate && navigation.navigate('CreateProject');
              } catch (e) {
                console.error('Error navigating to CreateProject:', e);
              }
            }}
          >
            <Text style={styles.createButtonText}>Створити проєкт</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={({ item }) => (
            <ProjectItem
              project={item}
              onPress={() => {
                try {
                  if (navigation && navigation.navigate && item && item.id) {
                    navigation.navigate('ProjectDetails', { projectId: item.id });
                  }
                } catch (e) {
                  console.error('Error navigating to ProjectDetails:', e);
                }
              }}
              onDelete={() => handleDeleteProject(item && item.id)}
            />
          )}
          keyExtractor={(item) => (item && item.id) ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    color: '#4A6741',
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1001,
  },
  filterItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  filterItemActive: {
    backgroundColor: '#f1f5f0',
  },
  filterItemText: {
    color: '#4A6741',
  },
  filterItemTextActive: {
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  newProjectButton: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  newProjectButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },
  projectItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  projectContent: {
    padding: 16,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f1f5f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6B8A5E',
  },
  yarnTypeText: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 4,
  },
  calculationsCountText: {
    fontSize: 14,
    color: '#4A6741',
    marginBottom: 12,
  },
  buttonsContainer: {
    marginTop: 8,
  },
  openButton: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4A6741',
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#4A6741',
    marginBottom: 16,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// Встановлюємо displayName для компоненту
ProjectsList.displayName = "ProjectsList";

// Імпортуємо безпечну обгортку
import { createSafeNavigationComponent } from '../../utils/enhanceComponents';

// Створюємо стабільний компонент-обгортку (класовий компонент для кращої сумісності)
export default createSafeNavigationComponent(ProjectsList, "ProjectsList");
