// __tests__/integration/SyncIntegration.test.ts
import { SyncAdapter } from '../../src/modules/sync/SyncAdapter';
import { ConflictResolver } from '../../src/modules/sync/ConflictResolver';
import { ConflictStrategy, SyncStage } from '../../src/types/sync';
import { MockDatabase } from '../mocks/watermelondb.mock';
import { MockSupabaseClient } from '../mocks/supabase.mock';

describe('Sync Integration Tests', () => {
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

    // Створюємо екземпляр SyncAdapter з реальними залежностями
    syncAdapter = new SyncAdapter(mockDatabase as any, mockSupabase as any);

    // Мокуємо методи для дати синхронізації, але все інше залишаємо реальним
    (syncAdapter as any).getLastSyncDate = jest.fn().mockResolvedValue(new Date(2023, 0, 1));
    (syncAdapter as any).updateLastSyncDate = jest.fn().mockResolvedValue(undefined);
  });

  // Інтеграційний тест: тестування роботи при відсутності мережі
  test('обробляє відсутність мережі і продовжує синхронізацію після її відновлення', async () => {
    // Додаємо локальні дані
    const projectsCollection = mockDatabase.get('projects');
    await projectsCollection._addRecord('offline-project', {
      id: 'offline-project',
      name: 'Offline Project',
      updated_at: new Date().toISOString(),
      _status: 'created',
      user_id: mockUserId
    });

    // Вимикаємо мережу
    mockSupabase._setNetworkStatus(false);

    // Спроба синхронізації повинна завершитись помилкою
    const resultWithoutNetwork = await syncAdapter.synchronize();
    expect(resultWithoutNetwork.success).toBe(false);
    expect(resultWithoutNetwork.message).toContain('Network connection lost');

    // Перевіряємо, що дані не потрапили на сервер
    const serverProjects = mockSupabase._getTable('projects');
    expect(serverProjects._getAllRecords().length).toBe(0);

    // Вмикаємо мережу
    mockSupabase._setNetworkStatus(true);

    // Тепер синхронізація повинна пройти успішно
    const resultWithNetwork = await syncAdapter.synchronize();
    expect(resultWithNetwork.success).toBe(true);

    // Перевіряємо, що дані тепер є на сервері
    const serverProjectsAfterSync = serverProjects._getAllRecords();
    expect(serverProjectsAfterSync.length).toBe(1);
    expect(serverProjectsAfterSync[0].id).toBe('offline-project');
    expect(serverProjectsAfterSync[0].name).toBe('Offline Project');
  });

  // Інтеграційний тест: вирішення конфліктів при синхронізації
  test('вирішує конфлікти при синхронізації', async () => {
    // Додаємо конфліктні дані - однаковий проект локально і на сервері
    const projectId = 'conflict-project-1';
    
    // Додаємо локальну версію
    const projectsCollection = mockDatabase.get('projects');
    await projectsCollection._addRecord(projectId, {
      id: projectId,
      name: 'Local Project Name',
      description: 'Local description',
      updated_at: new Date(2023, 1, 15).toISOString(),
      _status: 'updated',
      _changed: 'name,description',
      user_id: mockUserId
    });

    // Додаємо серверну версію з новішою датою
    const serverProjects = mockSupabase._getTable('projects');
    serverProjects._addRecord({
      id: projectId,
      name: 'Server Project Name',
      description: 'Server description',
      updated_at: new Date(2023, 1, 20).toISOString(), // Новіша дата
      user_id: mockUserId
    });

    // Виконуємо синхронізацію зі стратегією NEWEST_WINS
    const result = await syncAdapter.synchronize(ConflictStrategy.NEWEST_WINS);

    // Перевіряємо результат синхронізації
    expect(result.success).toBe(true);
    
    try {
      // Перевіряємо, що в локальній базі серверна версія (бо вона новіша)
      const updatedProject = await projectsCollection.find(projectId);
      expect(updatedProject._raw.name).toBe('Server Project Name');
      expect(updatedProject._raw.description).toBe('Server description');
    } catch (e) {
      // Якщо запис не знайдено, це теж провал
      fail('Project should exist in local database');
    }
  });
});