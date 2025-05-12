/**
 * Функція для правильної ініціалізації та перезавантаження бібліотек для роботи у Bridgeless режимі
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React from 'react';

/**
 * Допоміжна функція для встановлення displayName для всіх експортів модуля
 * 
 * @param module Модуль для патчів
 * @param moduleName Назва модуля для логування
 * @param prefix Префікс для displayName (опціонально)
 * @returns Успішність операції
 */
const enhanceModuleExports = (module: any, moduleName: string, prefix: string = ''): boolean => {
  if (!module) return false;
  
  try {
    let enhancedCount = 0;
    
    // Додаємо displayName для всіх експортів модуля
    Object.keys(module).forEach(key => {
      const exportItem = module[key];
      
      // Перевіряємо чи це функція або клас (React компонент)
      if (typeof exportItem === 'function' && !exportItem.displayName) {
        const newDisplayName = prefix ? `${prefix}.${key}` : key;
        exportItem.displayName = newDisplayName;
        enhancedCount++;
        
        // Якщо це клас-компонент, також патчимо його методи
        if (exportItem.prototype && exportItem.prototype.render && !exportItem.prototype.render.displayName) {
          exportItem.prototype.render.displayName = `${newDisplayName}.render`;
        }
      }
      
      // Якщо це об'єкт, що може містити вкладені компоненти
      else if (exportItem && typeof exportItem === 'object') {
        // Перевіряємо чи це React елемент з $$typeof
        if (exportItem.$$typeof && !exportItem.displayName) {
          exportItem.displayName = `${prefix || moduleName}.${key}`;
          enhancedCount++;
        }
        
        // Рекурсивно обробляємо вкладені компоненти, але уникаємо циклічних посилань
        // Не обробляємо прототип та масиви
        if (!Array.isArray(exportItem) && key !== 'prototype' && key !== '__proto__') {
          try {
            const nestedPrefix = prefix ? `${prefix}.${key}` : key;
            const nestedEnhanced = enhanceModuleExports(exportItem, `${moduleName}.${key}`, nestedPrefix);
            if (nestedEnhanced) enhancedCount++;
          } catch (nestedError) {
            // Ігноруємо помилки в рекурсивних викликах
          }
        }
      }
    });
    
    if (enhancedCount > 0) {
      console.log(`Встановлено displayName для ${enhancedCount} компонентів в ${moduleName}`);
    }
    
    return enhancedCount > 0;
  } catch (error) {
    console.warn(`Помилка при встановленні displayName для ${moduleName}:`, error);
    return false;
  }
};

// Імпортуємо всі бібліотеки статично
import * as reactNavigationNative from '@react-navigation/native';
import * as reactNavigationNativeStack from '@react-navigation/native-stack';
import * as reactNavigationDrawer from '@react-navigation/drawer';
import * as reactNavigationBottomTabs from '@react-navigation/bottom-tabs';
import * as reactNativeScreens from 'react-native-screens';
import * as reactNativeSafeAreaContext from 'react-native-safe-area-context';
import * as reactNativeGestureHandler from 'react-native-gesture-handler';
import * as reactNativeReanimated from 'react-native-reanimated';
import * as reactNativeVectorIcons from 'react-native-vector-icons';

/**
 * Головна функція для переініціалізації бібліотек для забезпечення роботи в Bridgeless режимі
 * 
 * @returns Успішність операції
 */
export function reinitializeLibraries(): boolean {
  try {
    console.log('Починаємо переініціалізацію бібліотек...');
    
    // Зберігаємо посилання на Supabase клієнт (не обробляємо, лише завантажуємо)
    try {
      const supabase = require('../services/auth/supabaseClient').default;
    } catch (supaError) {
      console.warn('Не вдалося завантажити Supabase клієнт:', supaError);
    }
    
    // Патчимо бібліотеки зі статичними імпортами
    let successCount = 0;
    
    // Група навігаційних бібліотек
    try {
      const navNativeSuccess = enhanceModuleExports(reactNavigationNative, '@react-navigation/native');
      if (navNativeSuccess) successCount++;
      
      const navNativeStackSuccess = enhanceModuleExports(reactNavigationNativeStack, '@react-navigation/native-stack');
      if (navNativeStackSuccess) successCount++;
      
      const navDrawerSuccess = enhanceModuleExports(reactNavigationDrawer, '@react-navigation/drawer');
      if (navDrawerSuccess) successCount++;
      
      const navBottomTabsSuccess = enhanceModuleExports(reactNavigationBottomTabs, '@react-navigation/bottom-tabs');
      if (navBottomTabsSuccess) successCount++;
    } catch (navError) {
      console.warn('Помилка при патчі навігаційних бібліотек:', navError);
    }
    
    // Група нативних компонентів
    try {
      const screensSuccess = enhanceModuleExports(reactNativeScreens, 'react-native-screens');
      if (screensSuccess) successCount++;
      
      const safeAreaSuccess = enhanceModuleExports(reactNativeSafeAreaContext, 'react-native-safe-area-context');
      if (safeAreaSuccess) successCount++;
      
      const gestureHandlerSuccess = enhanceModuleExports(reactNativeGestureHandler, 'react-native-gesture-handler');
      if (gestureHandlerSuccess) successCount++;
      
      const reanimatedSuccess = enhanceModuleExports(reactNativeReanimated, 'react-native-reanimated');
      if (reanimatedSuccess) successCount++;
    } catch (nativeComponentsError) {
      console.warn('Помилка при патчі нативних компонентів:', nativeComponentsError);
    }
    
    // Група UI компонентів
    try {
      const vectorIconsSuccess = enhanceModuleExports(reactNativeVectorIcons, 'react-native-vector-icons');
      if (vectorIconsSuccess) successCount++;
    } catch (uiComponentsError) {
      console.warn('Помилка при патчі UI компонентів:', uiComponentsError);
    }
    
    // Спеціальні патчі для ключових компонентів
    
    // Патч для NavigationContainer
    try {
      const { NavigationContainer } = reactNavigationNative;
      if (NavigationContainer && !NavigationContainer.displayName) {
        NavigationContainer.displayName = 'NavigationContainer';
        console.log('Встановлено displayName для NavigationContainer');
      }
    } catch (navContainerError) {
      console.warn('Не вдалося встановити displayName для NavigationContainer');
    }
    
    // Патч для SafeAreaProvider
    try {
      const { SafeAreaProvider } = reactNativeSafeAreaContext;
      if (SafeAreaProvider && !SafeAreaProvider.displayName) {
        SafeAreaProvider.displayName = 'SafeAreaProvider';
        console.log('Встановлено displayName для SafeAreaProvider');
      }
    } catch (safeAreaError) {
      console.warn('Не вдалося встановити displayName для SafeAreaProvider');
    }
    
    console.log(`Успішно патчнуто ${successCount} бібліотек для роботи в Bridgeless режимі`);
    return true;
  } catch (error) {
    console.error('Помилка при переініціалізації бібліотек:', error);
    return false;
  }
}