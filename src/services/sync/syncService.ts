import { database } from '../db';
import { supabase } from '../auth/supabaseClient';
import { synchronize } from '@nozbe/watermelondb/sync';
import appConfig from '../../config/appConfig';

// Функція для отримання змін з Supabase
const pullChanges = async ({ lastPulledAt }) => {
  try {
    // Перевіряємо підключення до інтернету
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.log('Немає підключення до інтернету. Використовуємо локальні дані.');
      return {
        changes: {
          projects: { created: [], updated: [], deleted: [] },
          calculations: { created: [], updated: [], deleted: [] },
        },
        timestamp: Date.now(),
      };
    }

    // Отримуємо зміни для проєктів
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .gt('updated_at', lastPulledAt);

    if (projectsError) {
      console.error('Помилка при отриманні проєктів:', JSON.stringify(projectsError));
      // Не кидаємо помилку, а повертаємо порожні дані
      return {
        changes: {
          projects: { created: [], updated: [], deleted: [] },
          calculations: { created: [], updated: [], deleted: [] },
        },
        timestamp: Date.now(),
      };
    }

    // Отримуємо зміни для розрахунків
    const { data: calculationsData, error: calculationsError } = await supabase
      .from('calculations')
      .select('*')
      .gt('created_at', lastPulledAt);

    if (calculationsError) {
      console.error('Помилка при отриманні розрахунків:', JSON.stringify(calculationsError));
      // Не кидаємо помилку, а повертаємо порожні дані
      return {
        changes: {
          projects: { created: projectsData || [], updated: [], deleted: [] },
          calculations: { created: [], updated: [], deleted: [] },
        },
        timestamp: Date.now(),
      };
    }

    // Форматуємо дані для синхронізації
    return { changes: {
        projects: {
          created: projectsData || [],
          updated: [],
          deleted: [] },
        calculations: { created: calculationsData || [],
          updated: [],
          deleted: [] },
      },
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Помилка при синхронізації даних:', JSON.stringify(error));
    // Повертаємо порожні дані у випадку помилки
    return {
      changes: {
        projects: { created: [], updated: [], deleted: [] },
        calculations: { created: [], updated: [], deleted: [] },
      },
      timestamp: Date.now(),
    };
  }
};

// Функція для відправки змін на Supabase
const pushChanges = async ({ changes, lastPulledAt }) => {
  // Обробка створених проєктів
  if (changes.projects.created.length > 0) {
    const { error } = await supabase
      .from('projects')
      .insert(changes.projects.created);

    if (error) {
      console.error('Помилка при створенні проєктів:', error);
    }
  }

  // Обробка оновлених проєктів
  if (changes.projects.updated.length > 0) {
    for (const project of changes.projects.updated) {
      const { error } = await supabase
        .from('projects')
        .update(project)
        .eq('id', project.id);

      if (error) {
        console.error(`Помилка при оновленні проєкту ${project.id}:`, error);
      }
    }
  }

  // Обробка видалених проєктів
  if (changes.projects.deleted.length > 0) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .in('id', changes.projects.deleted);

    if (error) {
      console.error('Помилка при видаленні проєктів:', error);
    }
  }

  // Аналогічно для розрахунків
  // ...
};

// Основна функція синхронізації
export const synchronizeDatabase = async () => {
  // Якщо додаток працює в офлайн-режимі, не виконуємо синхронізацію
  if (appConfig.offlineMode) {
    console.log('Додаток працює в офлайн-режимі. Синхронізація вимкнена.');
    return false;
  }

  try {
    // Перевіряємо підключення до інтернету
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.log('Немає підключення до інтернету. Синхронізація відкладена.');
      return false;
    }

    await synchronize({ 
      database,
      pullChanges,
      pushChanges,
      // Вимикаємо міграції, оскільки база даних не підтримує їх
      // migrationsEnabledAtVersion: 1 
    });
    console.log('Синхронізація успішно завершена');
    return true;
  } catch (error) {
    console.error('Помилка синхронізації:', JSON.stringify(error));
    // Логуємо помилку, але не зупиняємо роботу додатку
    return false;
  }
};

// Функція для перевірки наявності підключення до інтернету
export const checkConnection = async () => {
  try {
    // Спробуємо зробити запит до Supabase, а не до Google
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    
    // Якщо немає помилки, значить підключення є
    return !error;
  } catch (error) {
    console.log('Помилка перевірки підключення:', JSON.stringify(error));
    return false;
  }
};

// Функція для автоматичної синхронізації
export const setupAutoSync = (intervalMinutes = 15) => {
  // Синхронізуємо при запуску
  synchronizeDatabase();

  // Налаштовуємо періодичну синхронізацію
  const intervalId = setInterval(async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      synchronizeDatabase();
    }
  }, intervalMinutes * 60 * 1000);

  return () => clearInterval(intervalId); // Функція для скасування автосинхронізації
};
