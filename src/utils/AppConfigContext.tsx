/**
 * Контекст для керування конфігурацією додатка
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-10
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ключ для збереження режиму в AsyncStorage
const APP_MODE_STORAGE_KEY = '@KnitApp:AppMode';

// Типи для режимів додатка
type AppMode = 'simple' | 'full';

// Інтерфейс контексту
interface AppConfigContextProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isBridgelessMode: boolean;
  version: string;
}

// Створюємо контекст
const AppConfigContext = createContext<AppConfigContextProps | undefined>(undefined);

// Інтерфейс провайдера
interface AppConfigProviderProps {
  children: ReactNode;
}

/**
 * Провайдер для конфігурації додатка
 */
export const AppConfigProvider: React.FC<AppConfigProviderProps> = ({ children }) => {
  // Стан для зберігання поточного режиму
  const [mode, setModeState] = useState<AppMode>('simple');
  const [isLoading, setIsLoading] = useState(true);
  
  // Поточна версія додатка
  const version = '1.0.2';
  
  // Визначення режиму Bridgeless
  const isBridgelessMode = true; // В майбутньому це можна замінити на реальну перевірку

  // Завантаження режиму з AsyncStorage при монтуванні
  useEffect(() => {
    const loadAppMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(APP_MODE_STORAGE_KEY);
        if (savedMode === 'full' || savedMode === 'simple') {
          setModeState(savedMode);
        }
      } catch (error) {
        console.warn('Помилка при завантаженні режиму додатка:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppMode();
  }, []);

  // Функція для зміни режиму з збереженням в AsyncStorage
  const setMode = async (newMode: AppMode) => {
    try {
      await AsyncStorage.setItem(APP_MODE_STORAGE_KEY, newMode);
      setModeState(newMode);
    } catch (error) {
      console.warn('Помилка при збереженні режиму додатка:', error);
    }
  };

  // Створюємо значення контексту
  const contextValue: AppConfigContextProps = {
    mode,
    setMode,
    isBridgelessMode,
    version,
  };

  // Повертаємо провайдер з дітьми
  if (isLoading) {
    // Можна повернути заглушку під час завантаження
    return null;
  }

  return (
    <AppConfigContext.Provider value={contextValue}>
      {children}
    </AppConfigContext.Provider>
  );
};

/**
 * Хук для використання контексту конфігурації
 */
export const useAppConfig = (): AppConfigContextProps => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig має використовуватись всередині AppConfigProvider');
  }
  return context;
};