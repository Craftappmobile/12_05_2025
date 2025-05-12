# Додаткові поради при проблемах з рендерингом

Якщо тестовий додаток з TestApp.tsx теж не запускається, спробуйте ці кроки:

## 1. Запустіть очищення кешу Metro

```bash
fix-metro-cache.bat
```

## 2. Перевірте вимоги додатку

```bash
pnx expo doctor
```

## 3. Встановіть необхідні залежності

```bash
npm install @react-navigation/native@7.0.0 @react-navigation/native-stack@7.0.0 @react-navigation/bottom-tabs@7.0.0
```

## 4. Чистий запуск 

Встановіть нову мінімальну версію додатку для тестування:

1. Створіть новий файл MinimalApp.tsx:

```javascript
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

2. Змініть index.ts:

```javascript
import { registerRootComponent } from 'expo';
import MinimalApp from './MinimalApp';

registerRootComponent(MinimalApp);
```

## 5. Необхідні пакети

Перевірте, чи встановлено всі обов'язкові пакети для роботи з React Native:

```bash
npm install expo-font react-native-svg lucide-react-native react-native-reanimated react-native-gesture-handler nativewind
```

## 6. Перевірка залежностей

```bash
npm audit fix
npm dedupe
```

## 7. Виправлення конфігурації Metro

Якщо є проблеми з Metro bundler, спробуйте налаштувати metro.config.js:

```javascript
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Додаємо підтримку кириличних символів
config.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...config.resolver.sourceExts]
  : config.resolver.sourceExts;

// Спрощений конфіг, базовий
module.exports = config;
```