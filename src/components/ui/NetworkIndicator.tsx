/**
 * @fileoverview Компонент для відображення стану мережі та синхронізації.
 * 
 * Цей компонент відстежує підключення до інтернету та статус синхронізації,
 * відображаючи відповідний індикатор. Використовується як частина
 * offline-first архітектури додатку, щоб користувачі чітко розуміли,
 * коли їхні дані синхронізуються з сервером.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2023-05-16
 * @updated 2023-06-22
 */

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { SyncStage } from '../../types/sync';

/**
 * Інтерфейс пропсів для компонента NetworkIndicator
 * @interface NetworkIndicatorProps
 */
type NetworkIndicatorProps = {
  /**
   * Опціональний стиль для контейнера
   */
  style?: object;
  
  /**
   * Опціональний текст для відображення
   * (замість стандартного Онлайн/Офлайн)
   */
  customText?: {
    online: string;
    offline: string;
    syncing: string;
    syncComplete: string;
    syncError: string;
  };
  
  /**
   * Статус синхронізації (опціональний)
   * Якщо не вказаний, компонент спробує отримати статус
   * з SyncContext
   */
  syncStage?: SyncStage;
  
  /**
   * Обробник події щоб запустити синхронізацію вручну
   */
  onSync?: () => void;
  
  /**
   * Чи є сервісні дані доступними на сервері
   */
  hasUnsynced?: boolean;
};

// Імпортуємо контекст синхронізації
import { useCallback } from 'react';
import { database } from '../../services/db';
import { SyncAdapter } from '../../modules/sync/SyncAdapter';
import { supabase } from '../../services/auth/supabaseClient';

/**
 * Компонент для відображення стану мережі та синхронізації.
 * Використовує NetInfo для відстеження змін стану мережі та
 * показує поточний статус синхронізації даних.
 * 
 * @param {object} props - Пропси компонента
 * @param {object} [props.style] - Додаткові стилі для контейнера
 * @param {object} [props.customText] - Кастомний текст для заміни стандартних написів
 * @param {SyncStage} [props.syncStage] - Поточний етап синхронізації
 * @param {Function} [props.onSync] - Функція для ручного запуску синхронізації
 * @param {boolean} [props.hasUnsynced] - Чи є несинхронізовані дані
 * @returns {React.ReactElement} Компонент індикатора мережі та синхронізації
 */
const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  style,
  customText,
  syncStage: propsSyncStage,
  onSync,
  hasUnsynced = false
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [syncStage, setSyncStage] = useState<SyncStage | null>(propsSyncStage || null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncAdapter, setSyncAdapter] = useState<SyncAdapter | null>(null);
  
  // Ініціалізуємо SyncAdapter, якщо він не переданий у пропсах
  useEffect(() => {
    if (!syncAdapter) {
      try {
        const adapter = new SyncAdapter(database, supabase);
        setSyncAdapter(adapter);
      } catch (error) {
        console.error('Помилка при створенні SyncAdapter:', error);
      }
    }
  }, []);
  
  // Підписуємось на зміни статусу синхронізації
  useEffect(() => {
    if (propsSyncStage) {
      setSyncStage(propsSyncStage);
      setIsSyncing(
        propsSyncStage === SyncStage.INITIALIZING || 
        propsSyncStage === SyncStage.PUSHING || 
        propsSyncStage === SyncStage.PULLING || 
        propsSyncStage === SyncStage.RESOLVING_CONFLICTS
      );
    } else if (syncAdapter) {
      // Якщо syncStage не переданий в пропсах, але є syncAdapter
      // тоді перевіряємо чи відбувається синхронізація
      setIsSyncing(syncAdapter.isSyncing());
    }
  }, [propsSyncStage, syncAdapter]);
  
  useEffect(() => {
    // Отримуємо початковий стан мережі
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
    
    // Підписуємось на зміни стану мережі
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    
    // Відписуємось при демонтажі компонента
    return () => unsubscribe();
  }, []);
  
  // Функція для запуску синхронізації вручну
  const handleSyncPress = useCallback(() => {
    if (onSync) {
      onSync();
    } else if (syncAdapter && !isSyncing && isConnected) {
      setIsSyncing(true);
      setSyncStage(SyncStage.INITIALIZING);
      
      syncAdapter.synchronize()
        .then(result => {
          setSyncStage(result.stage);
          setTimeout(() => {
            if (result.stage === SyncStage.COMPLETED) {
              setSyncStage(null);
            }
          }, 3000); // Показуємо статус завершення 3 секунди
        })
        .catch(error => {
          console.error('Помилка синхронізації:', error);
          setSyncStage(SyncStage.ERROR);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, [onSync, syncAdapter, isSyncing, isConnected]);
  
  // Визначаємо текст та колір для відображення
  let statusText = '';
  let containerStyle = {};
  
  if (!isConnected) {
    statusText = customText?.offline || 'Офлайн';
    containerStyle = styles.offlineContainer;
  } else if (isSyncing) {
    statusText = customText?.syncing || 'Синхронізація...';
    containerStyle = styles.syncingContainer;
  } else if (syncStage === SyncStage.COMPLETED) {
    statusText = customText?.syncComplete || 'Синхронізовано';
    containerStyle = styles.onlineContainer;
  } else if (syncStage === SyncStage.ERROR) {
    statusText = customText?.syncError || 'Помилка синхронізації';
    containerStyle = styles.errorContainer;
  } else if (hasUnsynced) {
    statusText = 'Є незбережені зміни';
    containerStyle = styles.unsyncedContainer;
  } else {
    statusText = customText?.online || 'Онлайн';
    containerStyle = styles.onlineContainer;
  }
  
  // Якщо це звичайний онлайн-статус (не синхронізація чи помилка), використовуємо точку замість тексту
  if (isConnected && !isSyncing && !hasUnsynced && syncStage !== SyncStage.ERROR) {
    return (
      <View 
        style={[styles.dotContainer, style]}
        onTouchEnd={handleSyncPress}
      >
        <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
      </View>
    );
  }
  
  // В інших випадках (синхронізація, помилка, офлайн) показуємо текстовий статус
  return (
    <View 
      style={[styles.container, containerStyle, style]}
      onTouchEnd={isConnected && !isSyncing ? handleSyncPress : undefined}
    >
      {isSyncing && (
        <ActivityIndicator 
          size="small" 
          color="white" 
          style={styles.indicator} 
        />
      )}
      <Text style={styles.text}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Стилі для точкового індикатора
  dotContainer: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 1 },
    }),
  },
  container: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  onlineContainer: {
    backgroundColor: '#4CAF50', // Зелений
  },
  offlineContainer: {
    backgroundColor: '#F44336', // Червоний
  },
  syncingContainer: {
    backgroundColor: '#2196F3', // Синій
  },
  errorContainer: {
    backgroundColor: '#FF9800', // Оранжевий (попередження)
  },
  unsyncedContainer: {
    backgroundColor: '#9C27B0', // Фіолетовий
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  indicator: {
    marginRight: 6,
  },
});

export default NetworkIndicator;