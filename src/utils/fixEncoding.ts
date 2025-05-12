/**
 * @fileoverview Утиліта для виправлення кодування українських символів в файлах
 */

const fs = require('fs');
const path = require('path');

/**
 * Декодування Unicode escape послідовностей в нормальні символи
 * @param {string} text Текст з Unicode escape послідовностями
 * @returns {string} Декодований текст
 */
export function decodeUnicodeEscapes(text: string): string {
  // Знаходимо всі Unicode escape послідовності вигляду u04XX
  return text.replace(/u([0-9a-fA-F]{4})/g, (match, charCode) => {
    return String.fromCharCode(parseInt(charCode, 16));
  });
}

/**
 * Виправлення кодування в файлі
 * @param {string} filePath Шлях до файлу
 * @returns {Promise<boolean>} Чи були внесені зміни
 */
export async function fixFileEncoding(filePath: string): Promise<boolean> {
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
    
    return true;
  } catch (error) {
    console.error(`Помилка при виправленні кодування в ${filePath}:`, error);
    return false;
  }
}