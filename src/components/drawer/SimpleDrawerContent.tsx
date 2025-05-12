import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';

/**
 * Спрощений компонент вмісту бічного меню
 */
const SimpleDrawerContent: React.FC<any> = (props) => {
  const { navigation, state } = props;

  // Список пунктів меню
  const menuItems = [
    { key: 'calculators', label: '🧮 Калькулятори', route: 'Calculators' },
    { key: 'profile', label: '👤 Профіль', route: 'Profile' },
    { key: 'projects', label: '📓 Мої проєкти', route: 'Projects' },
    { key: 'community', label: '👥 Спільнота', route: 'Community' },
    { key: 'yarnstorage', label: '🧶 Склад пряжі', route: 'YarnStorage' },
    { key: 'gallery', label: '🖼️ Галерея', route: 'Gallery' },
    { key: 'settings', label: '⚙️ Налаштування', route: 'Settings' },
  ];

  /**
   * Обробник для навігації на інший екран
   */
  const navigateToScreen = (route: string) => {
    navigation.navigate(route);
  };

  /**
   * Закриття бічного меню
   */
  const closeDrawer = () => {
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>Розрахуй і В'яжи</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={closeDrawer}
        >
          <Text style={styles.closeButtonText}>╳</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.version}>
        <Text style={styles.versionText}>Версія 1.0.2</Text>
      </View>

      <ScrollView style={styles.menuItems}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              state.routes[state.index].name === item.route && styles.activeMenuItem
            ]}
            onPress={() => navigateToScreen(item.route)}
          >
            <Text style={[
              styles.menuItemText,
              state.routes[state.index].name === item.route && styles.activeMenuItemText
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6741',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  version: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
  },
  menuItems: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 4,
  },
  activeMenuItem: {
    backgroundColor: '#F0F7EE',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333333',
  },
  activeMenuItemText: {
    color: '#4A6741',
    fontWeight: 'bold',
  },
});

export default SimpleDrawerContent;