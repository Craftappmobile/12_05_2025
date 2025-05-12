/**
 * Утиліта для встановлення displayName для всіх компонентів навігації
 * Це допомагає уникнути помилок з undefined displayName в режимі Bridgeless
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

// Імпортуємо необхідні типи
import React from 'react';
import { createSafeNavigationComponent } from './createSafeNavigationComponent';

// Функція для встановлення displayName для компонента, якщо він існує
function setDisplayName(component: any, name: string) {
  if (component && !component.displayName) {
    component.displayName = name;
    return true;
  }
  return false;
}

/**
 * Автоматично встановлює displayName для всіх компонентів навігації
 * та створює безпечні обгортки для проблемних компонентів
 * 
 * @returns {boolean} Успішність операції
 */
export function patchNavigationComponents(): boolean {
  try {
    console.log('Початок патчингу компонентів навігації...');
    let patchedCount = 0;
    
    // Патчимо компоненти проектів
    try {
      // Завантажуємо напряму всі основні компоненти
      const ProjectDetailsModule = require('../screens/projects/ProjectDetails');
      const ProjectDetailsCleanModule = require('../screens/projects/ProjectDetailsClean');
      const ProjectListsModule = require('../screens/projects/ProjectsList');
      
      // Встановлюємо displayName для компонентів
      if (ProjectDetailsModule.default) {
        if (setDisplayName(ProjectDetailsModule.default, 'ProjectDetails')) {
          patchedCount++;
        }
        
        // Створюємо безпечну обгортку
        ProjectDetailsModule.default = createSafeNavigationComponent(
          ProjectDetailsModule.default, 
          'ProjectDetails'
        );
        console.log('Створено безпечну обгортку для ProjectDetails');
      }
      
      if (ProjectDetailsCleanModule.default) {
        if (setDisplayName(ProjectDetailsCleanModule.default, 'ProjectDetailsClean')) {
          patchedCount++;
        }
        
        // Створюємо безпечну обгортку
        ProjectDetailsCleanModule.default = createSafeNavigationComponent(
          ProjectDetailsCleanModule.default, 
          'ProjectDetailsClean'
        );
        console.log('Створено безпечну обгортку для ProjectDetailsClean');
      }
      
      if (ProjectListsModule.default) {
        if (setDisplayName(ProjectListsModule.default, 'ProjectsList')) {
          patchedCount++;
        }
      }
    } catch (error) {
      console.warn('Помилка при патчингу компонентів проектів:', error);
    }
    
    // Патчимо компоненти калькуляторів
    try {
      const CalculatorsModule = require('../screens/calculators');
      
      // Встановлюємо displayName для компонентів калькуляторів
      const calculatorComponents = [
        { export: 'HomeScreen', name: 'HomeScreen' },
        { export: 'FavoritesScreen', name: 'FavoritesScreen' },
        { export: 'SearchScreen', name: 'SearchScreen' },
        { export: 'NotificationsScreen', name: 'NotificationsScreen' },
        { export: 'YarnCalculatorWithNavigation', name: 'YarnCalculatorWithNavigation' },
        { export: 'HatCalculator', name: 'HatCalculator' },
        { export: 'VNeckDecreaseCalculator', name: 'VNeckDecreaseCalculator' },
        { export: 'AdaptationCalculator', name: 'AdaptationCalculator' }
      ];
      
      for (const { export: exportName, name } of calculatorComponents) {
        if (CalculatorsModule[exportName]) {
          if (setDisplayName(CalculatorsModule[exportName], name)) {
            patchedCount++;
          }
        }
      }
    } catch (error) {
      console.warn('Помилка при патчингу компонентів калькуляторів:', error);
    }
    
    // Патчимо ключові навігаційні компоненти
    try {
      const NavModule = require('@react-navigation/native');
      const StackModule = require('@react-navigation/stack');
      const DrawerModule = require('@react-navigation/drawer');
      
      if (NavModule.NavigationContainer && !NavModule.NavigationContainer.displayName) {
        NavModule.NavigationContainer.displayName = 'NavigationContainer';
        patchedCount++;
      }
      
      if (StackModule.createStackNavigator) {
        const originalCreateStackNavigator = StackModule.createStackNavigator;
        StackModule.createStackNavigator = function(...args: any[]) {
          const navigator = originalCreateStackNavigator(...args);
          if (navigator && navigator.Screen && !navigator.Screen.displayName) {
            navigator.Screen.displayName = 'Stack.Screen';
          }
          if (navigator && navigator.Navigator && !navigator.Navigator.displayName) {
            navigator.Navigator.displayName = 'Stack.Navigator';
          }
          return navigator;
        };
        patchedCount++;
      }
      
      if (DrawerModule.createDrawerNavigator) {
        const originalCreateDrawerNavigator = DrawerModule.createDrawerNavigator;
        DrawerModule.createDrawerNavigator = function(...args: any[]) {
          const navigator = originalCreateDrawerNavigator(...args);
          if (navigator && navigator.Screen && !navigator.Screen.displayName) {
            navigator.Screen.displayName = 'Drawer.Screen';
          }
          if (navigator && navigator.Navigator && !navigator.Navigator.displayName) {
            navigator.Navigator.displayName = 'Drawer.Navigator';
          }
          return navigator;
        };
        patchedCount++;
      }
    } catch (navError) {
      console.warn('Помилка при патчингу навігаційних контейнерів:', navError);
    }
    
    console.log(`Успішно встановлено displayName для ${patchedCount} компонентів навігації`);
    return true;
  } catch (error) {
    console.error('Помилка при патчингу компонентів навігації:', error);
    return false;
  }
}