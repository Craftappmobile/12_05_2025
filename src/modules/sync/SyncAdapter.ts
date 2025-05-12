// src/modules/sync/SyncAdapter.ts
import { Database } from '@nozbe/watermelondb';
import { SupabaseClient } from '@supabase/supabase-js';
import { SyncRecord, SyncResult, ConflictStrategy, SyncStage } from '../../types/sync';
import { ConflictResolver } from './ConflictResolver';

export class SyncAdapter {
  private database: Database;
  private supabase: SupabaseClient;
  private conflictResolver: ConflictResolver;
  private syncInProgress: boolean = false;
  private defaultStrategy: ConflictStrategy = ConflictStrategy.NEWEST_WINS;
  
  // Таблиці для синхронізації та їх відповідні моделі в WatermelonDB
  private tables = [
    { name: 'projects', model: 'projects' },
    { name: 'calculations', model: 'calculations' },
    { name: 'notes', model: 'notes' },
    { name: 'photos', model: 'photos' },
    { name: 'user_settings', model: 'user_settings' }
  ];

  constructor(database: Database, supabase: SupabaseClient) {
    this.database = database;
    this.supabase = supabase;
    this.conflictResolver = new ConflictResolver();
  }

  // Основний метод синхронізації
  public async synchronize(strategy: ConflictStrategy = this.defaultStrategy): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, message: 'Sync already in progress', stage: SyncStage.ERROR };
    }
    
    this.syncInProgress = true;
    const startTime = Date.now();
    
    try {
      // Перевірка підключення до сервера
      const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      const userId = sessionData.session?.user.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Крок 1: Відправка локальних змін на сервер
      const pushResult = await this.pushLocalChanges(userId, strategy);
      
      // Крок 2: Отримання змін з сервера
      const pullResult = await this.pullServerChanges(userId, strategy);
      
      const endTime = Date.now();
      
      this.syncInProgress = false;
      return {
        success: true,
        message: 'Synchronization completed successfully',
        stage: SyncStage.COMPLETED,
        stats: {
          pushed: pushResult.count,
          pulled: pullResult.count,
          conflicts: pushResult.conflicts.length + pullResult.conflicts.length,
          duration: endTime - startTime
        }
      };
    } catch (error) {
      this.syncInProgress = false;
      return {
        success: false,
        message: `Synchronization failed: ${error.message}`,
        stage: SyncStage.ERROR,
        error
      };
    }
  }

  // Відправка локальних змін на сервер
  private async pushLocalChanges(userId: string, strategy: ConflictStrategy): Promise<{ count: number, conflicts: SyncRecord[] }> {
    let totalCount = 0;
    const conflicts: SyncRecord[] = [];

    try {
      // Обробка кожної таблиці, в залежності від версії схеми
      for (const table of this.tables) {
        // Перевіряємо чи існує таблиця в поточній схемі
        // У версії 1: є тільки 'projects', 'calculations', 'photos'
        // У версії 2: є ще 'notes'
        // У версії 3: є ще 'user_settings'
        const schemaVersion = this.database.schema.version;
        if ((table.model === 'notes' && schemaVersion < 2) || 
            (table.model === 'user_settings' && schemaVersion < 3)) {
          continue; // Пропускаємо таблиці, яких немає в поточній версії схеми
        }
        
        try {
          const collection = this.database.get(table.model);
          
          // Отримання локальних змін
          // Фільтруємо за статусом
          const createdRecords = await collection.query().fetch();
          const filteredCreated = createdRecords.filter(r => r._raw._status === 'created');
          
          // Відправка створених записів
          for (const record of filteredCreated) {
            const recordData = { ...record._raw };
            
            try {
              // Перевірка на наявність запису на сервері
              const { data: existingData, error } = await this.supabase
                .from(table.name)
                .select('*')
                .eq('id', recordData.id);
              
              if (error) {
                console.error(`Error checking record existence:`, error);
                continue;
              }
              
              if (existingData && existingData.length > 0) {
                // Розв'язання конфлікту
                const resolvedData = this.conflictResolver.resolveConflict(
                  recordData,
                  existingData[0],
                  strategy
                );
                
                // Оновлення на сервері
                const { error: updateError } = await this.supabase
                  .from(table.name)
                  .update({ ...resolvedData })
                  .eq('id', recordData.id);
                  
                if (updateError) {
                  console.error(`Error updating record:`, updateError);
                  continue;
                }
                  
                conflicts.push({
                  local: recordData,
                  server: existingData[0],
                  resolved: resolvedData,
                  table: table.name
                });
              } else {
                // Створення нового запису на сервері
                const { error: insertError } = await this.supabase
                  .from(table.name)
                  .insert({ ...recordData, user_id: userId });
                  
                if (insertError) {
                  console.error(`Error inserting record:`, insertError);
                  continue;
                }
                  
                totalCount++;
              }
            } catch (error) {
              console.error(`Error processing record:`, error);
            }
          }
          
          // Додати тут обробку оновлених та видалених записів
          // ...
          
        } catch (error) {
          console.error(`Error processing table ${table.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in pushLocalChanges:', error);
    }
    
    return { count: totalCount, conflicts };
  }

  // Отримання змін з сервера
  private async pullServerChanges(userId: string, strategy: ConflictStrategy): Promise<{ count: number, conflicts: SyncRecord[] }> {
    let totalCount = 0;
    const conflicts: SyncRecord[] = [];

    // Отримання останньої дати синхронізації
    const lastSyncDate = await this.getLastSyncDate();
    
    // Обробка кожної таблиці
    for (const table of this.tables) {
      // Отримання змін з сервера з моменту останньої синхронізації
      const { data: serverRecords, error } = await this.supabase
        .from(table.name)
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSyncDate.toISOString());
        
      if (error) {
        console.error(`Error pulling changes for ${table.name}:`, error);
        continue;
      }
      
      if (!serverRecords || serverRecords.length === 0) {
        continue;
      }
      
      // Обробка кожного зміненого запису
      for (const serverRecord of serverRecords) {
        // Перевірка наявності локальної копії
        const collection = this.database.get(table.model);
        let localRecord;
        
        try {
          localRecord = await collection.find(serverRecord.id);
        } catch (e) {
          // Запис не знайдено локально
          localRecord = null;
        }
        
        if (localRecord) {
          const localData = localRecord._raw;
          
          // Перевірка на конфлікт
          // Визначаємо, чи є конфлікт (дані змінені в обох місцях)
          const localDate = new Date(localData.updated_at);
          const serverDate = new Date(serverRecord.updated_at);
          const isConflict = Math.abs(localDate.getTime() - serverDate.getTime()) > 1000; // Різниця більше 1 секунди
          
          if (isConflict) {
            // Вирішуємо конфлікт за допомогою стратегії
            const resolvedData = this.conflictResolver.resolveConflict(
              localData,
              serverRecord,
              strategy
            );
            
            // Перевірка, чи локальні зміни мають пріоритет
            const isLocalWinner = JSON.stringify(resolvedData) === JSON.stringify({ ...localData });
            
            if (isLocalWinner) {
              // Локальні зміни важливіші, оновлюємо сервер
              await this.supabase
                .from(table.name)
                .update({ ...localData })
                .eq('id', serverRecord.id);
            } else {
              // Серверні зміни важливіші, оновлюємо локально
              await this.database.adapter.transaction(async () => {
                await localRecord.update(record => {
                  // Замість Object.assign використовуємо пряме копіювання ключів
                  for (const key in resolvedData) {
                    if (key !== 'id' && key !== '_status') { // Важливо не змінювати id і _status
                      record[key] = resolvedData[key];
                    }
                  }
                });
              });
            }
            
            conflicts.push({
              local: localData,
              server: serverRecord,
              resolved: resolvedData,
              table: table.name
            });
          } else {
            // Серверні зміни новіші, просто оновлюємо локально
            await this.database.adapter.transaction(async () => {
              await localRecord.update(record => {
                Object.assign(record, serverRecord);
              });
            });
            
            totalCount++;
          }
        } else {
          // Запис не існує локально, створюємо новий
          await this.database.adapter.transaction(async () => {
            await collection.create(record => {
              Object.assign(record, serverRecord);
            });
          });
          
          totalCount++;
        }
      }
    }
    
    // Оновлення дати останньої синхронізації
    await this.updateLastSyncDate();
    
    return { count: totalCount, conflicts };
  }

  // Отримання дати останньої синхронізації
  private async getLastSyncDate(): Promise<Date> {
    // Реалізація отримання дати останньої синхронізації з сховища
    // Для тестів повертаємо дату далеко в минулому, 
    // щоб гарантувати отримання всіх змін
    return new Date(0);
  }

  // Оновлення дати останньої синхронізації
  private async updateLastSyncDate(): Promise<void> {
    // Реалізація збереження поточної дати як дати останньої синхронізації
  }

  // Відміна поточної синхронізації
  public cancelSync(): void {
    if (this.syncInProgress) {
      this.syncInProgress = false;
      // Додаткова логіка відміни операцій
    }
  }

  // Отримання статусу синхронізації
  public isSyncing(): boolean {
    return this.syncInProgress;
  }
}