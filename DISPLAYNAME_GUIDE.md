# Вирішення проблем з displayName в Bridgeless режимі

## Опис проблеми

При запуску React Native додатка в режимі Bridgeless (нова архітектура без моста JS <-> Native) можуть виникати помилки виду:

```
Cannot read property 'displayName' of undefined
```

Це відбувається тому що:
1. В Bridgeless режимі React строго перевіряє наявність `displayName` у всіх компонентів
2. Функціональні компоненти та компоненти-обгортки часто не мають цієї властивості
3. Фреймворки, такі як React Navigation, можуть використовувати HOC, які також не мають displayName

## Рішення

У додатку "Розрахуй і В'яжи" ми реалізували комплексне рішення для вирішення проблеми з displayName:

### 1. Глобальні патчі для React

У файлі `src/utils/registerComponents.ts` ми перевизначаємо основні методи React, щоб автоматично додавати displayName:

```javascript
// Патч для React.createElement
const originalCreateElement = React.createElement;
React.createElement = function(type, props, ...children) {
  // Додаємо displayName для всіх функціональних компонентів
  if (typeof type === 'function' && !type.displayName && type.name) {
    type.displayName = type.name;
  }
  return originalCreateElement.call(this, type, props, ...children);
};

// Патч для forwardRef
const originalForwardRef = React.forwardRef;
if (originalForwardRef) {
  React.forwardRef = function(render) {
    const result = originalForwardRef(render);
    if (!result.displayName && render.name) {
      result.displayName = `ForwardRef(${render.name})`;
    }
    return result;
  };
}
```

### 2. Безпечні HOC для компонентів навігації

У файлі `src/utils/createSafeNavigationComponent.ts` ми створили HOC, який гарантує наявність displayName:

```javascript
export function createSafeNavigationComponent<P>(
  Component: React.ComponentType<P>,
  name?: string
): React.ComponentType<P> {
  // Використовуємо клас-компонент замість функціонального
  class SafeNavigationComponent extends React.Component<P> {
    static displayName = name || Component.name || 'SafeNavigationComponent';
    
    render() {
      return <Component {...this.props} />;
    }
  }
  
  return SafeNavigationComponent;
}
```

### 3. Патчі для бібліотек навігації

У файлах `src/utils/patchNavigationComponents.ts` та `src/utils/reinitializeLibraries.ts` ми встановлюємо displayName для компонентів React Navigation, SafeAreaProvider та інших:

```javascript
// Приклад встановлення displayName для NavigationContainer
const { NavigationContainer } = require('@react-navigation/native');
if (NavigationContainer && !NavigationContainer.displayName) {
  NavigationContainer.displayName = "NavigationContainer";
}
```

### 4. Компоненти-класи замість функціональних для проблемних компонентів

Для компонентів, які викликають проблеми (наприклад, `ProjectDetails`), ми створили спрощені версії на основі класів:

```javascript
class ProjectDetailsClean extends React.Component {
  static displayName = "ProjectDetailsClean";
  
  render() {
    // Реалізація компонента...
  }
}
```

### 5. Системна перевірка наявності displayName

У файлі `src/utils/validateComponents.ts` ми створили утиліту для перевірки та звітування про компоненти без displayName:

```javascript
export function runComponentsValidation(): { valid: boolean, results: ValidationResult[] } {
  const results = validateComponents();
  let valid = true;
  
  // Аналізуємо результати
  for (const result of results) {
    if (!result.hasDisplayName) {
      valid = false;
      // ...
    }
  }
  
  return { valid, results };
}
```

## Як використовувати

1. **Імпортуйте глобальні патчі** на початку додатка (в App.tsx):
   ```javascript
   import './src/utils/registerComponents';
   ```

2. **Застосуйте патчі бібліотек** перед використанням:
   ```javascript
   patchReactNativeComponents();
   patchNavigationComponents();
   reinitializeLibraries();
   ```

3. **Для проблемних компонентів** використовуйте HOC:
   ```javascript
   export default createSafeNavigationComponent(MyComponent, "MyComponent");
   ```

4. **Завжди додавайте displayName** до функціональних компонентів:
   ```javascript
   const MyComponent = () => { /* ... */ };
   MyComponent.displayName = "MyComponent";
   ```

5. **Для перевірки:** використовуйте `DisplayNameVerifier`:
   ```javascript
   <DisplayNameVerifier>
     <App />
   </DisplayNameVerifier>
   ```

## Скрипти запуску

- `start-bridgeless.bat` - для запуску в Bridgeless режимі
- `start-with-checks.bat` - для запуску з перевіркою displayName

## Рекомендації для розробників

1. Завжди додавайте displayName до функціональних компонентів
2. Використовуйте класові компоненти для ключових екранів навігації
3. Застосовуйте HOC `createSafeNavigationComponent` для проблемних компонентів
4. Запускайте додаток періодично в Bridgeless режимі для перевірки