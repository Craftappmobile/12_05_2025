// Конфігурація додатку
export const appConfig = { // Режим роботи додатку (онлайн/офлайн)
  offlineMode: process.env.EXPO_PUBLIC_OFFLINE_MODE === 'true',
  
  // Налаштування Supabase
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL,
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY },
  
  // Налаштування синхронізації
  sync: { // Інтервал автоматичної синхронізації (у хвилинах)
    interval: 15,
    // Максимальна кількість спроб синхронізації
    maxRetries: 3 },
};

export default appConfig;