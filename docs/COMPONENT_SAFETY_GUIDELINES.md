# Рекомендації щодо безпечного використання компонентів

Цей документ містить рекомендації з вирішення проблем, які виникають при взаємодії між NativeWind, React Navigation та SafeAreaProvider в React Native.

## Проблема 1: `TypeError: sanitizer is not a function (it is undefined)`

### Причина
Ця помилка виникає, коли функція `sanitizer` не імпортована або недоступна в контексті, де вона використовується. WatermelonDB потребує санітизації об'єктів JSON перед збереженням.

### Вирішення
1. Створіть надійну функцію `sanitizer` в модулі `utils/enhancedSanitizers.ts`
2. Переконайтеся, що функція обробляє всі можливі типи даних: `undefined`, `null`, дати, масиви, вкладені об'єкти
3. Додайте обробку помилок для захисту від критичних помилок

```javascript
// Приклад реалізації sanitizer
export const sanitizer = (data: any): any => {
  try {
    if (data === undefined || data === null) return {};
    
    if (typeof data !== 'object') return data;
    
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    if (Array.isArray(data)) {
      return data.map(item => sanitizer(item));
    }
    
    const result = {};
    
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        
        if (typeof value === 'function' || typeof value === 'symbol') {
          continue;
        }
        
        if (value === undefined) {
          result[key] = null;
        } else {
          result[key] = sanitizer(value);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Помилка в функції sanitizer:', error);
    return {};
  }
};
```

4. Замініть імпорт у всіх компонентах, які використовують `sanitizer`:

```javascript
// Замість
import { sanitizer } from '../../utils/sanitizers';

// Використовуйте
import { sanitizer } from '../../utils/enhancedSanitizers';
```

## Проблема 2: `TypeError: Cannot read property 'displayName' of undefined`

### Причина
Ця помилка виникає через конфлікт між `react-native-css-interop` (використовується NativeWind) та `react-native-safe-area-context`. Функція `maybeHijackSafeAreaProvider` намагається отримати `displayName` від компонента, який може бути `undefined`.

### Вирішення

1. **Використовуйте HOC для додавання displayName:**

```javascript
// src/utils/componentUtils.ts
export function withSafeDisplayName<P>(Component: React.ComponentType<P>, name?: string): React.ComponentType<P> {
  const displayName = name || Component.name || 'UnnamedComponent';
  Component.displayName = displayName;
  return Component;
}

// Використання
import { withSafeDisplayName } from '../utils/componentUtils';

const SafeProjectDetails = withSafeDisplayName(ProjectDetails);
```

2. **Встановлюйте displayName безпосередньо в компонентах:**

```javascript
// В кінці файлу компонента
ProjectDetails.displayName = 'ProjectDetails';
export default ProjectDetails;
```

3. **Покращений компонент ErrorBoundary:**

Використовуйте компонент `EnhancedErrorBoundary`, який розпізнає та обробляє специфічні помилки пов'язані з `displayName`.

```javascript
// Замість
import ErrorBoundary from '../components/ErrorBoundary';

// Використовуйте
import ErrorBoundary from '../components/EnhancedErrorBoundary';
```

4. **Патч для `react-native-css-interop`:**

HOC для захисту від помилок CSS-interop:

```javascript
export function patchReactNativeComponents(): void {
  try {
    const cssInterop = require('react-native-css-interop');
    
    if (cssInterop && cssInterop.__internalMaybeHijackSafeAreaProvider) {
      const originalFunc = cssInterop.__internalMaybeHijackSafeAreaProvider;
      
      cssInterop.__internalMaybeHijackSafeAreaProvider = function (type) {
        if (!type) return type;  // Захист від undefined
        return originalFunc(type);
      };
    }
  } catch (error) {
    console.warn('Не вдалося застосувати патч для CSS-interop:', error);
  }
}
```

## Загальні рекомендації

1. **Завжди додавайте `displayName` до всіх компонентів:**
   ```javascript
   const MyComponent = () => { /* ... */ };
   MyComponent.displayName = 'MyComponent';
   ```

2. **Використовуйте вдосконалений `ErrorBoundary`** для всіх компонентів, які можуть викликати помилки.

3. **Позбудьтесь невикористовуваного коду** в основних компонентах (наприклад, `AppContent` в `App.tsx`).

4. **Використовуйте багаторівневі тести** для перевірки інтеграції між бібліотеками.

5. **Оновлюйте пакети** до останніх версій, де ці проблеми можуть бути вирішені, зокрема `react-native-css-interop` та `NativeWind`.

## Специфічні підходи при роботі з WatermelonDB

1. **Завжди використовуйте санітизацію даних** перед збереженням об'єктів JSON.

2. **Перевіряйте типи даних** перед передачею в WatermelonDB.

3. **Використовуйте обробку помилок** при санітизації даних.

## Висновки

Проблеми взаємодії між бібліотеками в React Native часто виникають через "monkey patching" та модифікацію поведінки інших бібліотек в неявний спосіб. Використовуйте захисні обгортки та ретельно тестуйте взаємодію між компонентами та бібліотеками.