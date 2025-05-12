import React from 'react';
import { DrawerActions, NavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';

// Створюємо типізований реф для доступу до навігації
export const navigationRef = React.createRef<NavigationContainerRef<any>>();

// Удосконалений сервіс для керування навігацією з будь-якого місця додатку
export const navigationService = {
  // Відкрити бічне меню - покращена версія
  openDrawer: () => {
    console.log('navigationService.openDrawer викликано');
    const current = navigationRef.current;
    
    if (!current) {
      console.warn('Навігаційний реф недоступний');
      return false;
    }
    
    // Детальне логування про стан навігації
    console.log('Доступні методи navigationRef:', Object.keys(current).join(', '));
    
    try {
      // Спроба 1: Пошук drawer-навігатора за ID та прямий виклик
      const rootState = current.getRootState();
      if (rootState && rootState.routes) {
        console.log('Структура маршрутів:', rootState.routes.map(r => r.name).join(', '));
      }
      
      // Спроба 2: Використання DrawerActions
      console.log('Спроба відкрити drawer через DrawerActions');
      current.dispatch(DrawerActions.openDrawer());
      console.log('Команда dispatch виконана успішно');
      return true;
    } catch (e) {
      console.error('Помилка при відкритті бічного меню:', e);
      
      try {
        // Спроба 3: Використання загальної команди для drawer
        console.log('Спроба відкрити drawer через загальну команду');
        current.dispatch({ type: 'OPEN_DRAWER' });
        console.log('Загальна команда відправлена');
        return true;
      } catch (innerError) {
        console.error('Другорядна помилка при відкритті меню:', innerError);
        
        // Спроба 4: Пряма навігація до drawer
        try {
          console.log('Спроба навігації до RootDrawer');
          current.navigate('RootDrawer');
          return true;
        } catch (finalError) {
          console.error('Усі спроби відкриття drawer завершились невдачею');
          return false;
        }
      }
    }
  },
  
  // Закрити бічне меню
  closeDrawer: () => {
    const current = navigationRef.current;
    if (current) {
      try {
        current.dispatch(DrawerActions.closeDrawer());
      } catch (e) {
        console.error('Помилка при закритті бічного меню:', e);
      }
    } else {
      console.warn('Навігаційний реф не ініціалізовано');
    }
  },
  
  // Перехід до екрану
  navigate: (name: string, params?: object) => {
    const current = navigationRef.current;
    if (current) {
      try {
        current.navigate(name as never, params as never);
      } catch (e) {
        console.error(`Помилка при навігації до ${name}:`, e);
      }
    } else {
      console.warn('Навігаційний реф не ініціалізовано');
    }
  },
  
  // Отримати поточний стан навігації - корисно для діагностики
  getCurrentState: () => {
    const current = navigationRef.current;
    if (current) {
      return current.getRootState();
    }
    return null;
  },
  
  // Безпечний перехід до деталей проєкту
  navigateToProjectDetails: (projectId: string) => {
    const current = navigationRef.current;
    if (!current) {
      console.warn('Неможливо перейти до деталей проєкту: навігаційний реф недоступний');
      return false;
    }
    
    if (!projectId) {
      console.error('Неможливо перейти до деталей проєкту: не вказано ID проєкту');
      Alert.alert('Помилка', 'Не вказано ID проєкту');
      return false;
    }
    
    try {
      // Спочатку переходимо до проєктів, а потім до деталей
      current.navigate('Projects', {});
      
      // Даємо трохи часу на перехід
      setTimeout(() => {
        try {
          current.navigate('ProjectDetails', { projectId });
          return true;
        } catch (innerError) {
          console.error('Помилка при навігації до ProjectDetails:', innerError);
          return false;
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Помилка при навігації до проектів:', error);
      return false;
    }
  },
  
  // Діагностика навігації
  diagnoseNavigation: () => {
    const current = navigationRef.current;
    if (!current) {
      console.warn('Навігаційний реф недоступний');
      return {
        available: false,
        error: 'Навігаційний реф недоступний'
      };
    }
    
    try {
      const state = current.getRootState();
      const isReady = current.isReady();
      const currentOptions = current.getCurrentOptions();
      
      return {
        available: true,
        isReady,
        currentOptions,
        currentRoute: current.getCurrentRoute(),
        rootState: state,
        routeNames: state?.routeNames || [],
        routes: state?.routes || []
      };
    } catch (error) {
      console.error('Помилка при діагностиці навігації:', error);
      return {
        available: true, 
        error: String(error)
      };
    }
  }
};