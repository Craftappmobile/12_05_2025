// src/modules/sync/ConflictResolver.ts
import { ConflictStrategy } from '../../types/sync';

/**
 * Клас для вирішення конфліктів між локальними та серверними даними
 */
export class ConflictResolver {
  /**
   * Вирішує конфлікт між локальними та серверними даними
   * @param localData Локальні дані
   * @param serverData Серверні дані
   * @param strategy Стратегія вирішення конфліктів
   * @returns Вирішені дані
   */
  public resolveConflict<T extends { updated_at: string }>(localData: T, serverData: T, strategy: ConflictStrategy): T {
    // Переконуємося, що дати правильно порівнюються
    const localDate = new Date(localData.updated_at);
    const serverDate = new Date(serverData.updated_at);
    
    // Перевіряємо на валідність дат
    const isLocalDateValid = !isNaN(localDate.getTime());
    const isServerDateValid = !isNaN(serverDate.getTime());
    
    switch (strategy) {
      case ConflictStrategy.SERVER_WINS:
        return { ...serverData };

      case ConflictStrategy.CLIENT_WINS:
        return { ...localData };

      case ConflictStrategy.NEWEST_WINS:
        // Якщо котрась із дат невалідна, використовуємо іншу
        if (!isLocalDateValid && isServerDateValid) return { ...serverData };
        if (isLocalDateValid && !isServerDateValid) return { ...localData };
        if (!isLocalDateValid && !isServerDateValid) return { ...serverData }; // За замовчуванням
        
        // Порівнюємо дати і вибираємо новішу версію
        return localDate > serverDate ? { ...localData } : { ...serverData };

      case ConflictStrategy.MANUAL:
        // Повертаємо об'єкт з обома версіями даних
        return {
          ...serverData,
          _conflict: {
            local: { ...localData },
            server: { ...serverData }
          }
        } as T;

      default:
        // За замовчуванням серверна версія має пріоритет
        return { ...serverData };
    }
  }
}