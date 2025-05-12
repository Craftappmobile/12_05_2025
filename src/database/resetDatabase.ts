import { database } from './index';

/**
 * Функція для скидання даних в базі даних
 * Корисно для тестування та розробки
 */
export async function resetDatabase() {
  try {
    console.log('Починаємо скидання бази даних...');
    
    // Ця функція доступна тільки в режимі розробки
    await database.write(async () => {
      await database.unsafeResetDatabase();
    });
    
    console.log('База даних успішно скинута!');
    
    return true;
  } catch (error) {
    console.error('Помилка при скиданні бази даних:', error);
    return false;
  }
}