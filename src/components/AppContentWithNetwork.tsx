/**
 * @fileoverview Компонент для відображення головного контенту додатку з індикатором стану мережі.
 * 
 * Цей компонент є обгорткою, яка додає індикатор статусу мережі до будь-якого компонента,
 * що покращує UX в offline-first додатку.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2023-05-16
 * @updated 2025-05-06
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context';
import { OnlineIndicator } from './ui';

/**
 * Компонент для відображення екрана завантаження
 * 
 * @param {object} props - Пропси компонента
 * @param {object} [props.style] - Додаткові стилі для контейнера
 * @returns {React.ReactElement} Компонент екрана завантаження
 */
const LoadingScreen = ({ style }) => (
  <View style={[styles.centeredContainer, style]}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Завантаження додатку...</Text>
  </View>
);

/**
 * Компонент для відображення індикатора мережі та головного контенту
 * Це обгортка, яка додає індикатор мережі до будь-якого компонента
 * 
 * @param {object} props - Пропси компонента
 * @param {React.ReactNode} props.children - Дочірні елементи, які будуть відображені під індикатором
 * @returns {React.ReactElement} Компонент з індикатором та дочірніми елементами
 */
const MainWithNetworkIndicator = ({ children }) => (
  <View style={{ flex: 1 }}>
    <View style={styles.networkIndicatorContainer}>
      <OnlineIndicator />
    </View>
    {children}
  </View>
);

/**
 * Компонент, який відображає дочірні елементи з індикатором статусу мережі.
 * 
 * Цей компонент додає відображення статусу підключення до мережі,
 * що важливо для offline-first архітектури.
 * 
 * @param {object} props - Пропси компонента
 * @param {React.ReactNode} props.children - Дочірні елементи (навігатор)
 * @returns {React.ReactElement} Компонент з індикатором мережі та дочірніми елементами
 */
const AppContentWithNetwork = ({ children }) => {
  const { user, loading, setGuestUser } = useAuth();

  // Використовуємо гостьовий режим для розробки
  useEffect(() => {
    if (!user && !loading) {
      // Встановлюємо гостьовий режим для тестування
      setGuestUser();
    }
  }, [user, loading, setGuestUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <MainWithNetworkIndicator>
      {children}
    </MainWithNetworkIndicator>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  networkIndicatorContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 9999,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
});

export default AppContentWithNetwork;