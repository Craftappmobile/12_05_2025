// src/modules/migrations/migrations/002_add_notes.ts
import { Database } from '@nozbe/watermelondb';
import { Migration } from '../../../types/migrations';

export const migration002: Migration = {
  version: 2,
  name: 'Add Notes',
  
  // Функція для міграції вперед
  up: async (database: Database) => {
    console.log('Applying migration 002: Add Notes');
    await database.adapter.transaction(() => {
      // Створення таблиці notes
    });
  },
  
  // Функція для відкату міграції
  down: async (database: Database) => {
    console.log('Rolling back migration 002: Add Notes');
    await database.adapter.transaction(() => {
      // Видалення таблиці notes
    });
  }
};