/**
 * Скрипт для виправлення помилки Metro Bundler з .expo/.virtual-metro-entry
 * Запустіть цей скрипт перед запуском додатку, якщо виникає помилка 404
 */

const fs = require('fs');
const path = require('path');

// Шлях до директорії .expo
const expoDir = path.join(__dirname, '.expo');

// Створюємо директорію .expo, якщо вона не існує
if (!fs.existsSync(expoDir)) {
  console.log('Створення директорії .expo...');
  fs.mkdirSync(expoDir);
}

// Шлях до віртуального файлу входу
const virtualEntryPath = path.join(expoDir, '.virtual-metro-entry.js');

// Створюємо віртуальний файл входу
const virtualEntryContent = `
// Автоматично створений файл для вирішення помилки Metro Bundler
import { registerRootComponent } from 'expo';
import App from '../App';

registerRootComponent(App);
`;

// Записуємо вміст у файл
fs.writeFileSync(virtualEntryPath, virtualEntryContent);

console.log('Віртуальний файл входу створено за шляхом:', virtualEntryPath);
console.log('Тепер ви можете запустити додаток командою:');
console.log('npx expo start --clear');