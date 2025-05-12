import { Platform } from 'react-native';
import { database } from './database';
import { synchronizeDatabase } from '../sync/syncService';

export const setupDatabase = async () => {
  try {
    // Ініціалізація бази даних
    await database.write(async () => {
      // Тут можна виконати початкові операції з базою даних
      console.log('База даних успішно ініціалізована');
    });

    // Спроба синхронізації при запуску, якщо є підключення до інтернету
    if (Platform.OS !== 'web') {
      try {
        await synchronizeDatabase();
      } catch (syncError) {
        console.warn('Не вдалося синхронізувати базу даних при запуску:', syncError);
        // Продовжуємо роботу навіть якщо синхронізація не вдалася
      }
    }

    return true;
  } catch (error) {
    console.error('Помилка при налаштуванні бази даних:', error);
    return false;
  }
};

export default setupDatabase;