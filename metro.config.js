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
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json']
  },
};

// Об'єднуємо конфігурації
const mergedConfig = mergeConfig(reactNativeConfig, expoConfig);

// Додаємо підтримку кириличних символів
mergedConfig.resolver.sourceExts = process.env.RN_SRC_EXT
  ? [...process.env.RN_SRC_EXT.split(',').map(ext => ext.trim()), ...mergedConfig.resolver.sourceExts]
  : mergedConfig.resolver.sourceExts;

// Встановлюємо фіксований порт для Metro Bundler
mergedConfig.server = {
  port: 8083
};

// Додаємо налаштування для вирішення проблеми з .expo/.virtual-metro-entry
mergedConfig.resolver.extraNodeModules = {
  ...mergedConfig.resolver.extraNodeModules,
  '.expo': __dirname + '/.expo',
};

// Налаштування для NativeWind
module.exports = withNativeWind(mergedConfig, { input: "./global.css" });
