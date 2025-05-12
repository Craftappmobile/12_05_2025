// src/modules/migrations/MigrationManager.ts
import { Database } from '@nozbe/watermelondb';
import { Migration, MigrationState, MigrationAction, MigrationProgress } from '../../types/migrations';

// Імпорт всіх міграцій
import { migration001 } from './migrations/001_initial_schema';
import { migration002 } from './migrations/002_add_notes';
import { migration003 } from './migrations/003_add_user_settings';

export class MigrationManager {
  private database: Database;
  private migrations: Migration[] = [
    migration001,
    migration002,
    migration003
  ];

  constructor(database: Database) {
    this.database = database;
  }

  // Отримання поточного стану міграцій
  public async getCurrentState(): Promise<MigrationState> {
    // В WatermelonDB версія схеми зберігається всередині
    const schemaVersion = this.database.schema.version;
    
    return {
      schemaVersion,
      lastMigrationDate: new Date(),
    };
  }

  // Виконання міграції до вказаної версії
  public async migrateToVersion(targetVersion: number): Promise<MigrationProgress> {
    const currentState = await this.getCurrentState();
    const currentVersion = currentState.schemaVersion;
    
    if (currentVersion === targetVersion) {
      return { success: true, message: 'Already at target version', actions: [] };
    }

    const actions: MigrationAction[] = [];
    
    try {
      // Міграція вперед
      if (currentVersion < targetVersion) {
        // Сортуємо міграції за зростанням версій
        const sortedMigrations = [...this.migrations]
          .sort((a, b) => a.version - b.version);
          
        for (const migration of sortedMigrations) {
          if (migration.version > currentVersion && migration.version <= targetVersion) {
            await this.database.adapter.transaction(async () => {
              await migration.up(this.database);
              
              // Важливо: оновлюємо схему після кожної міграції
              this.database.schema.version = migration.version;
              
              actions.push({
                type: 'up',
                version: migration.version,
                timestamp: new Date(),
                success: true
              });
            });
          }
        }
      } 
      // Міграція назад
      else {
        // Сортуємо міграції в зворотному порядку для відкату
        const reversedMigrations = [...this.migrations]
          .sort((a, b) => b.version - a.version);
        
        for (const migration of reversedMigrations) {
          if (migration.version <= currentVersion && migration.version > targetVersion) {
            await this.database.adapter.transaction(async () => {
              try {
                // Виконуємо відкат 
                await migration.down(this.database);
                
                // Важливо: встановлюємо версію на попередню
                // Знаходимо попередню версію (або 0 якщо це перша міграція)
                const prevVersion = this.migrations
                  .filter(m => m.version < migration.version)
                  .reduce((max, m) => Math.max(max, m.version), 0);
                  
                this.database.schema.version = prevVersion;
                
                // Якщо це міграція 2 → 1, нам потрібно видалити колекцію з
                // колекцій даних, якщо вона була додана в цій міграції
                // Видаляємо колекції, які не повинні існувати в новій версії
                if (migration.version === 2) {
                  // У версії 1 немає колекції notes
                  (this.database as any).collections.delete('notes');
                  console.log('Version downgraded from 2 to 1, notes collection should be removed');
                }
                if (migration.version === 3) {
                  // У версії 1 та 2 немає колекції user_settings
                  (this.database as any).collections.delete('user_settings');
                }
                
                actions.push({
                  type: 'down',
                  version: migration.version,
                  timestamp: new Date(),
                  success: true
                });
              } catch (error) {
                console.error(`Error rolling back migration ${migration.version}:`, error);
                actions.push({
                  type: 'down',
                  version: migration.version,
                  timestamp: new Date(),
                  success: false,
                  error
                });
                throw error; // Перекидаємо помилку далі
              }
            });
          }
        }
      }
      
      return { success: true, message: 'Migration successful', actions };
    } catch (error) {
      console.error('Migration failed:', error);
      return { 
        success: false, 
        message: `Migration failed: ${error.message}`, 
        actions,
        error 
      };
    }
  }
}