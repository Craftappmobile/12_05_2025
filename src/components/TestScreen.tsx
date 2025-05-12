import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TestScreenProps {
  version?: string;
}

/**
 * Тестовий екран для діагностики проблем з інтерфейсом
 */
const TestScreen: React.FC<TestScreenProps> = ({ version = '1.0.0' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Розрахуй і В'яжи</Text>
        <Text style={styles.subtitle}>Тестовий екран</Text>
        <Text style={styles.version}>Версія: {version}</Text>
        <Text style={styles.info}>Якщо ви бачите цей екран, базові компоненти React Native працюють правильно.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  box: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555555',
    marginBottom: 20,
  },
  version: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    color: '#444444',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default TestScreen;