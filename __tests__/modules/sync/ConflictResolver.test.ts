// __tests__/modules/sync/ConflictResolver.test.ts
import { ConflictResolver } from '../../../src/modules/sync/ConflictResolver';
import { ConflictStrategy } from '../../../src/types/sync';

describe('ConflictResolver', () => {
  let conflictResolver: ConflictResolver;

  beforeEach(() => {
    conflictResolver = new ConflictResolver();
  });

  // Тест стратегії SERVER_WINS
  test('resolveConflict повертає серверну версію при стратегії SERVER_WINS', () => {
    const localData = { id: '1', name: 'Local', updated_at: new Date(2023, 1, 1).toISOString() };
    const serverData = { id: '1', name: 'Server', updated_at: new Date(2023, 0, 1).toISOString() };

    const result = conflictResolver.resolveConflict(localData, serverData, ConflictStrategy.SERVER_WINS);

    expect(result).toEqual(serverData);
  });

  // Тест стратегії CLIENT_WINS
  test('resolveConflict повертає локальну версію при стратегії CLIENT_WINS', () => {
    const localData = { id: '1', name: 'Local', updated_at: new Date(2023, 0, 1).toISOString() };
    const serverData = { id: '1', name: 'Server', updated_at: new Date(2023, 1, 1).toISOString() };

    const result = conflictResolver.resolveConflict(localData, serverData, ConflictStrategy.CLIENT_WINS);

    expect(result).toEqual(localData);
  });

  // Тест стратегії NEWEST_WINS (локальна новіша)
  test('resolveConflict повертає локальну версію при NEWEST_WINS, якщо вона новіша', () => {
    const localData = { id: '1', name: 'Local', updated_at: new Date(2023, 1, 1).toISOString() };
    const serverData = { id: '1', name: 'Server', updated_at: new Date(2023, 0, 1).toISOString() };

    const result = conflictResolver.resolveConflict(localData, serverData, ConflictStrategy.NEWEST_WINS);

    expect(result).toEqual(localData);
  });

  // Тест стратегії NEWEST_WINS (серверна новіша)
  test('resolveConflict повертає серверну версію при NEWEST_WINS, якщо вона новіша', () => {
    const localData = { id: '1', name: 'Local', updated_at: new Date(2023, 0, 1).toISOString() };
    const serverData = { id: '1', name: 'Server', updated_at: new Date(2023, 1, 1).toISOString() };

    const result = conflictResolver.resolveConflict(localData, serverData, ConflictStrategy.NEWEST_WINS);

    expect(result).toEqual(serverData);
  });

  // Тест стратегії MANUAL
  test('resolveConflict повертає обидві версії при стратегії MANUAL', () => {
    const localData = { id: '1', name: 'Local', updated_at: new Date(2023, 0, 1).toISOString() };
    const serverData = { id: '1', name: 'Server', updated_at: new Date(2023, 1, 1).toISOString() };

    const result = conflictResolver.resolveConflict(localData, serverData, ConflictStrategy.MANUAL);

    expect(result).toHaveProperty('_conflict');
    expect(result._conflict.local).toEqual(localData);
    expect(result._conflict.server).toEqual(serverData);
  });
});