const fs = require('fs');
const path = require('path');

// Шлях до проблемного файлу
const filePath = path.join(
  __dirname,
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'third-party-libs',
  'react-native-safe-area-context.native.js'
);

console.log('Шукаємо файл:', filePath);

if (fs.existsSync(filePath)) {
  console.log('Файл знайдено, застосовуємо патч...');
  
  // Читаємо вміст файлу
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Оригінальний код функції
  const originalFunctionStart = 'function maybeHijackSafeAreaProvider(type) {';
  
  // Новий код з перевіркою на undefined
  const patchedFunctionStart = 'function maybeHijackSafeAreaProvider(type) {\n    if (!type) return type;';
  
  // Перевіряємо чи вже містить патч
  if (content.includes(patchedFunctionStart)) {
    console.log('Файл вже мiстить патч, змін не потрібно');
  } else {
    // Застосовуємо патч
    const patchedContent = content.replace(originalFunctionStart, patchedFunctionStart);
    
    // Зберігаємо змінений файл
    fs.writeFileSync(filePath, patchedContent, 'utf8');
    console.log('Патч успішно застосовано!');
  }
} else {
  console.error('Файл не знайдено!');
}

// Перевіряємо також web-версію файлу
const webFilePath = path.join(
  __dirname,
  'node_modules',
  'react-native-css-interop',
  'dist',
  'runtime',
  'third-party-libs',
  'react-native-safe-area-context.js'
);

console.log('\nШукаємо web-версію файлу:', webFilePath);

if (fs.existsSync(webFilePath)) {
  console.log('Web-файл знайдено, застосовуємо патч...');
  
  // Читаємо вміст файлу
  let content = fs.readFileSync(webFilePath, 'utf8');
  
  // Оригінальний код функції
  const originalFunctionStart = 'function maybeHijackSafeAreaProvider(type) {';
  
  // Новий код з перевіркою на undefined
  const patchedFunctionStart = 'function maybeHijackSafeAreaProvider(type) {\n    if (!type) return type;';
  
  // Перевіряємо чи вже містить патч
  if (content.includes(patchedFunctionStart)) {
    console.log('Web-файл вже мiстить патч, змін не потрібно');
  } else {
    // Застосовуємо патч
    const patchedContent = content.replace(originalFunctionStart, patchedFunctionStart);
    
    // Зберігаємо змінений файл
    fs.writeFileSync(webFilePath, patchedContent, 'utf8');
    console.log('Патч для web-версії успішно застосовано!');
  }
} else {
  console.log('Web-файл не знайдено або не використовується у проекті');
}

console.log('\nПроцес патчу завершено. Тепер очистіть кеш та перезапустіть додаток:');
console.log('npm run start:clear');