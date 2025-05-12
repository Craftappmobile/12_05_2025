/**
 * @fileoverview Компонент для відображення статусу підключення до мережі у вигляді точки.
 * 
 * Цей компонент відстежує підключення до інтернету та відображає кольорову точку,
 * яка змінює колір залежно від стану підключення.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-05
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Інтерфейс пропсів для компонента OnlineIndicator
 */
type OnlineIndicatorProps = {
  /**
   * Опціональний стиль для контейнера
   */
  style?: object;
};

/**
 * Компонент для відображення статусу підключення у вигляді точки
 * 
 * @param {object} props - Пропси компонента
 * @param {object} [props.style] - Додаткові стилі для контейнера
 * @returns {React.ReactElement} Компонент індикатора підключення
 */
const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({ style }) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    // Отримуємо початковий стан мережі
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    
    // Підписуємось на зміни стану мережі
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected && state.isInternetReachable);
    });
    
    // Відписуємось при демонтажі компонента
    return () => unsubscribe();
  }, []);

  return (
    <View 
      style={[
        styles.onlineIndicator, 
        { backgroundColor: isOnline ? '#4CAF50' : '#F44336' },
        style
      ]} 
    />
  );
};

const styles = StyleSheet.create({
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 10,
    ...Platform.select({
      android: { elevation: 1 },
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 1 },
    }),
  },
});

export default OnlineIndicator;