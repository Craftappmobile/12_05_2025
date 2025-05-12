/**
 * Глобальні патчі для компонентів React, щоб уникнути проблем з displayName
 * у bridgeless режимі React Native
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-07
 */

import React from 'react';

/**
 * Патч для React.createElement - додавання displayName для всіх компонентів
 */
const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  try {
    // Додаємо displayName для всіх функціональних компонентів
    if (typeof type === 'function' && !type.displayName && type.name) {
      type.displayName = type.name;
      
      // Також патчимо внутрішні render методи для класових компонентів
      if (type.prototype && type.prototype.render && !type.prototype.render.displayName) {
        type.prototype.render.displayName = `${type.name}Render`;
      }
    }
    // Додаємо displayName для елементів з $$typeof (memoized компоненти та HOC)
    else if (type && type.$$typeof && !type.displayName && type.type) {
      if (typeof type.type === 'function') {
        const typeName = type.type.displayName || type.type.name || 'UnknownType';
        type.displayName = `Memo(${typeName})`;
      } else if (typeof type.type === 'string') {
        type.displayName = `Memo(${type.type})`;
      }
    }
  } catch (error) {
    console.warn('Помилка при встановленні displayName у createElement:', error);
  }
  
  return originalCreateElement.call(this, type, props, ...children);
};

/**
 * Патч для React.forwardRef - додавання displayName для компонентів з forwardRef
 */
const originalForwardRef = React.forwardRef;
if (originalForwardRef) {
  React.forwardRef = function(render) {
    try {
      const result = originalForwardRef(render);
      
      if (!result.displayName) {
        // Спочатку намагаємося використати ім'я функції рендерингу
        if (render.name) {
          result.displayName = `ForwardRef(${render.name})`;
        } 
        // Якщо ім'я функції недоступне, використовуємо загальну назву
        else {
          result.displayName = 'ForwardRef';
        }
      }
      
      return result;
    } catch (error) {
      console.warn('Помилка при встановленні displayName у forwardRef:', error);
      return originalForwardRef(render);
    }
  };
}

/**
 * Патч для React.memo - додавання displayName для мемоізованих компонентів
 */
const originalMemo = React.memo;
if (originalMemo) {
  React.memo = function(component, compare) {
    try {
      const result = originalMemo(component, compare);
      
      if (!result.displayName) {
        if (component.displayName) {
          result.displayName = `Memo(${component.displayName})`;
        } else if (component.name) {
          result.displayName = `Memo(${component.name})`;
        } else {
          result.displayName = 'Memo';
        }
      }
      
      return result;
    } catch (error) {
      console.warn('Помилка при встановленні displayName у memo:', error);
      return originalMemo(component, compare);
    }
  };
}

/**
 * Патч для React.lazy - додавання displayName для ліниво завантажених компонентів
 */
const originalLazy = React.lazy;
if (originalLazy) {
  React.lazy = function(factory) {
    try {
      const result = originalLazy(factory);
      
      // Додаємо базовий displayName, який буде оновлено після завантаження
      if (!result.displayName) {
        result.displayName = 'LazyComponent';
      }
      
      // Патчимо _init для оновлення displayName після завантаження
      const originalInit = result._init;
      if (originalInit) {
        result._init = function(payload) {
          const Component = originalInit(payload);
          if (Component && Component.displayName) {
            result.displayName = `Lazy(${Component.displayName})`;
          } else if (Component && Component.name) {
            result.displayName = `Lazy(${Component.name})`;
          }
          return Component;
        };
      }
      
      return result;
    } catch (error) {
      console.warn('Помилка при встановленні displayName у lazy:', error);
      return originalLazy(factory);
    }
  };
}

console.log('Зареєстровано глобальні компонентні патчі для React');