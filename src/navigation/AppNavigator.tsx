/**
 * @fileoverview Головний навігатор додатку з бічним меню
 * 
 * Цей компонент налаштовує головну навігаційну структуру додатку з використанням
 * бічного меню та стеків для різних розділів додатку.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Імпортуємо компонент бічного меню
import DrawerContent from '../components/drawer/DrawerContent';

// Імпортуємо навігаційний сервіс
import { navigationRef } from '../services/navigationService';

// Імпортуємо компоненти екранів
import { HomeScreen, FavoritesScreen, SearchScreen, NotificationsScreen, 
         YarnCalculatorWithNavigation, HatCalculator, VNeckDecreaseCalculator, 
         AdaptationCalculator } from '../screens/calculators';
// Імпортуємо компоненти проєктів окремо для уникнення проблем з displayName
import ProjectsList from '../screens/projects/ProjectsList';
import ProjectDetails from '../screens/projects/ProjectDetails';
import ProjectDetailsClean from '../screens/projects/ProjectDetailsClean'; // Імпортуємо чистий компонент без можливих помилок
import ProjectDetailsSimplified from '../screens/projects/ProjectDetailsSimplified'; // Імпортуємо спрощений компонент для тестування
import ImprovedProjectDetails from '../screens/projects/ImprovedProjectDetails'; // Імпортуємо покращений компонент з новим UX
import EditProject from '../screens/projects/EditProject';
import CalculationDetails from '../screens/projects/CalculationDetails';
import CalculatorsList from '../screens/projects/CalculatorsList';
import CreateProject from '../screens/projects/CreateProject';
import YarnStorageScreen from '../screens/YarnStorageScreen';

// Імпортуємо компоненти для відображення статусу мережі
import AppContentWithNetwork from '../components/AppContentWithNetwork';
import ErrorBoundary from '../components/EnhancedErrorBoundary';
import { withSafeDisplayName } from '../utils/componentUtils';
import { enhanceNavigationComponents } from '../utils/enhanceComponents';

// Покращуємо навігаційні компоненти перед створенням навігаторів
enhanceNavigationComponents();

// Створюємо навігатори
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Імпортуємо компоненти для пунктів меню
import { ProfileScreen, CommunityScreen, GalleryScreen, SettingsScreen } from '../screens/common';

import { View, Text, StyleSheet } from 'react-native';

/**
 * Навігатор для калькуляторів
 * 
 * @returns {React.ReactElement} Навігатор калькуляторів
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
 * 
 * @returns {React.ReactElement} Навігатор проєктів
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
      component={ImprovedProjectDetails} /* Замінюємо на покращений компонент */
      options={{ 
        title: "Деталі проєкту",
        headerShown: false // Приховуємо стандартний заголовок, бо використовуємо власний
      }}
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
 * Обгортка для екрану складу пряжі
 */
const YarnStorageWrapper = ({ navigation }) => (
  <YarnStorageScreen navigation={navigation} />
);

/**
 * Головний навігатор з бічним меню
 * 
 * @returns {React.ReactElement} Головний навігатор
 */
const MainNavigator = () => (
  <Drawer.Navigator
    id="RootDrawer"
    screenOptions={{
      drawerActiveTintColor: '#007AFF',
      drawerInactiveTintColor: '#333',
      drawerStyle: {
        backgroundColor: '#fff',
        width: 240,
      },
      drawerLabelStyle: {
        fontFamily: 'Roboto',
        fontSize: 16,
      },
      headerShown: false,
      drawerItemStyle: {
        marginVertical: 5,
      },
    }}
    drawerContent={(props) => <DrawerContent {...props} />}
  >
    <Drawer.Screen 
      name="Calculators" 
      component={CalculatorsStack} 
      options={{ 
        title: "Калькулятори",
        headerShown: false
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
 * Головний компонент навігації додатку
 * 
 * @returns {React.ReactElement} Компонент навігації
 */
// Функція для забезпечення наявності displayName у SafeAreaProvider
const ensureSafeAreaProviderHasDisplayName = () => {
  try {
    const SafeAreaProviderModule = require('react-native-safe-area-context');
    if (SafeAreaProviderModule?.SafeAreaProvider && !SafeAreaProviderModule.SafeAreaProvider.displayName) {
      console.log('Встановлюємо displayName для SafeAreaProvider');
      SafeAreaProviderModule.SafeAreaProvider.displayName = 'SafeAreaProvider';
    }
  } catch (e) {
    console.warn('Не вдалося встановити displayName для SafeAreaProvider:', e);
  }
};

// Викликаємо функцію перед створенням навігатора
ensureSafeAreaProviderHasDisplayName();

const AppNavigator = () => {
  // Використовуємо useEffect для встановлення displayName після монтування
  React.useEffect(() => {
    ensureSafeAreaProviderHasDisplayName();
  }, []);
  
  // Створюємо SafeAreaProvider з явним displayName
  const CustomSafeAreaProvider = React.forwardRef((props, ref) => {
    return <SafeAreaProvider {...props} ref={ref} />;
  });
  CustomSafeAreaProvider.displayName = 'CustomSafeAreaProvider';
  
  return (
    <CustomSafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <AppContentWithNetwork>
          <MainNavigator />
        </AppContentWithNetwork>
      </NavigationContainer>
      <StatusBar style="auto" />
    </CustomSafeAreaProvider>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Roboto_Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto',
  },
});

export default AppNavigator;