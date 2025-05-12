/**
 * @fileoverview Екран налаштуванн додатку
 * 
 * Цей компонент відображає екран налаштувань додатку та дозволяє користувачу змінювати 
 * параметри додатку та налаштування облікового запису.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Settings as SettingsIcon, LogOut, Bell, Moon, Info } from 'lucide-react-native';
import { useAuth } from '../../context';

/**
 * Компонент екрану налаштувань
 * 
 * @returns {React.ReactElement} Компонент екрану налаштувань
 */
const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [syncOnlyWiFi, setSyncOnlyWiFi] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Вихід з облікового запису',
      'Чи дійсно бажаєте вийти з облікового запису?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Вийти', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <SettingsIcon size={40} color="#555" />
        </View>
        <Text style={styles.headerTitle}>Налаштування</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Обліковий запис</Text>
        <View style={styles.accountInfo}>
          <Text style={styles.accountEmail}>{user?.email || 'Гість'}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#f44336" />
            <Text style={styles.logoutText}>Вийти</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Загальні</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Bell size={24} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Сповіщення</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#4080ff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Moon size={24} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Темна тема</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={darkModeEnabled ? '#4080ff' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Info size={24} color="#555" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Синхронізація тільки через Wi-Fi</Text>
          </View>
          <Switch
            value={syncOnlyWiFi}
            onValueChange={setSyncOnlyWiFi}
            trackColor={{ false: '#d1d1d1', true: '#81b0ff' }}
            thumbColor={syncOnlyWiFi ? '#4080ff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Про додаток</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Версія</Text>
          <Text style={styles.aboutValue}>1.0.0</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>Розробник</Text>
          <Text style={styles.aboutValue}>Команда "Розрахуй і В'яжи"</Text>
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
    marginBottom: 16,
    fontFamily: 'Roboto_Bold',
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountEmail: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#f44336',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'Roboto',
  },
  aboutValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
});

export default SettingsScreen;