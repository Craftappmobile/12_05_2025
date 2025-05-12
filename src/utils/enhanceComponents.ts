import React from 'react';
// Імпортуємо модулі статично
import * as ReactNavigation from '@react-navigation/native';
import * as ReactNavigationNativeStack from '@react-navigation/native-stack';
import * as ReactNativeScreens from 'react-native-screens';
import * as SafeAreaContext from 'react-native-safe-area-context';

/**
 * Функція для виправлення проблеми з displayName у React Navigation
 */
export function enhanceNavigationComponents() {
  try {
    // Допоміжна функція для встановлення displayName
    const enhanceModule = (module: any, moduleName: string) => {
      if (!module) return;
      
      Object.keys(module).forEach(key => {
        if (typeof module[key] === 'function' && !module[key].displayName) {
          module[key].displayName = key;
          console.log(`Встановлено displayName для ${key} з ${moduleName}`);
        }
      });
    };

    // Патчимо основні навігаційні компоненти
    enhanceModule(ReactNavigation, '@react-navigation/native');
    enhanceModule(ReactNavigationNativeStack, '@react-navigation/native-stack');
    
    // Патч для React Native Screens
    if (ReactNativeScreens?.Screen) {
      ReactNativeScreens.Screen.displayName = 'Screen';
    }

    // Патч для Safe Area Context
    if (SafeAreaContext?.SafeAreaProvider) {
      SafeAreaContext.SafeAreaProvider.displayName = 'SafeAreaProvider';
    }
    
    console.log('Навігаційні компоненти успішно покращено!');
    return true;
  } catch (error) {
    console.error('Помилка при покращенні компонентів:', error);
    return false;
  }
}

/**
 * HOC для надійної роботи з компонентами в React Navigation
 */
export function createSafeNavigationComponent<P>(
  Component: React.ComponentType<P>,
  displayName: string
): React.ComponentType<P> {
  // Створюємо клас-компонент (більш стабільний в Navigation)
  class SafeNavigationComponent extends React.Component<P> {
    static displayName = displayName;
    
    render() {
      return React.createElement(Component, this.props);
    }
  }
  
  // Копіюємо статичні поля
  if (Component) {
    Object.keys(Component).forEach(key => {
      // @ts-ignore
      SafeNavigationComponent[key] = Component[key];
    });
  }
  
  return SafeNavigationComponent;
}