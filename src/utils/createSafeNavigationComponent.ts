/**
 * HOC для створення безпечних компонентів навігації, які не викликають проблем із displayName
 * у React Native Bridgeless режимі
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React from 'react';

/**
 * Створює безпечну обгортку для навігаційних компонентів
 * Використовує клас-компонент (більш стабільний в Navigation стеку)
 * 
 * @param Component Компонент для обгортання
 * @param displayName Ім'я для відображення (опціонально)
 * @returns Безпечний компонент з встановленим displayName
 */
export function createSafeNavigationComponent<P>(
  Component: React.ComponentType<P>,
  name?: string
): React.ComponentType<P> {
  // Використовуємо ім'я компонента, якщо воно доступне
  const displayName = name || (Component.displayName || Component.name || 'SafeNavigationComponent');
  
  // Створюємо клас-компонент замість функціонального
  // Це більш стабільно працює в навігаційних стеках
  class SafeNavigationComponent extends React.Component<P> {
    // Явно встановлюємо displayName
    static displayName = displayName;
    
    render() {
      try {
        // Підтверджуємо, що Component має displayName
        if (Component && !Component.displayName) {
          Component.displayName = displayName + 'Original';
        }
        
        return React.createElement(Component, this.props);
      } catch (error) {
        console.error(`Помилка в компоненті ${displayName}:`, error);
        
        // Повертаємо запасний варіант у випадку помилки
        return React.createElement(
          'div', 
          { style: { padding: 20, margin: 20, backgroundColor: '#ffeeee', borderRadius: 10 } },
          React.createElement('h3', null, `Помилка в компоненті ${displayName}`),
          React.createElement('p', null, error instanceof Error ? error.message : String(error))
        );
      }
    }
  }
  
  // Копіюємо всі статичні методи та властивості
  if (Component) {
    Object.keys(Component).forEach(key => {
      // Пропускаємо displayName, оскільки ми його вже встановили
      if (key !== 'displayName') {
        try {
          // @ts-ignore
          SafeNavigationComponent[key] = Component[key];
        } catch (error) {
          console.warn(`Не вдалося скопіювати статичну властивість ${key}:`, error);
        }
      }
    });
  }
  
  return SafeNavigationComponent;
}

/**
 * Створює безпечну обгортку для компонентів контейнерів (наприклад, SafeAreaProvider)
 * 
 * @param Component Компонент для обгортання
 * @param name Ім'я для відображення
 * @returns Безпечний компонент з forwardRef та displayName
 */
export function createSafeContainerComponent<P>(
  Component: React.ComponentType<P>,
  name: string
): React.ForwardRefExoticComponent<P & React.RefAttributes<unknown>> {
  // Створюємо обгортку з forwardRef
  const SafeComponent = React.forwardRef<unknown, P>((props, ref) => {
    try {
      return React.createElement(Component, { ...props, ref: ref as any });
    } catch (error) {
      console.error(`Помилка в компоненті ${name}:`, error);
      return null;
    }
  });
  
  // Встановлюємо displayName
  SafeComponent.displayName = name;
  
  return SafeComponent;
}

/**
 * Створює функціональний компонент з безпечним displayName
 * Найпростіший спосіб додати displayName до компонента
 * 
 * @param renderFunc Функція рендерингу компонента
 * @param name Назва компонента
 * @returns Функціональний компонент з displayName
 */
export function createSafeFunctionalComponent<P>(
  renderFunc: React.FC<P>,
  name: string
): React.FC<P> {
  const SafeComponent: React.FC<P> = (props) => renderFunc(props);
  SafeComponent.displayName = name;
  return SafeComponent;
}