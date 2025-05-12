import { supabase } from './supabaseClient';

/**
 * Вхід користувача
 * @param email Електронна пошта
 * @param password Пароль
 * @returns Об'єкт з даними користувача та сесії
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email,
    password });

  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user,
    session: data.session };
};

/**
 * Реєстрація нового користувача
 * @param email Електронна пошта
 * @param password Пароль
 * @returns Об'єкт з даними користувача та сесії
 */
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email,
    password });

  if (error) {
    throw new Error(error.message);
  }

  return { user: data.user,
    session: data.session };
};

/**
 * Вихід користувача
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
};

/**
 * Відновлення паролю
 * @param email Електронна пошта
 */
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'calculate-and-knit://reset-password' });

  if (error) {
    throw new Error(error.message);
  }
};