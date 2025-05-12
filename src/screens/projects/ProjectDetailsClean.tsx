/**
 * Спрощений компонент деталей проєкту для усунення помилки displayName
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

class ProjectDetailsClean extends React.Component {
  // Явно встановлюємо displayName
  static displayName = 'ProjectDetailsClean';
  
  state = {
    loading: true,
    project: null,
    error: null
  };
  
  componentDidMount() {
    // Імітуємо завантаження даних
    setTimeout(() => {
      this.setState({ 
        loading: false, 
        project: { 
          name: "Тестовий проєкт",
          description: "Це спрощена версія компонента для уникнення помилки displayName",
          status: "in_progress",
          createdAt: new Date()
        } 
      });
    }, 1000);
  }
  
  render() {
    const { loading, project, error } = this.state;
    const { navigation } = this.props;
    
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6B8A5E" />
          <Text style={styles.loadingText}>Завантаження деталей проєкту...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Помилка: {error.message}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Повернутися</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (!project) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Проєкт не знайдено</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Повернутися</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        {/* Заголовок з кнопкою повернення */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color="#2E3E28" />
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {project.name}
          </Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.subtitle}>Опис</Text>
            <Text style={styles.description}>
              {project.description}
            </Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.subtitle}>Статус</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>В процесі</Text>
            </View>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.subtitle}>Дата створення</Text>
            <Text style={styles.date}>
              {project.createdAt.toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Це спрощена версія компонента для діагностики проблеми з displayName.
              Після виправлення буде відновлена повна функціональність.
            </Text>
          </View>
        </ScrollView>
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
    marginLeft: 16
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
  date: {
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
  noticeText: {
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 20
  }
});

// Експортуємо як основний компонент
export default ProjectDetailsClean;