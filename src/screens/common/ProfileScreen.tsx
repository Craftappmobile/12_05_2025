/**
 * @fileoverview Екран профілю користувача
 * 
 * Цей компонент відображає екран профілю користувача з його особистими даними та налаштуваннями.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../context';
import { User } from 'lucide-react-native';

/**
 * Компонент екрану профілю
 * 
 * @returns {React.ReactElement} Компонент екрану профілю
 */
const ProfileScreen: React.FC = () => {
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={80} color="#555" />
        </View>
        <Text style={styles.userName}>
          {user?.email || 'Гість'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Особисті дані</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Електронна пошта:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Не вказано'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Статистика</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Проєктів створено:</Text>
          <Text style={styles.infoValue}>0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>В обраному:</Text>
          <Text style={styles.infoValue}>0</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Версія додатку: 1.0.0</Text>
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
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Roboto_Bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Roboto',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Roboto',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Roboto',
  },
});

export default ProfileScreen;