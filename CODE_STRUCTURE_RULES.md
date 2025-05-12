# Правила структурування коду в проєкті "Розрахуй і В'яжи"

## Їмпорти та експорти

1. **Розміщення імпортів**
   - Усі імпорти (`import`) мають бути на початку файлу перед будь-яким кодом
   - Заборонено розміщувати імпорти всередині функцій, умов чи блоків
   - Те саме стосується виразів `export` - вони мають бути на верхньому рівні

2. **Структура імпортів**
   - Рекомендований порядок: React/бібліотеки → навігація → компоненти → утиліти
   - Згрупуйте пов'язані імпорти разом
   - Використовуйте пусті рядки для розділення груп імпортів

## Оголошення компонентів

1. **Основні компоненти**
   - Компоненти мають бути оголошені після всіх імпортів
   - Кожен компонент має мати коментар з описом його призначення

2. **Навігатори**
   - Оголошення навігаторів має йти після імпортів, але перед оголошенням компонентів
   - Спочатку оголошуйте навігаційні стеки/дравери, потім компоненти навігаторів

## Коментування коду

1. **Коментарі до імпортів**
   - Коментарі можна розміщувати перед групою імпортів, але не між імпортами та кодом
   - Коментарі мають описувати призначення групи імпортів, а не кожен імпорт окремо

2. **Коментарі до компонентів**
   - Використовуйте JSDoc для опису пропсів та функціональності компонентів
   - Коментарі мають бути інформативними та актуальними

## Приклад правильної структури файлу

```typescript
// Основні імпорти React та допоміжних бібліотек
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Компоненти навігації
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Власні компоненти
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';

// Утиліти та сервіси
import { navigationRef } from './services/navigationService';
import NetworkDebug from './components/NetworkDebug';

// Створення навігаторів
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Компонент головного навігатора
const MainNavigator = () => (
  <Drawer.Navigator>
    <Drawer.Screen name="Home" component={HomeScreen} />
    <Drawer.Screen name="Profile" component={ProfileScreen} />
  </Drawer.Navigator>
);

// Головний компонент додатку
export default function App() {
  // ...код компонента
}
```

## Висновки

Дотримання цих правил допоможе запобігти помилкам синтаксису, таким як "`import` and `export` may only appear at the top level", і зробить код більш читабельним та легшим для підтримки.