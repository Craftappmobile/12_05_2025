import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const YarnStorageScreen = () => {
  // Тестові дані складу пряжі
  const yarnItems = [
    { id: '1', name: 'Merino Wool', color: 'Червоний', weight: '100g', count: 5 },
    { id: '2', name: 'Cotton Yarn', color: 'Синій', weight: '50g', count: 3 },
    { id: '3', name: 'Alpaca Mix', color: 'Сірий', weight: '150g', count: 2 },
    { id: '4', name: 'Cashmere', color: 'Фіолетовий', weight: '75g', count: 1 },
    { id: '5', name: 'Acrylic Yarn', color: 'Зелений', weight: '200g', count: 8 },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.yarnItem}>
      <View style={styles.yarnDetails}>
        <Text style={styles.yarnName}>{item.name}</Text>
        <Text style={styles.yarnInfo}>Колір: {item.color}</Text>
        <Text style={styles.yarnInfo}>Вага: {item.weight}</Text>
      </View>
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{item.count}</Text>
        <Text style={styles.countLabel}>шт.</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Мій склад пряжі</Text>
        <Text style={styles.subtitle}>Облік наявних матеріалів</Text>
      </View>
      
      {yarnItems.length > 0 ? (
        <FlatList
          data={yarnItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ваш склад пряжі порожній</Text>
          <Text style={styles.emptySubtext}>Додайте пряжу, щоб бачити її тут</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Roboto',
  },
  listContent: {
    padding: 16,
  },
  yarnItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yarnDetails: {
    flex: 1,
  },
  yarnName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  yarnInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  countContainer: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto_Bold',
  },
  countLabel: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Roboto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Roboto',
  },
});

export default YarnStorageScreen;