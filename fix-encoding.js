/**
 * Скрипт для автоматичного виправлення кодування українських символів у файлах
 */

const fs = require('fs');
const path = require('path');

const SEARCH_DIR = path.join(__dirname, 'src');
const FILE_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

/**
 * Декодування Unicode escape послідовностей в нормальні символи
 * @param {string} text Текст з Unicode escape послідовностями
 * @returns {string} Декодований текст
 */
function decodeUnicodeEscapes(text) {
  // Знаходимо всі Unicode escape послідовності вигляду u04XX (кирилиця) та інші
  // Обробка двох випадків:
  // 1. \і - зворотній слеш вже екранований у рядку як \\ (два бекслеші)
  // 2. і - звичайний запис без слешів
  
  // Спочатку виправляємо класичний формат \uXXXX з подвійними слешами
  let fixed = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, charCode) => {
    return String.fromCharCode(parseInt(charCode, 16));
  });
  
  // Потім виправляємо спрощений формат uXXXX без слешів
  // але тільки якщо це кирилиця (u04XX або u05XX)
  fixed = fixed.replace(/u(04[0-9a-fA-F]{2}|05[0-9a-fA-F]{2})/g, (match, charCode) => {
    return String.fromCharCode(parseInt(charCode, 16));
  });
  
  return fixed;
}

/**
 * Виправлення кодування в файлі
 * @param {string} filePath Шлях до файлу
 * @returns {Promise<boolean>} Чи були внесені зміни
 */
async function fixFileEncoding(filePath) {
  try {
    // Читаємо файл
    const content = await fs.promises.readFile(filePath, 'utf8');
    
    // Декодуємо Unicode escape послідовності
    const fixedContent = decodeUnicodeEscapes(content);
    
    // Якщо вміст не змінився, повертаємо false
    if (content === fixedContent) {
      return false;
    }
    
    // Зберігаємо виправлений файл
    await fs.promises.writeFile(filePath, fixedContent, 'utf8');
    console.log(`\x1b[32mВиправлено кодування в ${filePath}\x1b[0m`);
    
    return true;
  } catch (error) {
    console.error(`\x1b[31mПомилка при виправленні кодування в ${filePath}:\x1b[0m`, error);
    return false;
  }
}

/**
 * Рекурсивний обхід директорії та виправлення кодування в файлах
 * @param {string} dir Шлях до директорії
 * @returns {Promise<number>} Кількість виправлених файлів
 */
async function processDirectory(dir) {
  let fixedCount = 0;
  
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Рекурсивний обхід піддиректорій
        fixedCount += await processDirectory(fullPath);
      } else if (entry.isFile() && FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        // Перевірка на наявність Unicode escape послідовностей
        const content = await fs.promises.readFile(fullPath, 'utf8');
        if (content.includes('u04')) {
          const fixed = await fixFileEncoding(fullPath);
          if (fixed) fixedCount++;
        }
      }
    }
  } catch (error) {
    console.error(`\x1b[31mПомилка при обробці директорії ${dir}:\x1b[0m`, error);
  }
  
  return fixedCount;
}

/**
 * Головна функція
 */
async function main() {
  console.log('\x1b[33mПочинаємо виправлення кодування українських символів...\x1b[0m');
  
  const startTime = Date.now();
  const fixedCount = await processDirectory(SEARCH_DIR);
  const endTime = Date.now();
  
  console.log(`\x1b[33mВиправлення завершено. Виправлено ${fixedCount} файлів за ${(endTime - startTime) / 1000} секунд.\x1b[0m`);
}

// Запуск скрипта
main().catch(error => {
  console.error('\x1b[31mГлобальна помилка:\x1b[0m', error);
});