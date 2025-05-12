import { registerRootComponent } from 'expo';

// Встановлюємо флаг для скидання кешу WatermelonDB, якщо потрібно
if (process.env.WATERMELONDB_SHOULD_RESET_CACHE === 'true') {
  console.log('Встановлюємо флаг для скидання кешу WatermelonDB');
  global.__WATERMELONDB_SHOULD_RESET_CACHE__ = true;
}

// Повертаємось до основного додатку
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Резервна копія для тестування:
// import MinimalApp from './MinimalApp';
// registerRootComponent(MinimalApp);
