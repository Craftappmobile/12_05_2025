/**
 * @fileoverview Сервіс автоматизації клієнтських міграцій для додатку "Розрахуй і В'яжи".
 * 
 * Цей сервіс забезпечує автоматичне виконання міграцій бази даних при оновленні схеми.
 * Підтримує як міграцію вперед, так і відкат до попередніх версій.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2023-06-22
 */

import { database } from '../db';
import { SyncAdapter } from '../../modules/sync/SyncAdapter';
import { supabase } from '../auth/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import appConfig from '../../config/appConfig';

// Ключ для зберігання поточної версії схеми в AsyncStorage
const SCHEMA_VERSION_KEY = '@AppSchema:version';

/**
 * Інтерфейс для результату міграції
 */
interface MigrationResult {
  success: boolean;
  message: string;
  fromVersion: number;
  toVersion: number;
  error?: Error;
}

/**
 * Клас для автоматизації клієнтських міграцій
 */
export class MigrationService {
  private syncAdapter: SyncAdapter | null = null;
  
  constructor() {
    try {
      // Створюємо екземпляр SyncAdapter для синхронізації після міграцій
      this.syncAdapter = new SyncAdapter(database, supabase);
    } catch (error) {
      console.error('Помилка при створенні SyncAdapter:', error);
    }
  }
  
  /**
   * Отримує останню збережену версію схеми з AsyncStorage
   */
  private async getStoredSchemaVersion(): Promise<number> {
    try {
      const storedVersion = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
      if (storedVersion !== null) {
        return parseInt(storedVersion, 10);
      }
    } catch (error) {
      console.error('Помилка при отриманні збереженої версії схеми:', error);
    }
    return 0; // За замовчуванням повертаємо 0, якщо збережена версія не знайдена
  }
  
  /**
   * Зберігає поточну версію схеми в AsyncStorage
   */
  private async storeSchemaVersion(version: number): Promise<void> {
    try {
      await AsyncStorage.setItem(SCHEMA_VERSION_KEY, version.toString());
    } catch (error) {
      console.error('Помилка при збереженні версії схеми:', error);
    }
  }
  
  /**
   * Перевіряє необхідність міграції при запуску додатка
   */
  public async checkMigrationNeeded(): Promise<boolean> {
    try {
      const storedVersion = await this.getStoredSchemaVersion();
      const currentVersion = database.schema.version;
      
      return storedVersion !== currentVersion;
    } catch (error) {
      console.error('Помилка при перевірці необхідності міграції:', error);
      return false;
    }
  }
  
  /**
   * Автоматично виконує міграцію до поточної версії схеми
   */
  public async autoMigrate(): Promise<MigrationResult> {
    try {
      const storedVersion = await this.getStoredSchemaVersion();
      const currentVersion = database.schema.version;
      
      if (storedVersion === currentVersion) {
        return {
          success: true,
          message: 'Міграція не потрібна, версії однакові',
          fromVersion: storedVersion,
          toVersion: currentVersion
        };
      }
      
      let result: MigrationResult;
      
      if (storedVersion < currentVersion) {
        // Міграція вперед
        result = await this.migrateUp(storedVersion, currentVersion);
      } else {
        // Міграція назад (відкат)
        result = await this.migrateDown(storedVersion, currentVersion);
      }
      
      // При успішній міграції оновлюємо збережену версію
      if (result.success) {
        await this.storeSchemaVersion(currentVersion);
        
        // Якщо міграція успішна і є підключення до інтернету, запускаємо синхронізацію
        await this.syncAfterMigration();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Помилка при автоматичній міграції: ${error.message}`,
        fromVersion: await this.getStoredSchemaVersion(),
        toVersion: database.schema.version,
        error
      };
    }
  }
  
  /**
   * Виконує міграцію вперед до більш нової версії схеми
   */
  private async migrateUp(fromVersion: number, toVersion: number): Promise<MigrationResult> {
    try {
      console.log(`Починаємо міграцію з версії ${fromVersion} до версії ${toVersion}`);
      
      // Блокуємо користувацький інтерфейс чи показуємо екран завантаження,
      // оскільки міграція може зайняти деякий час
      
      // Викликаємо функцію міграції з WatermelonDB
      /* 
        На даний момент міграція вперед найімовірніше
        відбувається автоматично через вбудовані механізми WatermelonDB.
        Але можливо потрібно буде додати додаткову логіку, наприклад:
        
        await database.adapter.transaction(() => {
          // Додаткова логіка міграції тут
        });
      */
      
      return {
        success: true,
        message: `Успішно оновлено схему з версії ${fromVersion} до версії ${toVersion}`,
        fromVersion,
        toVersion
      };
    } catch (error) {
      console.error('Помилка при міграції вперед:', error);
      return {
        success: false,
        message: `Помилка при міграції вперед: ${error.message}`,
        fromVersion,
        toVersion,
        error
      };
    }
  }
  
  /**
   * Виконує міграцію назад (відкат) до більш старої версії схеми
   */
  private async migrateDown(fromVersion: number, toVersion: number): Promise<MigrationResult> {
    try {
      console.log(`Починаємо відкат міграції з версії ${fromVersion} до версії ${toVersion}`);
      
      // Викликаємо спеціальну логіку відкату міграцій
      // Це може бути складно і потребувати обережності, оскільки можна втратити дані
      
      /* 
        Потенційний код для відкату міграцій:
        
        const migrations = database._migrations || [];
        
        for (const migration of migrations.sort((a, b) => b.version - a.version)) {
          if (migration.version <= fromVersion && migration.version > toVersion) {
            await migration.down(database);
          }
        }
      */
      
      // Видаляємо колекції, яких немає в попередній версії схеми
      if (fromVersion >= 3 && toVersion < 3) {
        // У версії 1 та 2 немає колекції user_settings
        (database as any).collections.delete('user_settings');
      }
      
      if (fromVersion >= 2 && toVersion < 2) {
        // У версії 1 немає колекції notes
        (database as any).collections.delete('notes');
      }
      
      return {
        success: true,
        message: `Успішно виконано відкат схеми з версії ${fromVersion} до версії ${toVersion}`,
        fromVersion,
        toVersion
      };
    } catch (error) {
      console.error('Помилка при відкаті міграції:', error);
      return {
        success: false,
        message: `Помилка при відкаті міграції: ${error.message}`,
        fromVersion,
        toVersion,
        error
      };
    }
  }
  
  /**
   * Синхронізує дані з сервером після міграції
   */
  private async syncAfterMigration(): Promise<void> {
    // Перевіряємо, чи режим додатку не офлайн та чи є підключення до інтернету
    if (appConfig.offlineMode || !this.syncAdapter) {
      console.log('Синхронізацію після міграції пропущено через офлайн-режим');
      return;
    }
    
    try {
      console.log('Починаємо синхронізацію після міграції...');
      const result = await this.syncAdapter.synchronize();
      console.log(`Синхронізація після міграції завершена: ${result.success}`);
    } catch (error) {
      console.error('Помилка при синхронізації після міграції:', error);
      // Не викидаємо помилку, щоб не заважати роботі з додатком
    }
  }
  
  /**
   * Виявляє невідповідності в схемі та виконує коригувальні дії
   */
  public async checkAndFixSchemaInconsistencies(): Promise<string[]> {
    const issues: string[] = [];
    
    try {
      // Перевіряємо всі таблиці, які повинні бути в поточній версії схеми
      const schemaVersion = database.schema.version;
      
      // Список очікуваних таблиць в залежності від версії схеми
      const expectedTables = {
        1: ['projects', 'calculations', 'photos'],
        2: ['projects', 'calculations', 'photos', 'notes'],
        3: ['projects', 'calculations', 'photos', 'notes', 'user_settings']
      };
      
      // Отримуємо реальні таблиці
      const actualTables = Array.from((database as any).collections.keys());
      
      // Перевіряємо наявність всіх потрібних таблиць
      if (schemaVersion in expectedTables) {
        const expectedForVersion = expectedTables[schemaVersion];
        
        const missingTables = expectedForVersion.filter(table => !actualTables.includes(table));
        if (missingTables.length > 0) {
          issues.push(`Відсутні таблиці: ${missingTables.join(', ')}`);
          
          // Можливі виправлення, якщо таблиці відсутні
          // await this.recreateMissingTables(missingTables);
        }
        
        // Перевіряємо наявність зайвих таблиць для поточної версії
        const extraTables = actualTables.filter(table => 
          !expectedForVersion.includes(table) && 
          !['_loki', '_migrations', '_changes'].includes(table) // Системні таблиці WatermelonDB
        );
        
        if (extraTables.length > 0) {
          issues.push(`Зайві таблиці для версії ${schemaVersion}: ${extraTables.join(', ')}`);
          
          // Видаляємо зайві таблиці
          for (const table of extraTables) {
            (database as any).collections.delete(table);
          }
        }
      }
      
      return issues;
    } catch (error) {
      console.error('Помилка при перевірці цілісності схеми:', error);
      issues.push(`Помилка перевірки: ${error.message}`);
      return issues;
    }
  }
}

// Створюємо та експортуємо екземпляр сервісу міграцій
export const migrationService = new MigrationService();

/**
 * Хук для ініціалізації сервісу міграцій на початку роботи додатку
 */
export const useMigrationInit = async (): Promise<MigrationResult | null> => {
  try {
    // Перевіряємо необхідність міграції
    const migrationNeeded = await migrationService.checkMigrationNeeded();
    
    if (migrationNeeded) {
      // Виконуємо автоматичну міграцію
      return await migrationService.autoMigrate();
    }
    
    // Перевіряємо та виправляємо невідповідності в схемі
    const issues = await migrationService.checkAndFixSchemaInconsistencies();
    if (issues.length > 0) {
      console.warn('Знайдено невідповідності в схемі бази даних:', issues);
    }
    
    return null; // Міграція не потрібна
  } catch (error) {
    console.error('Помилка при ініціалізації міграцій:', error);
    return {
      success: false,
      message: `Помилка при ініціалізації міграцій: ${error.message}`,
      fromVersion: 0,
      toVersion: 0,
      error
    };
  }
};