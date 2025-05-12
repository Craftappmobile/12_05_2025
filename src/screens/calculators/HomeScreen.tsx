/**
 * @fileoverview Головний екран з категоріями калькуляторів
 * 
 * Цей компонент відображає головний екран додатку з категоріями калькуляторів,
 * кнопками навігації та можливістю додавати елементи до вибраного.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @updated 2025-05-06
 */

import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Accordion } from '../../components/ui';
import { Star, Search, Bell, Menu as MenuIcon } from 'lucide-react-native';
import { navigationService } from '../../services/navigationService';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Константа для збереження вибраних елементів
const FAVORITES_STORAGE_KEY = '@KnitApp:Favorites';

// Дані категорій та підкатегорій
const categories = [
  {
    id: 1,
    name: 'Адаптація МК',
    subcategories: [
      { id: '1.1', name: 'Адаптація МК', route: 'AdaptationCalculator' }
    ]
  },
  {
    id: 2,
    name: 'Калькулятор пряжі',
    subcategories: [
      { id: '2.1', name: 'Витрата пряжі', route: 'YarnCalculator' },
      { id: '2.2', name: 'Розрахунок складань', route: 'YarnCombinationCalculator' },
      { id: '2.3', name: 'Розрахунок додаткової нитки', route: 'AdditionalYarnCalculator' },
      { id: '2.4', name: 'Розрахунок щільності на основі зразка', route: 'GaugeCalculator' }
    ]
  },
  {
    id: 3,
    name: 'Калькулятор моделі реглан - класичний',
    subcategories: [
      { id: '3.1', name: 'Розрахунок горловини', route: 'NecklineCalculator' },
      { id: '3.2', name: 'Розподіл петель на реглан', route: 'RaglanDistributionCalculator' },
      { id: '3.3', name: 'Довжина регланної лінії', route: 'RaglanLengthCalculator' },
      { id: '3.4', name: 'Прибавки реглану', route: 'RaglanIncreasesCalculator' },
      { id: '3.5', name: 'Росток', route: 'BackNeckCalculator' },
      { id: '3.6', name: 'Коригування розподілу петель відповідно ростка', route: 'BackNeckAdjustmentCalculator' },
      { id: '3.7', name: 'Точки розвороту при в\'язанні ростка', route: 'BackNeckTurningPointsCalculator' },
      { id: '3.8', name: 'Убавки для формування реглану при в\'язанні знизу', route: 'BottomUpRaglanDecreasesCalculator' }
    ]
  },
  {
    id: 4,
    name: 'Калькулятор петель підрізів',
    subcategories: [
      { id: '4.1', name: 'Калькулятор петель підрізів', route: 'UndercutCalculator' }
    ]
  },
  {
    id: 5,
    name: 'Калькулятор моделі кругла кокетка',
    subcategories: [
      { id: '5.1', name: 'Висота круглої кокетки', route: 'YokeHeightCalculator' },
      { id: '5.2', name: 'Розрахунок прибавок', route: 'YokeIncreasesCalculator' }
    ]
  },
  {
    id: 6,
    name: 'Калькулятор убавок і прибавок рукава',
    subcategories: [
      { id: '6.1', name: 'Калькулятор убавок і прибавок рукава', route: 'SleeveCalculator' }
    ]
  },
  {
    id: 7,
    name: 'Калькулятор моделі реглан-погон',
    subcategories: [
      { id: '7.1', name: 'Реглан-погон', route: 'SaddleShoulderCalculator' }
    ]
  },
  {
    id: 8,
    name: 'Калькулятор моделі спущене плече',
    subcategories: [
      { id: '8.1', name: 'Скільки набрати петель', route: 'DroppedShoulderCastOnCalculator' },
      { id: '8.2', name: 'Ширина горловини', route: 'DroppedShoulderNecklineCalculator' },
      { id: '8.3', name: 'Ширина плеча та скоси', route: 'DroppedShoulderWidthCalculator' },
      { id: '8.4', name: 'Поглиблення горловини', route: 'DroppedShoulderNeckDepthCalculator' }
    ]
  },
  {
    id: 9,
    name: 'Калькулятор V-горловина',
    subcategories: [
      { id: '9.1', name: 'Убавки V-горловини', route: 'VNeckDecreaseCalculator' },
      { id: '9.2', name: 'Прибавки V-горловини', route: 'VNeckIncreaseCalculator' }
    ]
  },
  {
    id: 10,
    name: 'Калькулятор петель для аксесуарів',
    subcategories: [
      { id: '10.1', name: 'Шапка', route: 'HatCalculator' },
      { id: '10.2', name: 'Шарф', route: 'ScarfCalculator' },
      { id: '10.3', name: 'Шкарпетки', route: 'SocksCalculator' },
      { id: '10.4', name: 'Рукавички', route: 'GlovesCalculator' },
      { id: '10.5', name: 'Плед', route: 'BlanketCalculator' }
    ]
  }
];

/**
 * Головний екран з калькуляторами
 * 
 * @returns {React.ReactElement} Компонент головного екрану
 */
const HomeScreen: React.FC = () => {
  // Отримуємо навігаційний об'єкт для переходів між екранами
  const navigation = useNavigation();
  
  // Стан для збереження обраних елементів
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * Завантаження обраних елементів з AsyncStorage
   */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (storedFavorites !== null) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Помилка при завантаженні обраних елементів:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFavorites();
  }, []);

  /**
   * Збереження обраних елементів в AsyncStorage
   * 
   * @param {string[]} newFavorites - Новий список обраних елементів
   */
  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Помилка при збереженні обраних елементів:", error);
    }
  };

  /**
   * Перемикання елемента в списку обраних
   * 
   * @param {string} itemId - Ідентифікатор елемента
   */
  const toggleFavorite = useCallback((itemId: string) => {
    setFavorites(currentFavorites => {
      const newFavorites = currentFavorites.includes(itemId)
        ? currentFavorites.filter(id => id !== itemId)
        : [...currentFavorites, itemId];
        
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  /**
   * Навігація до вибраного калькулятора
   * 
   * @param {string} route - Назва маршруту
   */
  const navigateToCalculator = useCallback((route: string) => {
    if (navigation) {
      navigation.navigate(route as never);
    }
  }, [navigation]);
  
  /**
   * Відкриття бічного меню
   */
  const openDrawer = useCallback(() => {
    if (navigation) {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  }, [navigation]);

  /**
   * Навігація до екрану обраних елементів
   */
  const navigateToFavorites = useCallback(() => {
    try {
      navigation.navigate('Favorites' as never);
    } catch (error) {
      console.error("Помилка при прямій навігації до Favorites:", error);
      
      try {
        navigation.navigate('Calculators' as never, { 
          screen: 'Favorites' 
        } as never);
      } catch (nestedError) {
        console.error("Помилка при вкладеній навігації:", nestedError);
        
        try {
          navigationService.navigate('Favorites');
        } catch (serviceError) {
          console.error("Загальна помилка навігації:", serviceError);
          alert('Не вдалося перейти до Добірки.');
        }
      }
    }
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Верхня панель */}
      <View style={styles.toolbar}>
        {/* Кнопка відкриття бічного меню */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={openDrawer}
        >
          <MenuIcon size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.toolbarTitle}>Калькулятори</Text>
        
        <View style={styles.toolbarIcons}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Search' as never)}
          >
            <Search size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={navigateToFavorites}
          >
            <Star size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Bell size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Слоган */}
      <Text style={styles.slogan}>Розрахуй і в'яжи, петля в петлю!</Text>

      {/* Акордеон з категоріями */}
      <ScrollView style={styles.content}>
        {categories.map(category => (
          <View key={category.id} style={styles.categoryContainer}>
            <Accordion 
              title={category.name}
              rightElement={
                <TouchableOpacity 
                  style={styles.favoriteIconInAccordion}
                  onPress={() => toggleFavorite(`cat_${category.id}`)}
                >
                  <Star
                    size={20}
                    color={favorites.includes(`cat_${category.id}`) ? "#FFD700" : "#ccc"}
                    fill={favorites.includes(`cat_${category.id}`) ? "#FFD700" : "none"}
                  />
                </TouchableOpacity>
              }
            >
              <View>
                {category.subcategories.map(subcategory => (
                  <TouchableOpacity
                    key={subcategory.id}
                    style={styles.subcategoryItem}
                    onPress={() => navigateToCalculator(subcategory.route)}
                  >
                    <Text style={styles.subcategoryText}>• {subcategory.name}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(subcategory.id)}>
                      <Star
                        size={20}
                        color={favorites.includes(subcategory.id) ? "#FFD700" : "#ccc"}
                        fill={favorites.includes(subcategory.id) ? "#FFD700" : "none"}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </Accordion>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuButton: {
    padding: 8,
    borderRadius: 4,
  },
  toolbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  toolbarIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
  },
  iconButton: {
    padding: 4,
    marginLeft: 8,
  },
  slogan: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    fontFamily: 'Roboto_Bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  categoryContainer: {
    position: 'relative',
    marginBottom: 12
  },
  favoriteIconInAccordion: {
    marginRight: 8,
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  subcategoryText: {
    fontSize: 16,
    fontFamily: 'Roboto'
  },
});

export default HomeScreen;