import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { Input, Button } from '../../components/ui';

const SignInScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signIn, setGuestUser } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Введіть електронну пошту';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Введіть коректну електронну пошту';
    }
    
    if (!password) {
      newErrors.password = 'Введіть пароль';
    } else if (password.length < 6) {
      newErrors.password = 'Пароль має містити щонайменше 6 символів';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      // Навігація відбудеться автоматично через AuthProvider
    } catch (error) {
      Alert.alert(
        'Помилка входу',
        error.message || 'Не вдалося увійти. Перевірте ваші дані та спробуйте знову.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Вхід</Text>
        <Text style={styles.subtitle}>Увійдіть, щоб продовжити</Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Електронна пошта"
          value={email}
          onChangeText={setEmail}
          placeholder="your.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <Input
          label="Пароль"
          value={password}
          onChangeText={setPassword}
          placeholder="Ваш пароль"
          secureTextEntry
          error={errors.password}
        />
        
        <Button
          title="Увійти"
          onPress={handleSignIn}
          loading={loading}
          style={styles.button}
        />
        
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.linkText}>
            Немає облікового запису? Зареєструватися
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text style={styles.linkText}>
            Забули пароль?
          </Text>
        </TouchableOpacity>
        
        <Button
          title="Увійти як гість"
          onPress={() => {
            // Тимчасовий обхід авторизації для розробки
            // Використовуємо функцію setGuestUser з контексту авторизації
            setGuestUser();
          }}
          variant="outline"
          style={styles.guestButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5' },
  header: { marginBottom: 32,
    marginTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Roboto_Bold', // Додаємо шрифт
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto', // Додаємо шрифт
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  button: { marginTop: 16 },
  linkContainer: { marginTop: 16,
    alignItems: 'center' },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
    fontFamily: 'Roboto', // Додаємо шрифт
  },
  guestButton: { marginTop: 24 },
});

export default SignInScreen;
