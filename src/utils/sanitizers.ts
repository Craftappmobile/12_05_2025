/**
 * @fileoverview Утиліти для обробки даних перед збереженням
 */

/**
 * Функція для санітації даних перед збереженням у базу даних
 * Перетворює дані в формат, який можна зберегти в базі даних WatermelonDB
 * Обробляє спеціальні типи даних (Date, undefined), які не можуть бути серіалізовані JSON.stringify
 * 
 * @param {any} data Дані для обробки
 * @returns {any} Оброблені дані, безпечні для зберігання
 */
export const sanitizer = (data: any): any => {
  // Захист від undefined або null
  if (data === undefined || data === null) return {};
  
  // Обробка примітивних типів
  if (typeof data !== 'object') return data;
  
  // Обробка дати
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  // Обробка масивів
  if (Array.isArray(data)) {
    return data.map(item => sanitizer(item));
  }
  
  // Обробка звичайних об'єктів
  const result: Record<string, any> = {};
  
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      
      // Пропускаємо функції та символи
      if (typeof value === 'function' || typeof value === 'symbol') {
        continue;
      }
      
      // Обробка undefined - перетворюємо на null для JSON
      if (value === undefined) {
        result[key] = null;
      } else {
        // Рекурсивна обробка вкладених об'єктів
        result[key] = sanitizer(value);
      }
    }
  }
  
  return result;
};

/**
 * Функція для перевірки, чи є значення числом
 * @param {any} value Значення для перевірки
 * @returns {boolean} true, якщо значення є числом
 */
export const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return true;
  if (typeof value !== 'string') return false;
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};

/**
 * Функція для конвертації рядка в число
 * @param {string} value Рядок для конвертації
 * @param {number} defaultValue Значення за замовчуванням
 * @returns {number} Конвертоване число або значення за замовчуванням
 */
export const toNumber = (value: string, defaultValue: number = 0): number => {
  if (!value || !isNumeric(value)) return defaultValue;
  return Number(value);
};