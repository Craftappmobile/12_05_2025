# Вирішення проблем запуску Metro bundler

У цьому документі описані можливі способи вирішення проблеми з Metro bundler, коли виникає помилка `Cannot read properties of undefined (reading 'handle')`.

## Робочі скрипти для запуску

1. **install-deps.bat** - Встановлює необхідні залежності та перезапускає Metro
   ```
   install-deps.bat
   ```

2. **start-expo.bat** - Запускає додаток через Expo CLI
   ```
   start-expo.bat
   ```

3. **clear-restart.bat** - Очищує кеш та перезапускає сервер
   ```
   clear-restart.bat
   ```

## Альтернативні методи запуску

1. **Скинути кеш WatchMan** (якщо встановлено)
   ```
   watchman watch-del-all
   ```

2. **Запустити андроїд-додаток без Metro bundler**
   ```
   npm run android -- --no-packager
   ```
   Потім запустити Metro окремо:
   ```
   npx expo start --clear
   ```

3. **Видалити node_modules та перевстановити залежності**
   ```
   npm run clean:windows
   ```

## Оновлення Metro Config

Ми оновили `metro.config.js` для відповідності новим вимогам React Native 0.73+:

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { mergeConfig } = require('@react-native/metro-config');

// Отримуємо базову конфігурацію від Expo
const expoConfig = getDefaultConfig(__dirname);

// Базова конфігурація від React Native
const reactNativeConfig = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

// Об'єднуємо конфігурації
const mergedConfig = mergeConfig(reactNativeConfig, expoConfig);

// Додаткові налаштування...

// Налаштування для NativeWind
module.exports = withNativeWind(mergedConfig, { input: "./global.css" });
```

## Підсумок

Якщо жоден з цих методів не допомагає, спробуйте запустити додаток без режиму Bridgeless:

```
npx expo start --no-dev-client --clear
```

Або використовуйте створений скрипт `start-no-bridge.bat`.