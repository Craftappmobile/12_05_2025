import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Змінна для зберігання екземпляра Supabase
let supabaseInstance = null;

/**
 * Функція для відкладеної ініціалізації Supabase
 */
export function initSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  // Отримуємо URL та ключ Supabase з конфігурації Expo
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';
  
  // Виводимо попередження, якщо змінні не налаштовані
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase URL або ключ не налаштовані. Перевірте .env файл та app.config.js.'
    );
  }
  
  console.log('Ініціалізація Supabase...');
  
  // Створюємо клієнт Supabase
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, { 
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false 
    },
  });
  
  // Для відлагодження
  console.log('Supabase URL:', supabaseUrl ? 'Налаштовано' : 'Не налаштовано');
  console.log('Supabase Key:', supabaseAnonKey ? 'Налаштовано' : 'Не налаштовано');
  
  return supabaseInstance;
}

// Для зворотної сумісності з існуючим кодом
export const supabase = new Proxy({}, {
  get: function(target, prop) {
    const client = initSupabase();
    return client[prop];
  }
});

// Експортуємо функцію та проксі для зручного доступу
export default {
  get client() {
    return initSupabase();
  },
  initSupabase
};
