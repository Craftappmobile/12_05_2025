// __tests__/modules/migrations/MigrationManager.test.ts
import { MigrationManager } from '../../../src/modules/migrations/MigrationManager';
import { Migration } from '../../../src/types/migrations';
import { MockDatabase } from '../../mocks/watermelondb.mock';

describe('MigrationManager', () => {
  let mockDatabase: MockDatabase;
  let migrationManager: MigrationManager;
  let mockMigrations: Migration[];

  beforeEach(() => {
    // Створюємо моки для міграцій
    mockMigrations = [
      {
        version: 1,
        name: 'Initial Schema',
        up: jest.fn().mockResolvedValue(undefined),
        down: jest.fn().mockResolvedValue(undefined),
      },
      {
        version: 2,
        name: 'Add Notes',
        up: jest.fn().mockResolvedValue(undefined),
        down: jest.fn().mockResolvedValue(undefined),
      },
      {
        version: 3,
        name: 'Add User Settings',
        up: jest.fn().mockResolvedValue(undefined),
        down: jest.fn().mockResolvedValue(undefined),
      },
    ];

    // Створюємо мок для бази даних
    mockDatabase = new MockDatabase(1); // Початкова версія схеми = 1

    // Створюємо екземпляр менеджера міграцій
    // Тимчасово замінюємо оригінальні міграції у класі моками
    migrationManager = new MigrationManager(mockDatabase as any);
    (migrationManager as any).migrations = mockMigrations;
  });

  // Тест отримання поточного стану міграцій
  test('getCurrentState повертає правильну версію схеми', async () => {
    const state = await migrationManager.getCurrentState();
    
    expect(state.schemaVersion).toBe(1);
    expect(state.lastMigrationDate).toBeInstanceOf(Date);
  });

  // Тест міграції вперед
  test('migrateToVersion виконує міграцію вперед до вказаної версії', async () => {
    const result = await migrationManager.migrateToVersion(3);

    // Перевіряємо, що всі міграції були викликані в правильному порядку
    expect(mockMigrations[1].up).toHaveBeenCalled(); // Міграція 2
    expect(mockMigrations[2].up).toHaveBeenCalled(); // Міграція 3
    expect(mockMigrations[0].up).not.toHaveBeenCalled(); // Міграція 1 вже була застосована

    // Перевіряємо результат міграції
    expect(result.success).toBe(true);
    expect(result.actions.length).toBe(2);
    expect(result.actions[0].type).toBe('up');
    expect(result.actions[0].version).toBe(2);
    expect(result.actions[1].type).toBe('up');
    expect(result.actions[1].version).toBe(3);
  });

  // Тест міграції назад
  test('migrateToVersion виконує міграцію назад до вказаної версії', async () => {
    // Встановлюємо початкову версію схеми = 3
    mockDatabase.setVersion(3);
    
    const result = await migrationManager.migrateToVersion(1);

    // Перевіряємо, що всі міграції були викликані в правильному порядку (в зворотньому порядку)
    expect(mockMigrations[2].down).toHaveBeenCalled(); // Міграція 3
    expect(mockMigrations[1].down).toHaveBeenCalled(); // Міграція 2
    expect(mockMigrations[0].down).not.toHaveBeenCalled(); // Міграція 1 залишається

    // Перевіряємо результат міграції
    expect(result.success).toBe(true);
    expect(result.actions.length).toBe(2);
    expect(result.actions[0].type).toBe('down');
    expect(result.actions[0].version).toBe(3);
    expect(result.actions[1].type).toBe('down');
    expect(result.actions[1].version).toBe(2);
  });

  // Тест на обробку помилок
  test('migrateToVersion обробляє помилки при міграції', async () => {
    // Змінюємо одну з міграцій, щоб вона викидала помилку
    mockMigrations[1].up = jest.fn().mockRejectedValue(new Error('Migration error'));

    const result = await migrationManager.migrateToVersion(3);

    // Перевіряємо, що помилка була перехоплена і повернена
    expect(result.success).toBe(false);
    expect(result.message).toContain('Migration failed');
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe('Migration error');
  });
});