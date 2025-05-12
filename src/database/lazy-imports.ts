/**
 * Лезі імпорти для уникнення циклічних залежностей
 */

// Функції роботи з базою даних

export function getDatabase() {
  return require('./index').database;
}

export function getProjectsCollection() {
  return require('./index').projectsCollection;
}

export function getCalculationsCollection() {
  return require('./index').calculationsCollection;
}

export function getNotesCollection() {
  return require('./index').notesCollection;
}

export function getPhotosCollection() {
  return require('./index').photosCollection;
}

// Лезі імпорти функцій
export function resetDatabaseLazy() {
  return require('./resetDatabase').resetDatabase();
}

export function seedTestDataLazy() {
  return require('./seedTestData').seedTestData();
}