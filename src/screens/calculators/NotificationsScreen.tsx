import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Bell, ArrowLeft } from 'lucide-react-native';

// Тимчасові дані для демонстрації
const dummyNotifications = [
  { 
    id: '1', 
    title: 'Ласкаво просимо!', 
    message: 'Вітаємо у додатку "Розрахуй і В\'яжи"! Тут ви знайдете всі необхідні калькулятори для в\'язання.',
    date: '15.04.2025',
    read: false
  },
  { 
    id: '2', 
    title: 'Новий калькулятор', 
    message: 'Додано новий калькулятор для розрахунку V-горловини.',
    date: '14.04.2025',
    read: true
  },
  { 
    id: '3', 
    title: 'Оновлення додатку', 
    message: 'Ми оновили додаток до версії 1.0.0. Перевірте нові функції!',
    date: '13.04.2025',
    read: true
  },
];

const NotificationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && styles.unreadItem]}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationDate}>{item.date}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Сповіщення</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {dummyNotifications.length > 0 ? (
        <FlatList
          data={dummyNotifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            У вас немає сповіщень
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto_Bold'
  },
  listContent: { paddingBottom: 16 },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadItem: { backgroundColor: '#f0f8ff' },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Roboto_Bold' },
  notificationMessage: { fontSize: 14,
    marginBottom: 8,
    color: '#333',
    fontFamily: 'Roboto' },
  notificationDate: { fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto' },
  unreadDot: { width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignSelf: 'center' },
  emptyContainer: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24 },
  emptyText: { fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Roboto_Bold' },
});

export default NotificationsScreen;