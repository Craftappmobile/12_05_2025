/**
 * @fileoverview Покращені утиліти для обробки даних перед збереженням
 */

/**
 * Функція для санітації даних перед збереженням у базу даних
 * Перетворює дані в формат, який можна зберегти в базі даних WatermelonDB
 * Обробляє спеціальні типи даних (Date, undefined), які не можуть бути серіалізовані JSON.stringify
 * 
 * @param {Record<string, any> | any[] | any} data Дані для обробки
 * @returns {Record<string, any> | any[] | any} Оброблені дані, безпечні для зберігання
 */
export const sanitizer = (data: Record<string, any> | any[] | any): Record<string, any> | any[] | any => {
  try {
    // Захист від undefined або null
    if (data === undefined || data === null) {
      return {};
    }
    
    // Обробка примітивних типів
    if (typeof data !== 'object') {
      return data;
    }
    
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
        } else if (value instanceof Date) {
          // Обробка дати
          result[key] = value.toISOString();
        } else if (Array.isArray(value)) {
          // Обробка масивів
          result[key] = value.map(item => sanitizer(item));
        } else if (value === null) {
          // Залишаємо null як є
          result[key] = null;
        } else if (typeof value === 'object') {
          // Рекурсивна обробка вкладених об'єктів
          result[key] = sanitizer(value);
        } else {
          // Примітивні типи залишаємо як є
          result[key] = value;
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Помилка в функції sanitizer:', error);
    // У випадку помилки повертаємо пустий об'єкт як безпечне значення
    return {};
  }
};

/**
 * Функція для перевірки, чи є значення числом
 * @param {any} value Значення для перевірки
 * @returns {boolean} true, якщо значення є числом
 */
export const isNumeric = (value: any): boolean => {
  if (typeof value === 'number') return !isNaN(value) && isFinite(value);
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

/**
 * Функція для форматування дати в рядок
 * @param {Date | string | number} date Дата для форматування
 * @param {string} format Формат дати (default: 'dd.MM.yyyy')
 * @returns {string} Відформатований рядок дати
 */
export const formatDate = (date: Date | string | number, format: string = 'dd.MM.yyyy'): string => {
  try {
    const d = typeof date === 'object' ? date : new Date(date);
    
    // Перевірка на валідність дати
    if (isNaN(d.getTime())) {
      return 'Недійсна дата';
    }
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    let result = format;
    result = result.replace('dd', day);
    result = result.replace('MM', month);
    result = result.replace('yyyy', year.toString());
    return result;
  } catch (error) {
    console.error('Помилка форматування дати:', error);
    return 'Помилка дати';
  }
};