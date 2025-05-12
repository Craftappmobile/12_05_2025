import React, { createContext, useContext, useEffect, useState } from 'react';
import { setupDatabase } from '../services/db/setup';
import { setupAutoSync } from '../services/sync';

interface DatabaseContextType {
  isLoading: boolean;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType>({ isLoading: true,
  isReady: false,
  error: null });

export const useDatabase = () => useContext(DatabaseContext);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Ініціалізація бази даних
        const success = await setupDatabase();
        
        if (!success) {
          throw new Error('Не вдалося ініціалізувати базу даних');
        }
        
        // Налаштування автоматичної синхронізації
        const cleanupSync = setupAutoSync(15); // Синхронізація кожні 15 хвилин
        
        setIsReady(true);
        setIsLoading(false);
        
        // Очищення при розмонтуванні
        return () => {
          cleanupSync();
        };
      } catch (err) {
        console.error('Помилка ініціалізації бази даних:', err);
        setError(err instanceof Error ? err : new Error('Невідома помилка бази даних'));
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  // Показуємо індикатор завантаження, якщо база даних ще не готова
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Завантаження даних...</Text>
      </View>
    );
  }

  // Показуємо повідомлення про помилку, якщо щось пішло не так
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Помилка</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ isLoading, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

const styles = StyleSheet.create({ loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 16,
    fontSize: 16,
    color: '#333' },
  errorContainer: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20 },
  errorTitle: { fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8 },
  errorText: { fontSize: 16,
    color: '#333',
    textAlign: 'center' },
});

// Імпорт для компонентів завантаження та помилки
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default DatabaseProvider;
