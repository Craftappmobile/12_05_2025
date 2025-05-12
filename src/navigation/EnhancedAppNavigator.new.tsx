/**
 * Розширений навігатор додатка з підтримкою всіх екранів
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-10
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Імпортуємо навігаційний сервіс
import { navigationRef } from '../services/navigationService';

// Імпортуємо контент бічного меню
import SimpleDrawerContent from '../components/drawer/SimpleDrawerContent';

// Імпортуємо компоненти екранів калькуляторів
import {
  HomeScreen,
  FavoritesScreen,
  SearchScreen,
  NotificationsScreen,
  YarnCalculatorWithNavigation,
  HatCalculator,
  VNeckDecreaseCalculator,
  AdaptationCalculator
} from '../screens/calculators';

// Імпортуємо компоненти екранів проєктів
import {
  ProjectsList,
  EditProject,
  CreateProject,
  CalculationDetails,
  CalculatorsList,
  ProjectDetailsClean,
  ProjectDetailsSimplified,
  StableBridgelessProjectDetails
} from '../screens/projects';

// Імпортуємо загальні екрани
import {
  ProfileScreen,
  CommunityScreen,
  GalleryScreen,
  SettingsScreen
} from '../screens/common';

// Імпортуємо екран складу пряжі
import YarnStorageScreen from '../screens/YarnStorageScreen';

// Створюємо навігатори
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

/**
 * Навігатор для калькуляторів
 */
const CalculatorsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={{ title: "Калькулятори", headerShown: false }}
    />
    <Stack.Screen 
      name="YarnCalculator" 
      component={YarnCalculatorWithNavigation} 
      options={{ title: "Калькулятор пряжі" }}
    />
    <Stack.Screen 
      name="HatCalculator" 
      component={HatCalculator} 
      options={{ title: "Калькулятор шапки" }}
    />
    <Stack.Screen 
      name="VNeckDecreaseCalculator" 
      component={VNeckDecreaseCalculator} 
      options={{ title: 'Калькулятор V-горловини' }}
    />
    <Stack.Screen 
      name="AdaptationCalculator" 
      component={AdaptationCalculator} 
      options={{ title: "Адаптація МК" }}
    />
    <Stack.Screen 
      name="Favorites" 
      component={FavoritesScreen} 
      options={{ title: "Обране" }}
    />
    <Stack.Screen 
      name="Search" 
      component={SearchScreen} 
      options={{ title: "Пошук", headerShown: false }}
    />
    <Stack.Screen 
      name="Notifications" 
      component={NotificationsScreen} 
      options={{ title: "Сповіщення" }}
    />
  </Stack.Navigator>
);

/**
 * Навігатор для проєктів
 */
const ProjectsStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="ProjectsList" 
      component={ProjectsList}
      options={{ title: "Мої проєкти" }}
    />
    <Stack.Screen 
      name="ProjectDetailsSimplified" 
      component={ProjectDetailsSimplified}
      options={{ title: "Спрощені деталі проєкту" }}
    />
    <Stack.Screen 
      name="ProjectDetailsClean" 
      component={ProjectDetailsClean}
      options={{ title: "Деталі проєкту (безпечна версія)" }}
    />
    <Stack.Screen 
      name="ProjectDetails" 
      component={StableBridgelessProjectDetails}
      options={{ title: "Деталі проєкту" }}
    />
    <Stack.Screen 
      name="CreateProject" 
      component={CreateProject} 
      options={{ title: "Створення проєкту" }}
    />
    <Stack.Screen 
      name="EditProject" 
      component={EditProject} 
      options={{ title: "Редагування проєкту" }}
    />
    <Stack.Screen 
      name="CalculationDetails" 
      component={CalculationDetails} 
      options={{ title: "Деталі розрахунку" }}
    />
    <Stack.Screen 
      name="CalculatorsList" 
      component={CalculatorsList} 
      options={{ title: "Вибір калькулятора" }}
    />
  </Stack.Navigator>
);

/**
 * Компонент складу пряжі
 */
const YarnStorageWrapper = () => (
  <YarnStorageScreen />
);

/**
 * Головний навігатор з бічним меню
 */
const MainNavigator = () => (
  <Drawer.Navigator
    id="RootDrawer"
    screenOptions={{
      drawerActiveTintColor: '#4A6741',
      drawerInactiveTintColor: '#333',
      drawerStyle: {
        backgroundColor: '#fff',
        width: 280,
      },
      drawerLabelStyle: {
        fontSize: 16,
      },
      headerShown: false,
      drawerItemStyle: {
        marginVertical: 5,
      },
    }}
    drawerContent={(props) => <SimpleDrawerContent {...props} />}
  >
    <Drawer.Screen 
      name="Calculators" 
      component={CalculatorsStack} 
      options={{ 
        title: "Калькулятори"
      }}
    />
    <Drawer.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ 
        title: "Профіль"
      }}
    />
    <Drawer.Screen 
      name="Projects" 
      component={ProjectsStack} 
      options={{ 
        title: "Мої проєкти"
      }}
    />
    <Drawer.Screen 
      name="Community" 
      component={CommunityScreen} 
      options={{ 
        title: "Спільнота"
      }}
    />
    <Drawer.Screen 
      name="YarnStorage" 
      component={YarnStorageWrapper} 
      options={{ 
        title: "Склад пряжі"
      }}
    />
    <Drawer.Screen 
      name="Gallery" 
      component={GalleryScreen} 
      options={{ 
        title: "Галерея"
      }}
    />
    <Drawer.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ 
        title: "Налаштування"
      }}
    />
  </Drawer.Navigator>
);

/**
 * Розширений навігатор додатка 
 */
const EnhancedAppNavigator: React.FC = () => {
  // Використання useAppConfig додамо пізніше
  // Зараз просто відображаємо головний навігатор
  
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <MainNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default EnhancedAppNavigator;