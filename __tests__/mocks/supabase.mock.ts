// __tests__/mocks/supabase.mock.ts

// Додаємо фіктивний тест для файлу моку
describe('Supabase Mock', () => {
  test('should exist', () => {
    expect(true).toBe(true);
  });
});

export class MockSupabaseClient {
  private tables: Map<string, MockTable> = new Map();
  private authenticated: boolean = false;
  private userId: string | null = null;
  private networkEnabled: boolean = true;

  constructor(initialTables: string[] = []) {
    initialTables.forEach(tableName => {
      this.tables.set(tableName, new MockTable(tableName));
    });
  }

  get auth() {
    return {
      getSession: async () => {
        if (!this.networkEnabled) {
          throw new Error('Network connection lost');
        }

        if (!this.authenticated) {
          return { data: { session: null }, error: { message: 'Not authenticated' } };
        }

        return {
          data: {
            session: {
              user: { id: this.userId }
            }
          },
          error: null
        };
      },
      signIn: async (credentials: any) => {
        this.authenticated = true;
        this.userId = 'mock-user-id';
        return { data: { user: { id: this.userId } }, error: null };
      },
      signOut: async () => {
        this.authenticated = false;
        this.userId = null;
        return { error: null };
      }
    };
  }

  from(tableName: string) {
    if (!this.networkEnabled) {
      return {
        select: () => ({ error: new Error('Network connection lost') }),
        insert: () => ({ error: new Error('Network connection lost') }),
        update: () => ({ error: new Error('Network connection lost') }),
        delete: () => ({ error: new Error('Network connection lost') }),
      };
    }

    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new MockTable(tableName));
    }

    return this.tables.get(tableName);
  }

  // Вспомогательные методы для тестов
  _setAuthenticated(status: boolean, userId: string | null = 'mock-user-id') {
    this.authenticated = status;
    this.userId = userId;
  }

  _setNetworkStatus(enabled: boolean) {
    this.networkEnabled = enabled;
  }

  _getTable(tableName: string) {
    return this.tables.get(tableName);
  }

  _addTable(tableName: string) {
    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, new MockTable(tableName));
    }
    return this.tables.get(tableName);
  }
}

class MockTable {
  private name: string;
  private records: any[] = [];
  private filters: any[] = [];

  constructor(name: string) {
    this.name = name;
  }

  select(columns: string = '*') {
    return this._chain();
  }

  insert(data: any | any[]) {
    const dataArray = Array.isArray(data) ? data : [data];
    const inserted = dataArray.map(item => {
      const record = { ...item, id: item.id || `mock-${Math.random().toString(36).substr(2, 9)}` };
      this.records.push(record);
      return record;
    });

    return { data: inserted, error: null };
  }

  update(data: any) {
    const filteredIndices = this._applyFilters();
    const updated: any[] = [];

    filteredIndices.forEach(index => {
      this.records[index] = { ...this.records[index], ...data, updated_at: new Date().toISOString() };
      updated.push(this.records[index]);
    });

    this._resetFilters();
    return { data: updated, error: null };
  }

  delete() {
    const filteredIndices = this._applyFilters();
    const deleted = filteredIndices.map(index => this.records[index]);

    // Удаляем записи в обратном порядке, чтобы не сдвигать индексы
    filteredIndices.sort((a, b) => b - a).forEach(index => {
      this.records.splice(index, 1);
    });

    this._resetFilters();
    return { data: deleted, error: null };
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this._chain();
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value });
    return this._chain();
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value });
    return this._chain();
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value });
    return this._chain();
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value });
    return this._chain();
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value });
    return this._chain();
  }

  private _chain() {
    const self = this; // Зберігаємо посилання на this для використання у внутрішніх функціях
    
    return {
      select: this.select.bind(this),
      eq: this.eq.bind(this),
      neq: this.neq.bind(this),
      gt: this.gt.bind(this),
      lt: this.lt.bind(this),
      gte: this.gte.bind(this),
      lte: this.lte.bind(this),
      async then(resolve: Function) {
        const result = { data: [], error: null };
        // Використовуємо self замість this, щоб отримати правильний контекст
        result.data = self._applyFilters().map(index => self.records[index]);
        self._resetFilters();
        return resolve(result);
      }
    };
  }

  private _applyFilters() {
    return this.records.reduce((indices, record, index) => {
      let include = true;

      for (const filter of this.filters) {
        const { type, column, value } = filter;
        const recordValue = record[column];

        switch (type) {
          case 'eq':
            include = include && recordValue === value;
            break;
          case 'neq':
            include = include && recordValue !== value;
            break;
          case 'gt':
            include = include && recordValue > value;
            break;
          case 'lt':
            include = include && recordValue < value;
            break;
          case 'gte':
            include = include && recordValue >= value;
            break;
          case 'lte':
            include = include && recordValue <= value;
            break;
        }

        if (!include) break;
      }

      if (include) indices.push(index);
      return indices;
    }, [] as number[]);
  }

  private _resetFilters() {
    this.filters = [];
  }

  // Вспомогательные методы для тестов
  _addRecord(record: any) {
    const newRecord = { ...record, id: record.id || `mock-${Math.random().toString(36).substr(2, 9)}` };
    this.records.push(newRecord);
    return newRecord;
  }

  _getAllRecords() {
    return [...this.records];
  }

  _clear() {
    this.records = [];
  }
}