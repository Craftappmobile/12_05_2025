import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

// Дані для пошуку (всі калькулятори)
const allCalculators = [
  { id: '1.1', name: 'Адаптація МК', route: 'AdaptationCalculator', category: 'Адаптація МК' },
  { id: '2.1', name: 'Витрата пряжі', route: 'YarnCalculator', category: 'Калькулятор пряжі' },
  { id: '2.2', name: 'Розрахунок складань', route: 'YarnCombinationCalculator', category: 'Калькулятор пряжі' },
  { id: '2.3', name: 'Розрахунок додаткової нитки', route: 'AdditionalYarnCalculator', category: 'Калькулятор пряжі' },
  { id: '2.4', name: 'Розрахунок щільності на основі зразка', route: 'GaugeCalculator', category: 'Калькулятор пряжі' },
  // Додайте інші калькулятори...
];

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const filteredResults = allCalculators.filter(calculator => 
      calculator.name.toLowerCase().includes(text.toLowerCase()) ||
      calculator.category.toLowerCase().includes(text.toLowerCase())
    );
    
    setSearchResults(filteredResults);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigateToCalculator = (route) => {
    navigation.navigate(route);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigateToCalculator(item.route)}
    >
      <View>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultCategory}>{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Пошук калькуляторів..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : (
        searchQuery.length > 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              Нічого не знайдено за запитом "{searchQuery}"
            </Text>
            <Text style={styles.noResultsSubtext}>
              Спробуйте змінити пошуковий запит
            </Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({ container: {
    flex: 1,
    backgroundColor: '#f5f5f5' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1,
    fontSize: 16,
    height: 40,
    fontFamily: 'Roboto' },
  resultsList: { paddingHorizontal: 16 },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultTitle: { fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Roboto_Bold' },
  resultCategory: { fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto' },
  noResultsContainer: { flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24 },
  noResultsText: { fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Roboto_Bold' },
  noResultsSubtext: { fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'Roboto' },
});

export default SearchScreen;
