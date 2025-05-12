/**
 * Компонент для менеджменту бази даних
 */
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { resetDatabaseLazy, seedTestDataLazy } from '../database/lazy-imports';

// Функція для повного скидання та повторної ініціалізації бази даних
export const resetAndSeedDatabase = async (): Promise<boolean> => {
  try {
    console.log('Починаючи скидання і повторну ініціалізацію бази даних...');
    await resetDatabaseLazy();
    await seedTestDataLazy();
    console.log('Базу даних успішно скинуто і ініціалізовано!');
    return true;
  } catch (error) {
    console.error('Помилка при скиданні бази даних:', error);
    return false;
  }
};

// Компонент для менеджменту бази даних в режимі розробки
interface DatabaseManagerProps {
  resetOnStart?: boolean;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ resetOnStart = false }) => {
  useEffect(() => {
    const initDatabase = async () => {
      // Скидаємо базу даних та створюємо тестові дані при запуску
      if (resetOnStart) {
        try {
          const result = await resetAndSeedDatabase();
          if (result) {
            Alert.alert('Успіх', 'Базу даних успішно скинуто і підготовлено тестові дані');
          } else {
            Alert.alert('Помилка', 'Не вдалося скинути базу даних');
          }
        } catch (error) {
          console.error('Помилка при ініціалізації бази даних:', error);
        }
      } else {
        // Тільки ініціалізуємо тестові дані, якщо база порожня
        try {
          await seedTestDataLazy();
        } catch (error) {
          console.error('Помилка при ініціалізації тестових даних:', error);
        }
      }
    };

    // Викликаємо ініціалізацію при монтуванні компонента
    initDatabase();
  }, [resetOnStart]);

  // Компонент не відображає нічого
  return null;
};

export default DatabaseManager;