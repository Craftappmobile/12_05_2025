/**
 * Скрипт для виправлення кодування у файлах
 * Замінює Unicode-коди на пряму кирилицю
 */

const fs = require('fs');
const path = require('path');

// Шлях до файлу, який треба виправити
const filePaths = [
  path.join(__dirname, 'src', 'screens', 'projects', 'ClassProjectDetails.tsx'),
  // Додайте інші файли за потреби
];

function decodeUnicodeEscapeSequences(text) {
  return text.replace(/u([0-9a-fA-F]{4})/g, (match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

filePaths.forEach(filePath => {
  console.log(`Обробка файлу: ${filePath}`);
  
  try {
    // Зчитуємо вміст файлу
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Виправляємо кодування
    const fixedContent = decodeUnicodeEscapeSequences(content);
    
    // Зберігаємо виправлений вміст
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    
    console.log(`✅ Файл успішно виправлено: ${filePath}`);
  } catch (error) {
    console.error(`❌ Помилка при обробці файлу ${filePath}:`, error);
  }
});

console.log('Обробка завершена!');