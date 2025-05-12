import React, { createContext, useContext, ReactNode } from 'react';

// Типи для контексту бази даних
interface DatabaseContextType {
  isInitialized: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  lastSyncTime: Date | null;
  triggerSync: () => Promise<void>;
}

// Створюємо контекст
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Провайдер для контексту
interface DatabaseProviderProps {
  children: ReactNode;
}

/**
 * Провайдер бази даних (WatermelonDB)
 */
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  // Для тестування використовуємо наперед задані значення
  const isInitialized = true;
  const syncStatus = 'idle' as const;
  const lastSyncTime = new Date();

  /**
   * Функція для синхронізації з сервером
   */
  const triggerSync = async (): Promise<void> => {
    console.log('Синхронізація з сервером...');
    // Заглушка для функції синхронізації
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Синхронізація завершена');
  };

  const value = {
    isInitialized,
    syncStatus,
    lastSyncTime,
    triggerSync,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
};

/**
 * Хук для використання контексту бази даних
 */
export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('Хук useDatabase має використовуватись всередині DatabaseProvider');
  }
  return context;
};