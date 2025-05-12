import React, { createContext, useState, useContext, ReactNode } from 'react';

// Типи для контексту автентифікації
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

// Створюємо контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер для контексту
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Провайдер автентифікації
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Функція для входу в систему
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Симулюємо затримку на сервері
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Для тестування приймаємо будь-які облікові дані
    if (email.trim() !== '' && password.trim() !== '') {
      setUser({
        id: '1',
        email,
        name: 'Тестовий користувач',
      });
      setIsAuthenticated(true);
      setIsLoading(false);
      console.log('Успішний вхід', email);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  /**
   * Функція для виходу з системи
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    // Симулюємо затримку на сервері
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    console.log('Успішний вихід');
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Хук для використання контексту автентифікації
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('Хук useAuth має використовуватись всередині AuthProvider');
  }
  return context;
};