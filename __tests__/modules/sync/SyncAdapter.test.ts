// __tests__/modules/sync/SyncAdapter.test.ts
import { SyncAdapter } from '../../../src/modules/sync/SyncAdapter';
import { ConflictResolver } from '../../../src/modules/sync/ConflictResolver';
import { ConflictStrategy, SyncStage } from '../../../src/types/sync';
import { MockDatabase } from '../../mocks/watermelondb.mock';
import { MockSupabaseClient } from '../../mocks/supabase.mock';

// Мокуємо ConflictResolver
jest.mock('../../../src/modules/sync/ConflictResolver', () => {
  // Локальна копія enum для використання у моку
  const MockConflictStrategy = {
    SERVER_WINS: 'SERVER_WINS',
    CLIENT_WINS: 'CLIENT_WINS',
    NEWEST_WINS: 'NEWEST_WINS',
    MANUAL: 'MANUAL'
  };
  
  return {
    ConflictResolver: jest.fn().mockImplementation(() => ({
      resolveConflict: jest.fn().mockImplementation((local, server, strategy) => {
        switch (strategy) {
          case MockConflictStrategy.SERVER_WINS:
            return server;
          case MockConflictStrategy.CLIENT_WINS:
            return local;
          case MockConflictStrategy.NEWEST_WINS:
            return new Date(local.updated_at) > new Date(server.updated_at) ? local : server;
          default:
            return server; // За замовчуванням SERVER_WINS
        }
      })
    }))
  };
});

describe('SyncAdapter', () => {
  let mockDatabase: MockDatabase;
  let mockSupabase: MockSupabaseClient;
  let syncAdapter: SyncAdapter;
  const mockUserId = 'mock-user-id';

  beforeEach(() => {
    // Створюємо моки для бази даних і Supabase
    mockDatabase = new MockDatabase();
    mockSupabase = new MockSupabaseClient([
      'projects',
      'calculations',
      'notes',
      'photos',
      'user_settings'
    ]);

    // Встановлюємо автентифікацію в Supabase
    mockSupabase._setAuthenticated(true, mockUserId);

    // Створюємо екземпляр SyncAdapter
    syncAdapter = new SyncAdapter(mockDatabase as any, mockSupabase as any);

    // Мокуємо методи для отримання/встановлення дати синхронізації
    (syncAdapter as any).getLastSyncDate = jest.fn().mockResolvedValue(new Date(2023, 0, 1));
    (syncAdapter as any).updateLastSyncDate = jest.fn().mockResolvedValue(undefined);
  });

  // Тест на перевірку стану синхронізації
  test('isSyncing повертає правильний стан синхронізації', async () => {
    (syncAdapter as any).syncInProgress = false;
    expect(syncAdapter.isSyncing()).toBe(false);

    (syncAdapter as any).syncInProgress = true;
    expect(syncAdapter.isSyncing()).toBe(true);
  });

  // Тест на відміну синхронізації
  test('cancelSync відміняє синхронізацію', async () => {
    // Встановлюємо стан syncInProgress
    (syncAdapter as any).syncInProgress = true;

    // Викликаємо відміну синхронізації
    syncAdapter.cancelSync();

    // Перевіряємо, що syncInProgress встановлено в false
    expect(syncAdapter.isSyncing()).toBe(false);
  });

  // Тест на невдалу синхронізацію при відсутності автентифікації
  test('synchronize видає помилку при відсутності автентифікації', async () => {
    // Вимикаємо автентифікацію в моку Supabase
    mockSupabase._setAuthenticated(false);

    // Виконуємо синхронізацію
    const result = await syncAdapter.synchronize();

    // Перевіряємо результат
    expect(result.success).toBe(false);
    expect(result.stage).toBe(SyncStage.ERROR);
    expect(result.message).toContain('Authentication error');
    expect(result.error).toBeInstanceOf(Error);
  });

  // Тест на логіку блокування паралельних синхронізацій
  test('synchronize блокує паралельні запуски', async () => {
    // Встановлюємо стан синхронізації в "в процесі"
    (syncAdapter as any).syncInProgress = true;

    // Спроба синхронізації коли вже йде інша синхронізація
    const result = await syncAdapter.synchronize();

    // Перевіряємо, що синхронізація була відхилена
    expect(result.success).toBe(false);
    expect(result.message).toBe('Sync already in progress');
    expect(result.stage).toBe(SyncStage.ERROR);
  });
});