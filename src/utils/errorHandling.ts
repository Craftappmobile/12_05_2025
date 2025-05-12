/**
 * @fileoverview Функції для обробки помилок в додатку
 */

/**
 * Функція для обробки та логування помилок
 * @param {any} error Об'єкт помилки
 * @param {string} context Контекст, в якому виникла помилка
 * @returns {string} Форматоване повідомлення про помилку
 */
export const handleError = (error: any, context: string = 'unknown'): string => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[ERROR in ${context}]:`, error);
  
  // Додаткова інформація для відлагодження
  if (error instanceof Error && error.stack) {
    console.error('Stack trace:', error.stack);
  }
  
  return `Помилка: ${message}`;
};

/**
 * Функція для перевірки наявності обов'язкових параметрів
 * @param {Record<string, any>} params Параметри для перевірки
 * @param {string[]} requiredFields Масив назв обов'язкових полів
 * @returns {boolean} Результат перевірки
 */
export const validateRequiredParams = (params: Record<string, any>, requiredFields: string[]): string | null => {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      return `Відсутній обов'язковий параметр: ${field}`;
    }
  }
  return null;
};