const fs = require('fs');
const path = require('path');

// Базова директорія проекту
const rootDir = path.join(__dirname, 'src');

// Файли, які мають розширення .ts, але повинні бути .tsx
const shouldBeTsx = [
  'utils/componentUtils.ts',
  'utils/diagnostics.ts',
];

// Перевіряємо, чи існує файл і перейменовуємо його
function renameToTsx(relativePath) {
  const fullPath = path.join(rootDir, relativePath);
  const newPath = fullPath.replace(/\.ts$/, '.tsx');
  
  if (fs.existsSync(fullPath)) {
    console.log(`Перейменування: ${relativePath} → ${relativePath.replace(/\.ts$/, '.tsx')}`);
    
    try {
      // Копіюємо файл
      fs.copyFileSync(fullPath, newPath);
      // Видаляємо оригінальний файл
      fs.unlinkSync(fullPath);
      return true;
    } catch (error) {
      console.error(`Помилка при перейменуванні ${relativePath}:`, error);
      return false;
    }
  } else {
    // Файл вже перейменовано або не існує
    console.log(`Файл ${relativePath} вже перейменовано або не існує`);
    return fs.existsSync(newPath);
  }
}

// Основна функція
function main() {
  console.log('Перейменування .ts файлів на .tsx...');
  
  let success = true;
  
  // Перебираємо всі файли, які потрібно перейменувати
  for (const file of shouldBeTsx) {
    if (!renameToTsx(file)) {
      success = false;
    }
  }
  
  if (success) {
    console.log('\nВсі файли успішно перейменовано!');
    console.log('Наступний крок: запустіть "npm run android:dev" для очищення кешу Metro та перезапуску додатку.');
  } else {
    console.log('\nДеякі файли не вдалося перейменувати. Дивіться помилки вище.');
  }
}

// Запускаємо скрипт
main();