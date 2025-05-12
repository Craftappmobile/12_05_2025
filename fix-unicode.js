/**
 * Скрипт для виправлення Unicode-екранування кирилиці в файлах проєкту
 */
const fs = require('fs');
const path = require('path');

// Функція для рекурсивного перебору директорій
function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // Ігноруємо node_modules, .git та інші службові директорії
    if (
      file === 'node_modules' ||
      file === '.git' ||
      file === '.expo' ||
      file === 'android' ||
      file === 'ios' ||
      file === 'build' ||
      file === 'dist'
    ) {
      continue;
    }
    
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (
      // Перевіряємо тільки текстові файли
      file.endsWith('.js') ||
      file.endsWith('.jsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.json') ||
      file.endsWith('.md') ||
      file.endsWith('.html') ||
      file.endsWith('.css')
    ) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

// Функція для виправлення Unicode-екранування в файлі
function fixUnicodeInFile(filePath) {
  try {
    // Читаємо вміст файлу
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Шукаємо паттерн Unicode-екранування кирилиці
    const unicodePattern = /u([0-4][0-9a-fA-F]{3})/g;
    
    // Перевіряємо, чи є відповідні співпадіння в файлі
    if (unicodePattern.test(content)) {
      console.log(`Виправляємо файл: ${filePath}`);
      
      // Заміняємо Unicode-екранування на справжні символи
      const fixedContent = content.replace(unicodePattern, (match, code) => {
        return String.fromCharCode(parseInt(code, 16));
      });
      
      // Записуємо виправлений файл
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Помилка при обробці файлу ${filePath}:`, error.message);
    return false;
  }
}

// Головна функція
function fixUnicodeInProject() {
  console.log('Пошук файлів з Unicode-екранованою кирилицею...');
  
  // Отримуємо список всіх файлів проєкту
  const files = walkDir(__dirname);
  
  console.log(`Знайдено ${files.length} файлів для перевірки`);
  
  // Рахуємо кількість виправлених файлів
  let fixedFiles = 0;
  
  // Обробляємо кожен файл
  for (const file of files) {
    if (fixUnicodeInFile(file)) {
      fixedFiles++;
    }
  }
  
  console.log(`Виправлено ${fixedFiles} файлів`);
  console.log('Завершено!');
}

// Запускаємо головну функцію
fixUnicodeInProject();