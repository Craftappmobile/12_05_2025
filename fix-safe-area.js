// fix-safe-area.js - скрипт для виправлення помилки з SafeAreaProvider в Bridgeless режимі
const fs = require('fs');
const path = require('path');

console.log('Перевірка на помилки з SafeAreaProvider в react-native-css-interop...');

// Шлях до базової директорії
const basePath = path.join(__dirname, 'node_modules');

// Шлях до проблемного файлу для нативного коду
const safeAreaNativeFilePath = path.join(
  basePath,
  'react-native-css-interop',
  'dist',
  'runtime',
  'third-party-libs',
  'react-native-safe-area-context.native.js'
);

// Шлях до проблемного файлу для web
const safeAreaWebFilePath = path.join(
  basePath,
  'react-native-css-interop',
  'dist',
  'runtime',
  'third-party-libs',
  'react-native-safe-area-context.js'
);

// Функція для виправлення проблеми з SafeAreaProvider
function fixSafeAreaProviderFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Файл не знайдено: ${filePath}`);
    return false;
  }

  try {
    // Читаємо вміст файлу
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Шукаємо патерн для заміни
    const patternToReplace = /if\s*\(\s*SafeAreaProvider\.displayName\s*===\s*/;
    const replacement = 'if (SafeAreaProvider && SafeAreaProvider.displayName === ';
    
    // Перевіряємо, чи потрібна заміна
    if (patternToReplace.test(content)) {
      // Виконуємо заміну
      content = content.replace(patternToReplace, replacement);
      
      // Записуємо зміни назад у файл
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Успішно застосовано патч для ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`ℹ️ Патч не потрібен або вже застосований для ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Помилка при патчі файлу ${path.basename(filePath)}:`, error);
    return false;
  }
}

// Виправляємо файли SafeAreaProvider
let safeAreaFixed = false;

if (fixSafeAreaProviderFile(safeAreaNativeFilePath)) {
  safeAreaFixed = true;
}

if (fixSafeAreaProviderFile(safeAreaWebFilePath)) {
  safeAreaFixed = true;
}

if (safeAreaFixed) {
  console.log('Патч для SafeAreaProvider успішно застосовано!');
} else {
  console.log('Проблему з SafeAreaProvider не знайдено або вже виправлено.');
}

console.log('\nВиправлення завершено. Перезапустіть додаток з очищеним кешем.');