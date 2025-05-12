// __tests__/integration/MigrationIntegration.test.ts
import { MigrationManager } from '../../src/modules/migrations/MigrationManager';
import { MockDatabase } from '../mocks/watermelondb.mock';
import { MockSupabaseClient } from '../mocks/supabase.mock';
import { SyncAdapter } from '../../src/modules/sync/SyncAdapter';

describe('Migration Integration Tests', () => {
  let mockDatabase: MockDatabase;
  let mockSupabase: MockSupabaseClient;
  let migrationManager: MigrationManager;
  let syncAdapter: SyncAdapter;

  beforeEach(() => {
    mockDatabase = new MockDatabase(1); // Початкова версія схеми = 1
    mockSupabase = new MockSupabaseClient([
      'projects',
      'calculations',
      'notes',
      'photos',
      'user_settings'
    ]);

    migrationManager = new MigrationManager(mockDatabase as any);
    syncAdapter = new SyncAdapter(mockDatabase as any, mockSupabase as any);

    // Мокуємо міграції в MigrationManager
    const mockMigrations = [
      {
        version: 1,
        name: 'Initial Schema',
        up: jest.fn().mockImplementation(async (db) => {
          // Створення початкових таблиць
          await db.adapter.setSchema(1);
        }),
        down: jest.fn().mockImplementation(async (db) => {
          // Видалення всіх таблиць
          await db.adapter.setSchema(0);
        }),
      },
      {
        version: 2,
        name: 'Add Notes',
        up: jest.fn().mockImplementation(async (db) => {
          // Додавання таблиці notes
          await db.adapter.setSchema(2);
        }),
        down: jest.fn().mockImplementation(async (db) => {
          // Видалення таблиці notes
          await db.adapter.setSchema(1);
        }),
      },
      {
        version: 3,
        name: 'Add User Settings',
        up: jest.fn().mockImplementation(async (db) => {
          // Додавання таблиці user_settings
          await db.adapter.setSchema(3);
        }),
        down: jest.fn().mockImplementation(async (db) => {
          // Видалення таблиці user_settings
          await db.adapter.setSchema(2);
        }),
      },
    ];

    (migrationManager as any).migrations = mockMigrations;
    (syncAdapter as any).getLastSyncDate = jest.fn().mockResolvedValue(new Date(2023, 0, 1));
    (syncAdapter as any).updateLastSyncDate = jest.fn().mockResolvedValue(undefined);
  });

  // Тест взаємодії між міграцією та синхронізацією
  test('виконує міграцію і потім успішно синхронізує дані', async () => {
    // Автентифікуємо користувача в Supabase
    mockSupabase._setAuthenticated(true, 'test-user-id');

    // Спочатку виконуємо міграцію до версії 3
    const migrationResult = await migrationManager.migrateToVersion(3);

    // Перевіряємо успішність міграції
    expect(migrationResult.success).toBe(true);
    expect(migrationResult.actions.length).toBe(2); // Дві міграції: 1->2 і 2->3

    // Перевіряємо, що версія схеми оновилась
    expect(mockDatabase.schema.version).toBe(3);

    // Додаємо тестові дані для синхронізації
    const projectsCollection = mockDatabase.get('projects');
    await projectsCollection._addRecord('test-project', {
      id: 'test-project',
      name: 'Test Project',
      updated_at: new Date().toISOString(),
      _status: 'created'
    });

    // Тепер виконуємо синхронізацію
    const syncResult = await syncAdapter.synchronize();

    // Перевіряємо успішність синхронізації
    expect(syncResult.success).toBe(true);

    // Перевіряємо, що дані з'явились на сервері
    const serverProjects = mockSupabase._getTable('projects');
    const allServerProjects = serverProjects._getAllRecords();
    
    expect(allServerProjects.length).toBeGreaterThan(0);
    expect(allServerProjects[0].id).toBe('test-project');
    expect(allServerProjects[0].name).toBe('Test Project');
  });

  // Тест відкату міграції та синхронізації після відкату
  test('справляється з відкатом міграції і наступною синхронізацією', async () => {
    // Спочатку мігруємо до версії 3
    await migrationManager.migrateToVersion(3);
    expect(mockDatabase.schema.version).toBe(3);

    // Додаємо якісь дані у тестову колекцію
    const notesCollection = mockDatabase.get('notes');
    await notesCollection._addRecord('note-1', {
      id: 'note-1',
      title: 'Test Note',
      content: 'This is a test note',
      updated_at: new Date().toISOString(),
    });

    // Додаємо ідентифікатор користувача і статус 'created' 
    // для коректної синхронізації
    await notesCollection._addRecord('note-1', {
      id: 'note-1',
      title: 'Test Note',
      content: 'This is a test note',
      updated_at: new Date().toISOString(),
      user_id: 'test-user-id',
      _status: 'created'
    });

    // Синхронізуємо дані з сервером
    mockSupabase._setAuthenticated(true, 'test-user-id');
    const syncResult = await syncAdapter.synchronize();
    
    // Перевіряємо успішність синхронізації
    expect(syncResult.success).toBe(true);

    // Перевіряємо, що дані з'явились на сервері
    const serverNotes = mockSupabase._getTable('notes');
    expect(serverNotes._getAllRecords().length).toBe(1);
    expect(serverNotes._getAllRecords()[0].title).toBe('Test Note');

    // Зробимо відкат до версії 1 (де немає колекції notes)
    const rollbackResult = await migrationManager.migrateToVersion(1);
    expect(rollbackResult.success).toBe(true);
    expect(mockDatabase.schema.version).toBe(1);

    // Перевіряємо, що колекція notes була видалена з мока
    expect(mockDatabase.collections.has('notes')).toBe(false);
    
    // Перевіряємо, що на сервері дані з notes залишились
    expect(serverNotes._getAllRecords().length).toBe(1);
    expect(serverNotes._getAllRecords()[0].title).toBe('Test Note');
  });
});