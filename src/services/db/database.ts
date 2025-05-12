import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';
import { schemas } from './schema';
import models from './models';

// Налаштування міграцій
const migrations = schemaMigrations({ migrations: [
    // Оскільки схема вже має версію 1, нам не потрібна міграція до версії 1
    // Наступна міграція буде до версії 2, коли вона знадобиться
  ] });

// Налаштування адаптера для SQLite
const adapter = new SQLiteAdapter({
  schema: schemas,
  // Вимикаємо міграції на цьому етапі
  // migrations,
  jsi: false, // вимикаємо JSI для уникнення попереджень під час розробки
  onSetUpError: error => {
    // Обробка помилок при налаштуванні бази даних
    console.error('Помилка налаштування бази даних:', error);
  }
});

// Створення екземпляру бази даних
export const database = new Database({ adapter,
  modelClasses: models });

// Експорт колекцій для зручного доступу
export const getProjectsCollection = () => database.get('projects');
export const getCalculationsCollection = () => database.get('calculations');

export default database;
