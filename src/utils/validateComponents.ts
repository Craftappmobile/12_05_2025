/**
 * Утиліта для перевірки правильності встановлення displayName в компонентах
 * Це допомагає знайти проблемні компоненти без displayName в Bridgeless режимі
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React from 'react';
import { Platform } from 'react-native';

/**
 * Інтерфейс для результатів перевірки
 */
export interface ValidationResult {
  componentName: string;
  hasDisplayName: boolean;
  displayName?: string;
  componentType: 'function' | 'class' | 'memo' | 'forwardRef' | 'object' | 'unknown';
  path?: string;
}

/**
 * Перевіряє чи має компонент встановлений displayName
 * 
 * @param component Компонент для перевірки
 * @param name Назва компонента (обов'язково)
 * @param path Шлях до компонента в проекті (опціонально)
 * @returns Результат перевірки
 */
export function validateComponent(component: any, name: string, path?: string): ValidationResult {
  // Якщо компонент не існує
  if (!component) {
    return {
      componentName: name,
      hasDisplayName: false,
      componentType: 'unknown',
      path,
    };
  }
  
  // Визначаємо тип компонента
  let componentType: ValidationResult['componentType'] = 'unknown';
  
  if (typeof component === 'function') {
    // Перевірка на клас-компонент
    if (component.prototype && component.prototype.isReactComponent) {
      componentType = 'class';
    } 
    // Перевірка на функціональний компонент
    else {
      componentType = 'function';
    }
  } 
  // Перевірка на memo та forwardRef
  else if (component && typeof component === 'object') {
    if (component.$$typeof) {
      const typeofString = component.$$typeof.toString();
      
      if (typeofString.includes('memo')) {
        componentType = 'memo';
      } else if (typeofString.includes('forward_ref')) {
        componentType = 'forwardRef';
      } else {
        componentType = 'object';
      }
    } else {
      componentType = 'object';
    }
  }
  
  return {
    componentName: name,
    hasDisplayName: !!component.displayName,
    displayName: component.displayName,
    componentType,
    path,
  };
}

/**
 * Перевіряє всі компоненти в заданому списку
 * 
 * @returns Результати перевірки
 */
export function validateComponents(): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Замість динамічного імпорту використовуємо прямі імпорти
  try {
    // Навігаційні компоненти
    const NavModule = require('@react-navigation/native');
    if (NavModule.NavigationContainer) {
      results.push(validateComponent(NavModule.NavigationContainer, 'NavigationContainer', '@react-navigation/native'));
    }
    
    // Компоненти Safe Area Context
    const SafeAreaModule = require('react-native-safe-area-context');
    if (SafeAreaModule.SafeAreaProvider) {
      results.push(validateComponent(SafeAreaModule.SafeAreaProvider, 'SafeAreaProvider', 'react-native-safe-area-context'));
    }
    
    // Компоненти проектів
    const ProjectDetailsModule = require('../screens/projects/ProjectDetails');
    if (ProjectDetailsModule.default) {
      results.push(validateComponent(ProjectDetailsModule.default, 'ProjectDetails', '../screens/projects/ProjectDetails'));
    }
    
    const ProjectDetailsCleanModule = require('../screens/projects/ProjectDetailsClean');
    if (ProjectDetailsCleanModule.default) {
      results.push(validateComponent(ProjectDetailsCleanModule.default, 'ProjectDetailsClean', '../screens/projects/ProjectDetailsClean'));
    }
    
    const ProjectsListModule = require('../screens/projects/ProjectsList');
    if (ProjectsListModule.default) {
      results.push(validateComponent(ProjectsListModule.default, 'ProjectsList', '../screens/projects/ProjectsList'));
    }
    
    // Можна розширити список потрібних компонентів
  } catch (error) {
    console.warn('Помилка при перевірці компонентів:', error);
  }
  
  return results;
}

/**
 * Запускає перевірку компонентів та виводить результати
 * 
 * @param logResults Чи виводити результати в консоль
 * @returns Результати перевірки
 */
export function runComponentsValidation(logResults: boolean = true): { valid: boolean, results: ValidationResult[] } {
  const isBridgeless = Platform.OS === 'ios' && Platform.constants?.isTesting === true;
  const results = validateComponents();
  
  let valid = true;
  let componentsWithoutDisplayName: ValidationResult[] = [];
  
  // Аналізуємо результати
  for (const result of results) {
    if (!result.hasDisplayName) {
      valid = false;
      componentsWithoutDisplayName.push(result);
    }
  }
  
  // Виводимо результати в консоль
  if (logResults) {
    console.log(`Режим Bridgeless: ${isBridgeless ? 'TAK' : 'HI'}`);
    console.log(`Перевірено ${results.length} компонентів`);
    
    if (componentsWithoutDisplayName.length > 0) {
      console.warn(`Знайдено ${componentsWithoutDisplayName.length} компонентів без displayName:`);
      
      componentsWithoutDisplayName.forEach(component => {
        console.warn(`- ${component.componentName} (${component.componentType}) у ${component.path}`);
      });
      
      if (isBridgeless) {
        console.error('УВАГА: У режимі Bridgeless всі компоненти повинні мати displayName!');
      }
    } else {
      console.log('Усі компоненти мають коректний displayName');
    }
  }
  
  return { valid, results };
}

/**
 * Перевіряє чи запущено додаток у Bridgeless режимі
 * 
 * @returns Чи запущено в Bridgeless режимі
 */
export function isBridgelessMode(): boolean {
  return Platform.OS === 'ios' && Platform.constants?.isTesting === true;
}