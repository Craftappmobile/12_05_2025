/**
 * Компонент для перевірки наявності displayName у всіх компонентах
 * 
 * Цей компонент можна додати до App.tsx для контролю 
 * наявності displayName у всіх компонентах
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { runComponentsValidation, ValidationResult, isBridgelessMode } from './validateComponents';

/**
 * Пропси компонента верифікатора
 */
interface DisplayNameVerifierProps {
  children: React.ReactNode;
  showDebugInfo?: boolean;
}

/**
 * Функціональний компонент для перевірки та відображення інформації 
 * про наявність displayName
 */
export const DisplayNameVerifier: React.FC<DisplayNameVerifierProps> = ({ children, showDebugInfo = __DEV__ }) => {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [valid, setValid] = useState<boolean>(true);
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Перевіряємо наявність displayName
  useEffect(() => {
    const checkComponents = () => {
      const { valid, results } = runComponentsValidation(false);
      setResults(results);
      setValid(valid);
      
      // Якщо ми в Bridgeless режимі і є проблеми, показуємо результати
      if (isBridgelessMode() && !valid) {
        setShowResults(true);
      }
    };
    
    checkComponents();
    
    // Перевіряємо ще раз після монтування всіх компонентів
    const timer = setTimeout(checkComponents, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Якщо не потрібно показувати дебаг-інформацію
  if (!showDebugInfo || (valid && !showResults)) {
    return <>{children}</>;
  }
  
  // Показуємо тільки компоненти без displayName
  const componentsWithoutDisplayName = results.filter(r => !r.hasDisplayName);
  
  return (
    <>
      {showResults && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Перевірка displayName</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowResults(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.infoText}>
            {isBridgelessMode() ? 
              "Запущено в Bridgeless режимі - всі компоненти повинні мати displayName" : 
              "Перевірка наявності displayName у компонентах"}
          </Text>
          
          <Text style={[styles.statusText, valid ? styles.validStatus : styles.invalidStatus]}>
            {valid ? 
              "✔ Усі компоненти мають displayName" : 
              `✘ Знайдено ${componentsWithoutDisplayName.length} компонентів без displayName`}
          </Text>
          
          {!valid && (
            <ScrollView style={styles.scrollView}>
              {componentsWithoutDisplayName.map((item, index) => (
                <View key={index} style={styles.item}>
                  <Text style={styles.componentName}>
                    {item.componentName} ({item.componentType})
                  </Text>
                  <Text style={styles.componentPath}>
                    {item.path || 'Невідомий шлях'}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setShowResults(false)}
          >
            <Text style={styles.buttonText}>Продовжити</Text>
          </TouchableOpacity>
        </View>
      )}
      {children}
    </>
  );
};

// Для режиму Bridgeless обов'язково потрібен displayName
DisplayNameVerifier.displayName = 'DisplayNameVerifier';

// Стилі для компонента
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  validStatus: {
    color: '#4CAF50',
  },
  invalidStatus: {
    color: '#F44336',
  },
  scrollView: {
    maxHeight: 200,
    marginBottom: 16,
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 4,
    marginBottom: 8,
  },
  componentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  componentPath: {
    fontSize: 12,
    color: '#666',
  },
  button: {
    backgroundColor: '#6B8A5E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default DisplayNameVerifier;