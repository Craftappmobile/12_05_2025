/**
 * @fileoverview Екран галереї проєктів
 * 
 * Цей компонент відображає екран галереї з фото проєктів користувачів.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';

/**
 * Компонент екрану галереї
 * 
 * @returns {React.ReactElement} Компонент екрану галереї
 */
const GalleryScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <ImageIcon size={40} color="#555" />
        </View>
        <Text style={styles.headerTitle}>Галерея проєктів</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonTitle}>Розділ у розробці</Text>
        <Text style={styles.comingSoonText}>
          Тут буде доступна галерея з фото готових проєктів та робіт в процесі, 
          де ви зможете ділитися своїми досягненнями та знаходити натхнення.
        </Text>
      </View>

      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Приклади но Ваші проєкти можуть виглядати так:</Text>
        
        <View style={styles.imageGrid}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderImageText}>Зображення 1</Text>
          </View>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderImageText}>Зображення 2</Text>
          </View>
        </View>
        
        <View style={styles.imageGrid}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderImageText}>Зображення 3</Text>
          </View>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderImageText}>Зображення 4</Text>
          </View>
        </View>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Очікувані функції:</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Завантаження фото ваших проєктів</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Коментування та оцінки</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Пошук за тегами та категоріями</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Збереження улюблених зображень</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const screenWidth = Dimensions.get('window').width;
const imageSize = (screenWidth - 60) / 2; // 2 зображення в ряд з відступами

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  iconContainer: {
    backgroundColor: '#f0f0f0',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  comingSoon: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Roboto_Bold',
  },
  comingSoonText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    fontFamily: 'Roboto',
  },
  placeholderContainer: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Roboto_Bold',
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  placeholderImage: {
    width: imageSize,
    height: imageSize,
    backgroundColor: '#e1e1e1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImageText: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'Roboto',
  },
  features: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Roboto_Bold',
  },
  featureItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Roboto',
  },
});

export default GalleryScreen;