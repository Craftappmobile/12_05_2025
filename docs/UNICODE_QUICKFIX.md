# Швидке виправлення проблем з Unicode в React Native

## Якщо замість українських символів видно коди `Тест`:

1. **Очистіть кеш Metro:**
   ```bash
   fix-metro-cache.bat
   # або 
   npm start -- --reset-cache
   ```

2. **Використовуйте мінімальний додаток для перевірки:**
   ```jsx
   import React from 'react';
   import { View, Text } from 'react-native';

   const MinimalApp = () => {
     return (
       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
         <Text>Мінімальний додаток працює!</Text>
       </View>
     );
   };

   export default MinimalApp;
   ```

3. **Змініть index.ts:**
   ```js
   import { registerRootComponent } from 'expo';
   import MinimalApp from './MinimalApp';
   registerRootComponent(MinimalApp);
   ```

4. **Перевірте в окремому файлі:**
   ```js
   // debug-text.js
   console.log('Тест кодування');
   console.log('\Т\е\с\т'); // Тест
   ```

5. **Виділяйте текст у змінні:**
   ```js
   const text = 'Тест';
   return <Text>{text}</Text>;
   ```

## Важливі правила:

- Зберігайте файли в UTF-8
- Не копіюйте текст з PDF
- Уникайте ручного введення Unicode-ескейпів
- Використовуйте рядки тексту напряму: `'Текст'`

## Додаткова інформація знаходиться в:

`docs/BEST_PRACTICES_ЛОКАЛІЗАЦІЯ.md`