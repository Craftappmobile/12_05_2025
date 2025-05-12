/**
 * Головний компонент додатку "Розрахуй і В'яжи" з повною навігацією
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-10
 * @updated 2025-05-11 Додано ErrorBoundary та покращено обробку помилок
 */

import React, { useEffect } from 'react';
import { LogBox, Text, View, StyleSheet } from 'react-native';
import { AuthProvider, DatabaseProvider } from './src/context';
import { AppConfigProvider } from './src/utils/AppConfigContext';
import EnhancedAppNavigator from './src/navigation/EnhancedAppNavigator';

// Імпортуємо менеджер бази даних
import DatabaseManager from './src/utils/DatabaseManager';

// Імпортуємо компонент перехоплення помилок
import ErrorBoundary from './src/utils/ErrorBoundary';

/**
 * Ігноруємо деякі попередження, які не заважають роботі додатку
 */
LogBox.ignoreLogs([
  // Попередження про Bridgeless режим
  "Bridgeless mode is experimental and not all APIs work as expected.",
  // Попередження про Metro та Hermes
  "Metro has encountered an error:",
  // Попередження про створення двох однакових інстанцій
  "VirtualizedLists should never be nested"
]);

/**
 * Фалбек-компонент для відображення помилок
 */
const FallbackComponent: React.FC<{error: Error}> = ({ error }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Критична помилка в додатку</Text>
      <Text style={styles.errorMessage}>{error.message}</Text>
      <Text style={styles.errorHint}>
        Будь ласка, перезапустіть додаток або зверніться до служби підтримки.
      </Text>
    </View>
  );
};

// Встановлюємо displayName для FallbackComponent
FallbackComponent.displayName = 'FallbackComponent';

/**
 * Головний компонент додатку
 */
const App: React.FC = () => {
  // Перевіряємо чи встановлений прапорець для скидання бази даних
  const shouldReset = process.env.WATERMELONDB_SHOULD_RESET_CACHE === 'true';
  
  // Обробка глобальних помилок
  useEffect(() => {
    const originalConsoleError = console.error;
    
    // Перехоплюємо console.error для фільтрації помилок
    console.error = (...args) => {
      // Фільтруємо помилки displayName
      const errorMessage = args[0];
      if (typeof errorMessage === 'string' && errorMessage.includes("Cannot read property 'displayName' of undefined")) {
        // Пропускаємо помилку displayName - вона обробляється в ErrorBoundary
        return;
      }
      
      // Викликаємо оригінальний console.error для інших помилок
      originalConsoleError.apply(console, args);
    };
    
    // Повертаємо оригінальний console.error при розмонтуванні
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  // Обробка помилок
  const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Глобальна помилка в додатку:', error);
    console.error('Додаткова інформація:', errorInfo);
  };
  
  return (
    <ErrorBoundary 
      fallbackComponent={FallbackComponent}
      onError={handleGlobalError}
    >
      <AppConfigProvider>
        <AuthProvider>
          <DatabaseProvider>
            {/* Додаємо компонент для менеджменту бази даних */}
            <DatabaseManager resetOnStart={shouldReset} />
            <EnhancedAppNavigator />
          </DatabaseProvider>
        </AuthProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  );
};

// Стилі для компонента помилок
const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 14,
    color: '#2E3E28',
    textAlign: 'center',
    marginBottom: 15
  },
  errorHint: {
    fontSize: 14,
    color: '#6B8A5E',
    textAlign: 'center'
  }
});

// Встановлюємо displayName для головного компонента
App.displayName = 'App';

// Експортуємо головний компонент
export default App;