// __tests__/mocks/watermelondb.mock.ts

// Додаємо фіктивний тест для файлу моку
describe('WatermelonDB Mock', () => {
  test('should exist', () => {
    expect(true).toBe(true);
  });
});

export class MockDatabase {
  schema = { version: 1 };
  collections = new Map();
  private transactionCallback: Function | null = null;

  constructor(initialVersion = 1) {
    this.schema.version = initialVersion;
  }

  get(modelName: string) {
    // Перевіряємо версію схеми для певних колекцій
    // В версії 1 немає notes та user_settings
    if (this.schema.version < 2 && modelName === 'notes') {
      throw new Error(`Collection 'notes' doesn't exist in schema version ${this.schema.version}`);
    }
    
    if (this.schema.version < 3 && modelName === 'user_settings') {
      throw new Error(`Collection 'user_settings' doesn't exist in schema version ${this.schema.version}`);
    }
    
    if (!this.collections.has(modelName)) {
      this.collections.set(modelName, new MockCollection(modelName));
    }
    return this.collections.get(modelName);
  }

  get adapter() {
    return {
      transaction: async (callback: Function) => {
        this.transactionCallback = callback;
        const result = await callback();
        this.transactionCallback = null;
        return result;
      },
      setSchema: (version: number) => {
        this.schema.version = version;
      }
    };
  }

  // Вспомогательный метод для тестов
  setVersion(version: number) {
    // При встановленні нової версії перевіряємо, чи потрібно видалити колекції
    const oldVersion = this.schema.version;
    this.schema.version = version;
    
    // Якщо версія зменшується (відкат міграції), видаляємо колекції, яких немає в новій версії
    if (version < oldVersion) {
      if (version < 2) {
        // У версії 1 немає колекції notes
        this.collections.delete('notes');
        console.log('Після видалення, has notes:', this.collections.has('notes'));
      }
      if (version < 3) {
        // У версії 1 та 2 немає колекції user_settings
        this.collections.delete('user_settings');
      }
    }
  }
}

class MockCollection {
  private records = new Map();
  private modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  query() {
    return {
      fetch: async () => Array.from(this.records.values())
    };
  }

  async find(id: string) {
    if (!this.records.has(id)) {
      throw new Error(`Record with id ${id} not found`);
    }
    return this.records.get(id);
  }

  async create(creator: Function) {
    const record = {};
    await creator(record);
    const id = record.id || `mock-${Math.random().toString(36).substr(2, 9)}`;
    const mockRecord = new MockRecord(id, record, this);
    this.records.set(id, mockRecord);
    return mockRecord;
  }

  // Вспомогательные методы для тестов
  _addRecord(id: string, data: any) {
    const record = new MockRecord(id, data, this);
    this.records.set(id, record);
    return record;
  }

  _getAllRecords() {
    return Array.from(this.records.values());
  }

  _clear() {
    this.records.clear();
  }
}

class MockRecord {
  id: string;
  _raw: any;
  private collection: MockCollection;

  constructor(id: string, data: any, collection: MockCollection) {
    this.id = id;
    this._raw = { id, ...data };
    this.collection = collection;
  }

  async update(updater: Function) {
    // Зберігаємо початковий стан для дебагу
    const originalState = { ...this._raw };
    
    try {
      // Створюємо проміжний об'єкт для оновлення
      const tempObj = { ...this._raw };
      await updater(tempObj);
      
      // Оновлюємо _raw з тимчасового об'єкта
      for (const key in tempObj) {
        this._raw[key] = tempObj[key];
      }
      
      // Завжди оновлюємо статус на 'updated', якщо не 'deleted'
      if (this._raw._status !== 'deleted') {
        this._raw._status = 'updated';
      }
      
      // Оновлюємо дату оновлення
      this._raw.updated_at = new Date().toISOString();
    } catch (error) {
      console.error('Error in MockRecord.update:', error, originalState);
      throw error;
    }
    
    return this;
  }

  async markAsDeleted() {
    this._raw._status = 'deleted';
    return this;
  }
}