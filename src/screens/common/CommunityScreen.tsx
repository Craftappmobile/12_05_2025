/**
 * @fileoverview Екран спільноти
 * 
 * Цей компонент відображає екран спільноти з постами та обговореннями проектів.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Users } from 'lucide-react-native';

/**
 * Компонент екрану спільноти
 * 
 * @returns {React.ReactElement} Компонент екрану спільноти
 */
const CommunityScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Users size={40} color="#555" />
        </View>
        <Text style={styles.headerTitle}>Спільнота майстрів</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonTitle}>Розділ у розробці</Text>
        <Text style={styles.comingSoonText}>
          Тут буде доступна спільнота майстрів в'язання, де ви зможете обговорювати проекти, 
          ділитися досвідом, задавати питання та допомагати іншим.
        </Text>
        <Text style={styles.comingSoonText}>
          Слідкуйте за оновленнями, щоб дізнатися, коли цей розділ стане доступним.
        </Text>
      </View>

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Очікувані функції:</Text>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Пошук проектів та майстрів</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Обговорення розрахунків та проектів</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Прямі повідомлення між майстрами</Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureText}>• Відгуки та оцінки проектів</Text>
        </View>
      </View>
    </ScrollView>
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

export default CommunityScreen;