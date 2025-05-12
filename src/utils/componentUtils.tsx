import React from 'react';

/**
 * HOC для безпечного додавання displayName до компонентів
 * Це допомагає уникнути проблем з react-native-css-interop та SafeAreaProvider
 * 
 * @param Component Компонент, який потрібно обгорнути
 * @param name Назва для компонента (опціонально)
 * @returns Компонент з встановленим displayName
 */
export function withSafeDisplayName<P>(Component: React.ComponentType<P>, name?: string): React.ComponentType<P> {
  // Використовуємо ім'я компонента, якщо воно доступне
  const displayName = name || Component.name || 'UnnamedComponent';
  
  // Встановлюємо displayName для компонента
  Component.displayName = displayName;
  
  return Component;
}

/**
 * Обгортка для компонентів, яка додає displayName та обробляє помилки
 * Використовуйте тільки для компонентів, які мають проблеми з displayName
 * 
 * @param Component Компонент, який потрібно обгорнути
 * @param name Назва для компонента (опціонально)
 * @returns Новий компонент з обробкою помилок
 */
export function createSafeComponent<P>(Component: React.ComponentType<P>, name?: string): React.FC<P> {
  const displayName = name || Component.name || 'SafeComponent';
  
  // Створюємо новий компонент
  const SafeComponent: React.FC<P> = (props) => {
    try {
      // Встановлюємо displayName для оригінального компонента
      Component.displayName = displayName + 'Original';
      return React.createElement(Component, props);
    } catch (error) {
      console.error(`Помилка в компоненті ${displayName}:`, error);
      return null;
    }
  };
  
  // Встановлюємо displayName для нового компонента
  SafeComponent.displayName = displayName;
  
  return SafeComponent;
}

/**
 * Патч для компонентів React Native, додає displayName до стандартних компонентів
 * Використовуйте цю функцію на початку вашого додатку
 */
export function patchReactNativeComponents(): void {
  // Додаємо захист від конфліктів CSS-interop та SafeAreaProvider
  try {
    // Патч для SafeAreaProvider
    const safeAreaContext = require('react-native-safe-area-context');
    if (safeAreaContext && safeAreaContext.SafeAreaProvider) {
      safeAreaContext.SafeAreaProvider.displayName = 'SafeAreaProvider';
      console.log('Успішно встановлено displayName для SafeAreaProvider');
    }
    
    // Патч для maybeHijackSafeAreaProvider функції
    try {
      const cssInterop = require('react-native-css-interop');
      
      if (cssInterop && cssInterop.__internalMaybeHijackSafeAreaProvider) {
        const originalFunc = cssInterop.__internalMaybeHijackSafeAreaProvider;
        
        cssInterop.__internalMaybeHijackSafeAreaProvider = function (type: any) {
          // Захист від undefined
          if (!type) return type;
          
          // Додаємо displayName якщо його немає
          if (type && !type.displayName && type.name) {
            type.displayName = type.name;
          }
          
          // Оригінальна функція
          const result = originalFunc(type);
          
          // Додатково перевіряємо результат
          if (result && !result.displayName && result.name) {
            result.displayName = result.name;
          }
          
          return result;
        };
        
        console.log('Успішно застосовано патч для CSS-interop');
      }
    } catch (cssError) {
      console.warn('Не вдалося застосувати патч для CSS-interop:', cssError);
    }
  } catch (error) {
    console.warn('Не вдалося застосувати патч для компонентів:', error);
  }
}