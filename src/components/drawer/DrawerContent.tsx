/**
 * @fileoverview Компонент для відображення вмісту бічного меню
 * 
 * Цей компонент відповідає за відображення та функціональність бічного меню,
 * включаючи кнопку закриття, навігаційні пункти з іконками та обробку подій
 * навігації та закриття меню.
 * 
 * @author Команда розробки "Розрахуй і В'яжи"
 * @created 2025-05-06
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { X, User, BookOpen, Users, Image, Settings, Calculator, FileText } from 'lucide-react-native';
import { OnlineIndicator } from '../ui';

/**
 * Компонент вмісту бічного меню
 * 
 * @param {object} props - Пропси компонента від react-navigation
 * @returns {React.ReactElement} Компонент вмісту бічного меню
 */
const DrawerContent: React.FC<any> = (props) => {
  const navigation = useNavigation();

  // Елементи меню з іконками та маршрутами
  const menuItems = [
    { icon: <Calculator size={24} color="#333" />, label: 'Калькулятори', route: 'Calculators' },
    { icon: <User size={24} color="#333" />, label: 'Профіль', route: 'Profile' },
    { icon: <BookOpen size={24} color="#333" />, label: 'Мої проєкти', route: 'Projects' },
    { icon: <Users size={24} color="#333" />, label: 'Спільнота', route: 'Community' },
    { icon: <FileText size={24} color="#333" />, label: 'Склад пряжі', route: 'YarnStorage' },
    { icon: <Image size={24} color="#333" />, label: 'Галерея', route: 'Gallery' },
    { icon: <Settings size={24} color="#333" />, label: 'Налаштування', route: 'Settings' }
  ];

  /**
   * Функція закриття меню
   */
  const closeDrawer = () => {
    console.log('Закриття бічного меню');
    if (navigation) {
      navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  /**
   * Функція навігації
   * 
   * @param {string} route - Ідентифікатор маршруту
   */
  const navigateTo = (route: string) => {
    console.log(`Навігація до ${route}`);
    if (navigation) {
      navigation.navigate(route as never);
      // Закриваємо меню після навігації
      closeDrawer();
    }
  };

  return (
    <View style={styles.container}>
      {/* Верхній блок з кнопкою закриття */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Розрахуй і в'яжи</Text>
          <View style={styles.onlineBlock}>
            <OnlineIndicator />
          </View>
        </View>
        <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
          <X size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Вміст меню з пунктами навігації */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigateTo(item.route)}
          >
            <View style={styles.iconContainer}>{item.icon}</View>
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </DrawerContentScrollView>

      {/* Футер меню */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Версія 1.0.0</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto_Bold',
  },
  onlineBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  drawerContent: {
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginRight: 16,
    width: 30,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Roboto',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'Roboto',
  },
});

export default DrawerContent;