/**
 * Компонент для перехоплення помилок рендерингу в додатку
 * 
 * Цей компонент можна використовувати для обгортання інших компонентів,
 * щоб забезпечити коректну обробку помилок та запобігти краху всього додатку.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<{error: Error}>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Компонент для перехоплення помилок рендерингу
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Встановлюємо displayName для класу
  static displayName = 'ErrorBoundary';
  
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary перехопив помилку:', error);
    console.error('Стек помилки:', errorInfo.componentStack);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  
  resetError = () => {
    this.setState({
      hasError: false,
      error: null
    });
  }
  
  goBack = () => {
    // Використовуємо функцію навігації з глобального контексту, якщо вона доступна
    if (global.navigation && global.navigation.goBack) {
      global.navigation.goBack();
    }
  }
  
  render = Object.assign(
    function() {
      if (this.state.hasError) {
        if (this.props.fallbackComponent) {
          const FallbackComponent = this.props.fallbackComponent;
          return <FallbackComponent error={this.state.error as Error} />;
        }
        
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Помилка у компоненті</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'Виникла невідома помилка'}
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={this.goBack}
              >
                <ArrowLeft size={20} color="#2E3E28" />
                <Text style={styles.backButtonText}>Назад</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={this.resetError}
              >
                <Text style={styles.retryButtonText}>Спробувати знову</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }
      
      return this.props.children;
    }.bind(this),
    { displayName: 'ErrorBoundary.render' }
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 10
  },
  errorMessage: {
    fontSize: 14,
    color: '#2E3E28',
    textAlign: 'center',
    marginBottom: 20
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#E5EBE2',
    borderRadius: 8,
    marginRight: 10
  },
  backButtonText: {
    fontSize: 14,
    color: '#2E3E28',
    marginLeft: 5
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#6B8A5E',
    borderRadius: 8
  },
  retryButtonText: {
    fontSize: 14,
    color: '#FFFFFF'
  }
});

// Встановлюємо displayName для методів
ErrorBoundary.resetError = {
  displayName: 'ErrorBoundary.resetError'
};

ErrorBoundary.goBack = {
  displayName: 'ErrorBoundary.goBack'
};

export default ErrorBoundary;