/**
 * @fileoverview Утиліти для діагностики та виправлення найпоширеніших помилок
 */

import React from 'react';
import { Platform, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { navigationService } from '../services/navigationService';
import { sanitizer } from './sanitizers';
import { handleError } from './errorHandling';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Основні тести для діагностики системи
 */
export const diagnostics = {
  /**
   * Перевірка стану навігації
   */
  checkNavigation: (): DiagnosticResult => {
    try {
      const navState = navigationService.diagnoseNavigation();
      
      return {
        success: navState.available,
        message: navState.available 
          ? 'Навігація працює нормально' 
          : 'Проблеми з навігацією',
        details: navState
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка при перевірці навігації: ${error instanceof Error ? error.message : String(error)}`,
        details: error
      };
    }
  },
  
  /**
   * Перевірка функції sanitizer
   */
  checkSanitizer: (): DiagnosticResult => {
    try {
      // Створюємо тестові дані з різними типами даних
      const testData = {
        string: 'Тестовий рядок',
        number: 42,
        boolean: true,
        date: new Date(),
        undefined: undefined,
        null: null,
        array: [1, 'два', { three: 3 }],
        nestedObject: {
          key1: 'value1',
          key2: 2,
          key3: { subKey: 'subValue' }
        }
      };
      
      // Санітизуємо тестові дані
      const sanitized = sanitizer(testData);
      
      // Перевіряємо, чи можна безпечно серіалізувати результат
      const serialized = JSON.stringify(sanitized);
      const deserialized = JSON.parse(serialized);
      
      return {
        success: true,
        message: 'Функція sanitizer працює коректно',
        details: {
          original: testData,
          sanitized,
          deserialized
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка в функції sanitizer: ${error instanceof Error ? error.message : String(error)}`,
        details: error
      };
    }
  },
  
  /**
   * Перевірка обробки помилок
   */
  checkErrorHandling: (): DiagnosticResult => {
    try {
      const testError = new Error('Тестова помилка для перевірки обробки');
      const handled = handleError(testError, 'тестовий контекст');
      
      return {
        success: true,
        message: 'Функція handleError працює коректно',
        details: { original: testError, handled }
      };
    } catch (error) {
      return {
        success: false,
        message: `Помилка при тестуванні обробки помилок: ${error instanceof Error ? error.message : String(error)}`,
        details: error
      };
    }
  },
  
  /**
   * Запустити всі діагностичні тести
   */
  runAllTests: () => {
    const results = {
      navigation: diagnostics.checkNavigation(),
      sanitizer: diagnostics.checkSanitizer(),
      errorHandling: diagnostics.checkErrorHandling(),
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: new Date().toISOString()
    };
    
    console.log('Результати діагностики:', results);
    
    // Виводимо спрощений результат
    const success = results.navigation.success && 
                  results.sanitizer.success && 
                  results.errorHandling.success;
    
    if (success) {
      Alert.alert(
        'Діагностика успішна', 
        'Всі компоненти системи працюють нормально'
      );
    } else {
      Alert.alert(
        'Проблеми в системі', 
        `Виявлено помилки: ${results.navigation.success ? '' : '\n- Навігація'}
${results.sanitizer.success ? '' : '\n- Обробка даних'}
${results.errorHandling.success ? '' : '\n- Обробка помилок'}`
      );
    }
    
    return results;
  }
};

/**
 * Діагностичний компонент для використання в UI
 */
export const DiagnosticButton = ({ label = 'Запустити діагностику', onComplete }: {
  label?: string;
  onComplete?: (results: any) => void;
}) => {
  const runDiagnostics = () => {
    const results = diagnostics.runAllTests();
    if (onComplete) {
      onComplete(results);
    }
  };
  
  return React.createElement(
    TouchableOpacity,
    { style: styles.button, onPress: runDiagnostics },
    React.createElement(Text, { style: styles.buttonText }, label)
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6B8A5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500'
  }
});