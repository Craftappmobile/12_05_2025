# Виправлення навігаційної структури в "Розрахуй і В'яжи"

## Виявлені проблеми

1. **Не працює відкриття бічного меню (menu button)** - при натисканні на кнопку ≡ drawer не відкривається.

2. **Не працює перехід до "Обране"** - при натисканні на кнопку ★ не відбувається перехід до екрану Обране.

3. **Неправильна структура навігаційних посилань** - в коді використано некоректні шляхи навігації.

4. **Проблема з navigationRef** - не правильно працює централізований сервіс навігації.

## Внесені зміни

### 1. Покращеной MainNavigator з ID

```javascript
const MainNavigator = () => {
  console.log('Створення MainNavigator');
  
  return (
    <Drawer.Navigator
      id="RootDrawer" // Додано ID для легшого доступу
      screenOptions={{
        // ... опції
      }}
      // ... інші параметри
    >
      {/* ... екрани */}
    </Drawer.Navigator>
  );
};
```

### 2. Покращений обробник кнопки меню

```javascript
onPress={() => {
  console.log('Кнопка меню натиснута');
  
  // Використовуємо прямий доступ до батьківського навігатора з чітким ID
  const rootDrawer = navigation.getParent('RootDrawer');
  if (rootDrawer) {
    console.log('Знайдено drawer з ID RootDrawer');
    // @ts-ignore
    if (rootDrawer.openDrawer) {
      rootDrawer.openDrawer();
      return;
    }
  }
  
  // Інші методи відкриття drawer...
}}
```

### 3. Оптимізований обробник кнопки Обране

```javascript
onPress={() => {
  console.log("Спроба переходу до Фаворитів");
  try {
    // Використовуємо чіткий шлях навігації з явним вказанням стеку
    navigation.navigate('Calculators', { 
      screen: 'Favorites' 
    });
  } catch (error) {
    console.error("Помилка при навігації до Фаворитів:", error);
    // Альтернативний метод
    navigationService.navigate('Favorites');
  }
}}
```

### 4. Покращений navigationService

```javascript
export const navigationService = {
  // Відкрити бічне меню - покращена версія
  openDrawer: () => {
    console.log('navigationService.openDrawer викликано');
    const current = navigationRef.current;
    
    if (!current) {
      console.warn('Навігаційний реф недоступний');
      return false;
    }
    
    // Детальне логування про стан навігації
    console.log('Доступні методи navigationRef:', Object.keys(current).join(', '));
    
    try {
      // Спроба 1: Пошук drawer-навігатора за ID та прямий виклик
      const rootState = current.getRootState();
      if (rootState && rootState.routes) {
        console.log('Структура маршрутів:', rootState.routes.map(r => r.name).join(', '));
      }
      
      // Спроба 2: Використання DrawerActions
      current.dispatch(DrawerActions.openDrawer());
      return true;
    } catch (e) {
      // Альтернативні методи...
    }
  },
  
  // Інші методи...
};
```

## Найкращі практики React Navigation

1. **Використовуйте ідентифікатори для навігаторів**:
   ```javascript
   <Drawer.Navigator id="RootDrawer">
   ```

2. **Використовуйте вкладені навігаційні шляхи**:
   ```javascript
   navigation.navigate('Calculators', { screen: 'Favorites' });
   ```

3. **Використовуйте хук useNavigation() замість props**:
   ```javascript
   const navigation = useNavigation();
   ```

4. **Використовуйте DrawerActions для відкриття drawer**:
   ```javascript
   navigation.dispatch(DrawerActions.openDrawer());
   ```

5. **Прямий доступ до drawer-навігатора за ID**:
   ```javascript
   const drawer = navigation.getParent('RootDrawer');
   if (drawer) drawer.openDrawer();
   ```

## Додаткові рекомендації

1. **Оптимальна структура React Navigation**:
   ```javascript
   <NavigationContainer>
     <Drawer.Navigator id="RootDrawer">
       <Drawer.Screen name="MainStack" component={MainStackNavigator} />
     </Drawer.Navigator>
   </NavigationContainer>
   ```

2. **Використання типізації для navigation**:
   ```typescript
   import { DrawerNavigationProp } from '@react-navigation/drawer';
   type NavigationProps = DrawerNavigationProp<ParamListBase>;
   const navigation = useNavigation<NavigationProps>();
   ```

3. **Створення тестового компоненту для навігації**:
   ```typescript
   const NavigationDebug = () => {
     const navigation = useNavigation();
     console.log('Navigation methods:', Object.keys(navigation));
     return null;
   };
   ```