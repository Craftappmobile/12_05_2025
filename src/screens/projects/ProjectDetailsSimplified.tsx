/**
 * Спрощений компонент деталей проєкту для підтримки Bridgeless режиму
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Calendar, Star } from 'lucide-react-native';

/**
 * Інтерфейс для параметрів
 */
interface ProjectDetailsSimplifiedProps {
  route?: {
    params?: {
      projectId?: string;
    };
  };
  navigation: any;
}

/**
 * Клас-компонент з явно встановленим displayName
 * Цей компонент має всі необхідні атрибути для роботи в Bridgeless режимі
 */
class ProjectDetailsSimplified extends React.Component<ProjectDetailsSimplifiedProps> {
  // Для Bridgeless режиму обов'язково потрібен displayName
  static displayName = 'ProjectDetailsSimplified';
  
  state = {
    loading: true,
    project: null as any,
    error: null
  };
  
  // Забезпечуємо, що render також має displayName
  render = Object.assign(
    function(this: ProjectDetailsSimplified) {
      const { loading, project, error } = this.state;
      const { route, navigation } = this.props;
      const projectId = route?.params?.projectId || 'unknown';
      
      // Показуємо індикатор завантаження
      if (loading) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6B8A5E" />
            <Text style={styles.loadingText}>Завантаження деталей проєкту...</Text>
          </View>
        );
      }
      
      // Показуємо повідомлення про помилку
      if (error) {
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>Помилка: {String(error)}</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Повернутися</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      // Якщо проєкт ще не завантажено
      if (!project) {
        return (
          <View style={styles.centerContainer}>
            <Text style={styles.infoText}>Проєкт не знайдено</Text>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Повернутися до списку</Text>
            </TouchableOpacity>
          </View>
        );
      }
      
      // Основний вигляд компонента
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
              {project.name}
            </Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Star size={24} color="#6B8A5E" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {/* Статус проєкту */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Статус</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>В процесі</Text>
              </View>
            </View>
            
            {/* Опис проєкту */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Опис</Text>
              <Text style={styles.description}>
                {project.description || 
                  "Це спрощений компонент для діагностики проблем з displayName у Bridgeless режимі. Після виправлення помилок буде відновлена робота основного компонента."}
              </Text>
            </View>
            
            {/* Дати */}
            <View style={styles.card}>
              <Text style={styles.subtitle}>Дати</Text>
              <View style={styles.dateRow}>
                <Calendar size={16} color="#6B8A5E" />
                <Text style={styles.dateLabel}>Створено:</Text>
                <Text style={styles.dateValue}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            {/* Повідомлення про тестовий режим */}
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>Тестовий режим</Text>
              <Text style={styles.noticeText}>
                Цей компонент використовується для перевірки роботи в Bridgeless режимі.
                Після виправлення помилок з displayName буде використовуватись повноцінний компонент.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton2}
              onPress={() => alert('Ця функція буде доступна в повній версії')}
            >
              <Text style={styles.actionButtonText}>Переглянути розрахунки</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    },
    { displayName: 'ProjectDetailsSimplified.render' }
  );
  
  componentDidMount = Object.assign(
    function(this: ProjectDetailsSimplified) {
      // Імітуємо завантаження проєкту
      setTimeout(() => {
        try {
          // Очищаємо кеш якщо потрібно
          if (global.__WATERMELONDB_SHOULD_RESET_CACHE__) {
            console.log('Скидання кешу WatermelonDB для ProjectDetailsSimplified');
            delete global.__WATERMELONDB_SHOULD_RESET_CACHE__;
          }
          
          this.setState({ 
            loading: false, 
            project: { 
              id: this.props.route?.params?.projectId || '1',
              name: "Тестовий проєкт для Bridgeless",
              description: "Це спрощений компонент для діагностики проблем з displayName в Bridgeless режимі",
              status: "in_progress",
              progress: 70,
              createdAt: new Date(),
              calculations: [{ id: '1', calculatorType: 'yarn', calculatorTitle: 'Розрахунок пряжі', createdAt: new Date() }]
            } 
          });
        } catch (error) {
          console.error('Помилка при імітації завантаження проєкту:', error);
          this.setState({ 
            loading: false, 
            error: String(error)
          });
        }
      }, 1500);
    },
    { displayName: 'ProjectDetailsSimplified.componentDidMount' }
  );
}

// Стилі для компонента
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: { 
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  backButton: { 
    padding: 4
  },
  actionButton: {
    padding: 4,
    marginLeft: 8
  },
  title: { 
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
    marginLeft: 16,
    flex: 1,
  },
  content: { 
    flex: 1,
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee'
  },
  subtitle: {
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
  statusBadge: { 
    backgroundColor: '#6B8A5E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  statusText: { 
    fontSize: 14,
    color: '#fff'
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B8A5E',
    marginLeft: 8,
    marginRight: 8
  },
  dateValue: {
    fontSize: 14,
    color: '#4A6741'
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
  infoText: {
    fontSize: 16,
    color: '#6B8A5E',
    marginBottom: 16,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  },
  notice: {
    padding: 16,
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    marginBottom: 16
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D4037',
    marginBottom: 8
  },
  noticeText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20
  },
  actionButton2: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

// Експортуємо компонент
export default ProjectDetailsSimplified;