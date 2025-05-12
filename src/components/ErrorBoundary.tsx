import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Оновлюємо стан, щоб при наступному рендері показати запасний UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Логуємо помилку в консоль
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
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
      
      // Перевірка специфічних проблемних випадків
      // Додаємо displayName до компонентів, які можуть викликати помилки
      if (React.isValidElement(this.props.children) && 
          typeof this.props.children.type === 'function' && 
          !(this.props.children.type as any).displayName) {
        console.warn('Компонент без displayName може викликати проблеми з SafeAreaProvider');
      }

      // Обгортаємо рендер в try-catch для додаткової безпеки
      return this.props.children;
    } catch (error) {
      console.error('Error in render:', error);
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

export default ErrorBoundary;