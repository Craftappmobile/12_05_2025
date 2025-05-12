// Завантажуємо змінні середовища
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = { 
  name: 'Розрахуй і В\'яжи', 
  slug: 'calculate-and-knit', 
  scheme: 'calculate-and-knit',
  version: '1.0.0', 
  orientation: 'portrait', 
  icon: './assets/icon.png', 
  userInterfaceStyle: 'automatic', 
  entryPoint: "./App.tsx", // Явно вказуємо точку входу
  splash: { 
    image: './assets/splash.png', 
    resizeMode: 'contain', 
    backgroundColor: '#ffffff' 
  }, 
  assetBundlePatterns: ['**/*'], 
  ios: { 
    supportsTablet: true,
    bundleIdentifier: 'com.calculate.and.knit'
  }, 
  android: { 
    adaptiveIcon: { 
      foregroundImage: './assets/adaptive-icon.png', 
      backgroundColor: '#ffffff' 
    },
    package: 'com.calculate.and.knit'
  }, 
  web: { 
    favicon: './assets/favicon.png' 
  }, 
  extra: { 
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL, 
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY, 
    eas: {
      projectId: "your-project-id"
    }
  }, 
  plugins: ['expo-router'],
  newArchEnabled: true,
  // Додаємо підтримку шрифтів
  fonts: [
    {
      asset: './assets/fonts/Roboto-Regular.ttf',
      fontFamily: 'Roboto',
    },
    {
      asset: './assets/fonts/Roboto-Bold.ttf',
      fontFamily: 'Roboto_Bold',
    },
  ],
};
