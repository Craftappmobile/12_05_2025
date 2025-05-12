import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import schema from './schema';
import migrations from './migrations';
import { Project, Calculation, Note, Photo } from './models';

// Ініціалізація адаптера SQLite
const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'knittingApp',
  // Опціональні налаштування для відлагодження
  // onSetUpError: error => {
  //   console.error('Помилка при налаштуванні бази даних:', error);
  // }
});

// Ініціалізація бази даних
export const database = new Database({ adapter,
  modelClasses: [Project, Calculation, Note, Photo] });

// Експорт колекцій для зручного доступу
export const projectsCollection = database.collections.get('projects');
export const calculationsCollection = database.collections.get('calculations');
export const notesCollection = database.collections.get('notes');
export const photosCollection = database.collections.get('photos');

// Експорт типів моделей
export type ProjectModel = Project;
export type CalculationModel = Calculation;
export type NoteModel = Note;
export type PhotoModel = Photo;

// Експорт функцій для ініціалізації та скидання бази даних
// Використовуємо лезі імпорти, щоб уникнути циклічних залежностей
// export { seedTestData } from './seedTestData';
// export { resetDatabase } from './resetDatabase';

// Натомість використовуємо функції напряму у коді, де вони потрібні
import { type SeedTestDataFunction, type ResetDatabaseFunction } from './types';

// Експорт типів функцій для використання сервісами
export type { SeedTestDataFunction, ResetDatabaseFunction };