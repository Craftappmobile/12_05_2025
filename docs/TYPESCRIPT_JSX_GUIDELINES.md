# Рекомендації щодо роботи з TypeScript і JSX у додатку "Розрахуй і В'яжи"

## Розширення файлів

1. **`.ts`** - для звичайних TypeScript файлів без JSX
2. **`.tsx`** - для TypeScript файлів, які містять JSX синтаксис

## Типові помилки

### 1. Використання JSX у `.ts` файлі

```typescript
// ПОМИЛКА: Використання JSX в .ts файлі
const MyComponent = (props) => {
  return <div>{props.text}</div>; // SyntaxError: Unexpected token
};
```

### Вирішення

1. **Перейменувати файл на `.tsx`** - найпростіше рішення

2. **Замінити JSX на React.createElement**
   ```typescript
   // ПРАВИЛЬНО: Використання React.createElement в .ts файлі
   const MyComponent = (props) => {
     return React.createElement('div', {}, props.text);
   };
   ```

## Правила кодування

1. **Утиліти без JSX** - Зберігайте утилітарні функції без JSX у `.ts` файлах

2. **Компоненти з JSX** - Завжди використовуйте `.tsx` для файлів з компонентами

3. **HOC специфіка** - Для передачі props у HOC використовуйте spread-оператор тільки в `.tsx` файлах:
   ```tsx
   // ПРАВИЛЬНО (.tsx):
   return <Component {...props} />;
   ```
   
   ```ts
   // ПРАВИЛЬНО (.ts):
   return React.createElement(Component, props);
   ```

## Перевірка файлів на правильність

Для перевірки файлів на наявність JSX синтаксису в `.ts` файлах можна використати наш скрипт `check-jsx-files.bat`:

```batch
check-jsx-files.bat
```

## Рекомендації для нових файлів

1. Використовуйте `.tsx` для всіх файлів, де може бути JSX, навіть якщо зараз там його немає.

   **Важливо!** Навіть якщо ви змінюєте JSX на `React.createElement()` у `.ts` файлі, це може не вирішити проблему через кешування Metro bundler або нюанси з NativeWind. Краще завжди використовувати правильне розширення `.tsx` для файлів, що працюють з React компонентами.

2. Створюйте чіткий розподіл на:
   - `/components/` - `.tsx` файли
   - `/utils/` - переважно `.ts` файли
   - `/hooks/` - `.tsx` файли, якщо вони повертають JSX

## Налаштування імпортів

При зміні розширення файлів з `.ts` на `.tsx` потрібно перевірити і оновити імпорти у всіх файлах, де ці модулі використовуються. Наприклад:

```typescript
// З 
import { createSafeComponent } from './utils/componentUtils';

// На
import { createSafeComponent } from './utils/componentUtils.tsx';
```

## Налаштування TypeScript

Для правильної роботи з JSX переконайтеся, що в `tsconfig.json` має правильні налаштування:

```json
{
  "compilerOptions": {
    "jsx": "react",
    // інші налаштування...
  }
}
```

Примітка: Якщо ви використовуєте `expo/tsconfig.base`, ці налаштування вже можуть бути включені.