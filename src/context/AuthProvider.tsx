import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../services/auth/supabaseClient';
import { User } from '@supabase/supabase-js';
import * as authService from '../services/auth/authService';

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setGuestUser: () => void; // Додаємо функцію для гостьового входу
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  setGuestUser: () => {}, // Додаємо функцію для гостьового входу
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Отримуємо поточну сесію при завантаженні
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Помилка при отриманні сесії:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Підписуємося на зміни стану аутентифікації
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    // Відписуємося при розмонтуванні
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Функція для входу
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user, session } = await authService.signIn(email, password);
      setUser(user);
      setSession(session);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Функція для реєстрації
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { user, session } = await authService.signUp(email, password);
      setUser(user);
      setSession(session);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Функція для виходу
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Функція для відновлення паролю
  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      await authService.resetPassword(email);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Показуємо індикатор завантаження, якщо перевіряємо стан аутентифікації
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Завантаження...</Text>
      </View>
    );
  }

  // Функція для встановлення гостьового користувача
  const setGuestUser = () => {
    // Створюємо фіктивного користувача для гостьового режиму
    const guestUser = {
      id: 'guest',
      email: 'guest@example.com',
      app_metadata: {},
      user_metadata: { name: 'Гість' },
      aud: 'guest',
      created_at: new Date().toISOString(),
    } as User;
    
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={ {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        setGuestUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({ loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 16,
    fontSize: 16,
    color: '#333' },
});

export default AuthProvider;
