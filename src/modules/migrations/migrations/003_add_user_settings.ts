// src/modules/migrations/migrations/003_add_user_settings.ts
import { Database } from '@nozbe/watermelondb';
import { Migration } from '../../../types/migrations';

export const migration003: Migration = {
  version: 3,
  name: 'Add User Settings',
  
  // Функція для міграції вперед
  up: async (database: Database) => {
    console.log('Applying migration 003: Add User Settings');
    await database.adapter.transaction(() => {
      // Створення таблиці user_settings
    });
  },
  
  // Функція для відкату міграції
  down: async (database: Database) => {
    console.log('Rolling back migration 003: Add User Settings');
    await database.adapter.transaction(() => {
      // Видалення таблиці user_settings
    });
  }
};