// src/modules/migrations/migrations/001_initial_schema.ts
import { Database } from '@nozbe/watermelondb';
import { Migration } from '../../../types/migrations';

export const migration001: Migration = {
  version: 1,
  name: 'Initial Schema',
  
  // Функція для міграції вперед
  up: async (database: Database) => {
    // Тут ми б створювали початкову схему бази даних
    // Штучно встановлюємо версію схеми для тестування
    console.log('Applying migration 001: Initial Schema');
    await database.adapter.transaction(() => {
      // Створення таблиць projects та photos
      // WatermelonDB використовує внутрішню мету schema.version для підтримки версій схеми
    });
  },
  
  // Функція для відкату міграції
  down: async (database: Database) => {
    // Тут ми б видаляли всі таблиці
    console.log('Rolling back migration 001: Initial Schema');
    await database.adapter.transaction(() => {
      // Видалення таблиць
    });
  }
};