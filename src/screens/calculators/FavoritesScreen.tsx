import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Star, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = '@KnitApp:Favorites';

// Опис всіх калькуляторів для співвіднесення ID з назвами й маршрутами
const allCalculators = {
  // Категорії
  'cat_1': { name: 'Адаптація МК', category: '', isCategory: true },
  'cat_2': { name: 'Калькулятор пряжі', category: '', isCategory: true },
  'cat_3': { name: 'Калькулятор моделі реглан - класичний', category: '', isCategory: true },
  'cat_4': { name: 'Калькулятор петель підрізів', category: '', isCategory: true },
  'cat_5': { name: 'Калькулятор моделі кругла кокетка', category: '', isCategory: true },
  'cat_6': { name: 'Калькулятор убавок і прибавок рукава', category: '', isCategory: true },
  
  // Підкатегорії
  '1.1': { name: 'Адаптація МК', category: 'Адаптація МК', route: 'AdaptationCalculator' },
  '2.1': { name: 'Витрата пряжі', category: 'Калькулятор пряжі', route: 'YarnCalculator' },
  '2.2': { name: 'Розрахунок складань', category: 'Калькулятор пряжі', route: 'YarnCombinationCalculator' },
  '3.5': { name: 'Росток', category: 'Калькулятор моделі реглан - класичний', route: 'BackNeckCalculator' },
  '5.1': { name: 'Висота круглої кокетки', category: 'Калькулятор моделі кругла кокетка', route: 'YokeHeightCalculator' },
  '6.1': { name: 'Калькулятор убавок і прибавок рукава', category: 'Калькулятор убавок і прибавок рукава', route: 'SleeveCalculator' },
  '10.2': { name: 'Шарф', category: 'Калькулятор петель для аксесуарів', route: 'ScarfCalculator' },
};

const FavoritesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      console.log('Завантаження фаворитів з AsyncStorage');
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      console.log('Отримані фаворити:', storedFavorites);
      
      if (storedFavorites !== null) {
        setFavorites(JSON.parse(storedFavorites));
      } else {
        // Якщо немає збережених фаворитів, встановлюємо пустий масив
        setFavorites([]);
        console.log('Дані фаворитів не знайдено, встановлено порожній масив');
      }
    } catch (error) {
      console.error('Помилка при завантаженні обраних елементів:', error);
      // В разі помилки також встановлюємо пустий масив
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (itemId: string) => {
    const newFavorites = favorites.filter(id => id !== itemId);
    setFavorites(newFavorites);
    
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Помилка при збереженні обраних елементів:', error);
    }
  };

  const navigateToCalculator = (route: string) => {
    if (route) {
      navigation.navigate(route);
    }
  };

  const renderItem = ({ item }: { item: { id: string, data: any } }) => {
    const { id, data } = item;
    
    // Не показуємо категорії у списку обраних
    if (data.isCategory) return null;
    
    return (
      <TouchableOpacity
        style={styles.favoriteItem}
        onPress={() => navigateToCalculator(data.route)}
      >
        <View style={styles.favoriteContent}>
          <Text style={styles.favoriteTitle}>{data.name}</Text>
          <Text style={styles.favoriteCategory}>{data.category}</Text>
        </View>
        <TouchableOpacity onPress={() => removeFavorite(id)}>
          <Star size={20} color="#FFD700" fill="#FFD700" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Перетворюємо ID обраних елементів у повні об'єкти
  const favoriteItems = favorites
    .filter(id => allCalculators[id])
    .map(id => ({ id, data: allCalculators[id] }));

  // Фільтруємо, щоб показувати лише підкатегорії (не категорії)
  const subcategoryFavorites = favoriteItems.filter(item => !item.data.isCategory);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Ваші обрані калькулятори</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : subcategoryFavorites.length > 0 ? (
        <FlatList
          data={subcategoryFavorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            У вас ще немає обраних калькуляторів
          </Text>
          <Text style={styles.emptySubtext}>
            Додайте калькулятори до обраного, натиснувши на зірочку на головному екрані
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto_Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { 
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  favoriteContent: { 
    flex: 1,
    marginRight: 8,
  },
  favoriteTitle: { 
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Roboto_Bold',
  },
  favoriteCategory: { 
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto',
  },
  emptyContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: { 
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Roboto_Bold',
  },
  emptySubtext: { 
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Roboto',
    paddingHorizontal: 16,
  },
});

export default FavoritesScreen;
