import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string; // Додатковий параметр для ідентифікації компонента
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Удосконалений компонент обробки помилок для React Native.
 * Розпізнає та обробляє специфічні помилки для компонентів без displayName.
 */
class EnhancedErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  componentDidMount() {
    // Спробуємо додати displayName до SafeAreaProvider
    try {
      const SafeAreaProviderModule = require('react-native-safe-area-context');
      if (SafeAreaProviderModule && SafeAreaProviderModule.SafeAreaProvider) {
        SafeAreaProviderModule.SafeAreaProvider.displayName = 'SafeAreaProvider';
      }
    } catch (e) {
      console.log('Не вдалося додати displayName до SafeAreaProvider');
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Перевіряємо, чи е це помилка з displayName
    if (error.message?.includes('displayName') && 
        error.message?.includes('undefined')) {
      console.warn('Перехоплено помилку displayName:', error.message);
      // Для помилок displayName краще показати запасний UI
      return { hasError: true, error, errorInfo: null };
    }
    
    // При помилках у навігації та компонентах
    if (error.message?.includes('maybeHijackSafeAreaProvider') || 
        error.message?.includes('react-native-css-interop')) {
      console.warn('Перехоплено помилку в CSS-interop:', error.message);
      return { hasError: true, error, errorInfo: null };
    }

    if (error.message?.includes('sanitizer') && 
        error.message?.includes('not a function')) {
      console.warn('Перехоплено помилку sanitizer:', error.message);
      return { hasError: true, error, errorInfo: null };
    }
    
    // Загальна обробка інших помилок
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Записуємо інформацію про помилку для відлагодження
    this.setState({ errorInfo });
    
    // Логуємо деталі помилки
    console.error(`Помилка в компоненті ${this.props.componentName || 'невідомий'}:`, error);
    console.log('Стек викликів:', errorInfo.componentStack);
    
    // Спеціальна обробка помилок SafeAreaProvider та displayName
    if (error.message?.includes('displayName') && 
        (errorInfo.componentStack?.includes('SafeAreaProvider') || 
         errorInfo.componentStack?.includes('maybeHijack'))) {
      console.warn('Перехоплено помилку SafeAreaProvider displayName. Встановлюємо вручну.');
      
      try {
        const SafeAreaProviderModule = require('react-native-safe-area-context');
        if (SafeAreaProviderModule && SafeAreaProviderModule.SafeAreaProvider) {
          SafeAreaProviderModule.SafeAreaProvider.displayName = 'SafeAreaProvider';
        }
      } catch (e) {
        console.log('Не вдалося встановити displayName під час обробки помилки');
      }
      
      this.setState({ hasError: false });
      return;
    }
    
    // Обробка специфічних помилок CSS-interop
    if (error.message?.includes('displayName') ||
        error.message?.includes('maybeHijackSafeAreaProvider') ||
        error.message?.includes('react-native-css-interop')) {
      
      console.warn('Перехоплено помилку в CSS-interop під час виконання. Намагаємось продовжити виконання.');
      this.setState({ hasError: false });
    }
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Показуємо запасний UI або переданий fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Щось пішло не так</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message || 'Невідома помилка'}
          </Text>
          {this.state.error?.message?.includes('sanitizer') && (
            <Text style={styles.hintText}>
              Помилка пов'язана з обробкою даних. Будь ласка, перевірте, чи всі дані введено коректно.
            </Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>Спробувати знову</Text>
          </TouchableOpacity>
        </View>
      );
    }

    try {
      // Захист від null або undefined children
      if (!this.props.children) {
        return null;
      }
      
      // Перевірка на displayName для компонентів, які можуть викликати помилки
      if (React.isValidElement(this.props.children) && 
          typeof this.props.children.type === 'function') {
          
        const ComponentType = this.props.children.type as any;
        
        // Додаємо displayName до компонентів, які не мають його
        if (!ComponentType.displayName && ComponentType.name) {
          ComponentType.displayName = ComponentType.name;
        } else if (!ComponentType.displayName && !ComponentType.name) {
          // Якщо немає ні імені, ні displayName
          ComponentType.displayName = this.props.componentName || 'Component';
        }
      }

      return this.props.children;
    } catch (error) {
      console.error('Помилка в render ErrorBoundary:', error);
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Помилка в рендері</Text>
          <Text style={styles.errorText}>{(error as Error)?.message || 'Невідома помилка'}</Text>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e53935',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  hintText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// Встановлюємо displayName для компонента, щоб уникнути проблем з CSS-interop
EnhancedErrorBoundary.displayName = "EnhancedErrorBoundary";

export default EnhancedErrorBoundary;