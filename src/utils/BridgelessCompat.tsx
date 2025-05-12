/**
 * Утиліти для забезпечення сумісності з Bridgeless режимом React Native
 * 
 * Цей файл містить функції та компоненти, які допомагають вирішити проблеми
 * з displayName та відображенням компонентів у Bridgeless режимі.
 */

import React from 'react';

/**
 * Перевіряє, чи запущений додаток у Bridgeless режимі
 */
export const isBridgelessMode = () => {
  return (global as any).__BRIDGELESS__ === true;
};

/**
 * Обгортка для безпечного використання компонентів у Bridgeless режимі
 */
export function BridgelessSafeComponent<P extends object>(Component: React.ComponentType<P>, name: string): React.FC<P> {
  // Для функціональних компонентів створюємо нову функцію з явним displayName
  const BridgelessSafeComponentWrapper: React.FC<P> = (props: P) => {
    return <Component {...props} />;
  };
  
  // Встановлюємо displayName у всіх можливих місцях
  BridgelessSafeComponentWrapper.displayName = name;
  
  // Повертаємо безпечний компонент
  return BridgelessSafeComponentWrapper;
}

/**
 * Обгортка для класових компонентів, яка гарантує правильну роботу в Bridgeless режимі
 */
export function BridgelessSafeClass<P extends object, T extends React.ComponentClass<P>>(Component: T, name: string): T {
  // Створюємо клас, який обгортає оригінальний компонент
  class BridgelessSafeClassWrapper extends React.Component<P> {
    static displayName = name;
    
    // Визначаємо render метод з displayName
    render() {
      return <Component {...this.props} />;
    }
  }
  
  // Встановлюємо displayName для render методу
  BridgelessSafeClassWrapper.prototype.render.displayName = `${name}.render`;
  
  // Копіюємо статичні властивості з оригінального компонента
  if (Component) {
    Object.getOwnPropertyNames(Component).forEach((key) => {
      if (key !== 'displayName' && key !== 'contextTypes' && key !== 'childContextTypes') {
        // @ts-ignore
        BridgelessSafeClassWrapper[key] = Component[key];
      }
    });
  }
  
  return BridgelessSafeClassWrapper as unknown as T;
}

/**
 * Функція для встановлення displayName для всіх компонентів в об'єкті
 */
export function enhanceComponents(components: Record<string, any>, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(components).forEach(([key, component]) => {
    // Якщо це React компонент (функція або клас)
    if (typeof component === 'function') {
      const name = prefix ? `${prefix}.${key}` : key;
      
      // Визначаємо, це класовий компонент чи функціональний
      const isClassComponent = !!component.prototype && !!component.prototype.isReactComponent;
      
      if (isClassComponent) {
        result[key] = BridgelessSafeClass(component, name);
      } else {
        result[key] = BridgelessSafeComponent(component, name);
      }
    } else {
      // Якщо це не компонент, просто копіюємо властивість
      result[key] = component;
    }
  });
  
  return result;
}

/**
 * HOC для обгортання компонентів екранів, які використовуються в навігації
 */
export function withBridgelessSupport<P extends object>(Component: React.ComponentType<P>, name: string): React.ComponentType<P> {
  // Для класових компонентів
  if (Component.prototype && Component.prototype.isReactComponent) {
    return BridgelessSafeClass(Component as React.ComponentClass<P>, name);
  }
  
  // Для функціональних компонентів
  return BridgelessSafeComponent(Component, name);
}