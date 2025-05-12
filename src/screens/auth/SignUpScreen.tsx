import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import { Input, Button } from '../../components/ui';

const SignUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { signUp } = useAuth();

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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Підтвердіть пароль';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await signUp(email, password);
      Alert.alert(
        'Реєстрація успішна',
        'Перевірте вашу електронну пошту для підтвердження облікового запису.'
      );
      // Навігація відбудеться автоматично через AuthProvider
    } catch (error) {
      Alert.alert(
        'Помилка реєстрації',
        error.message || 'Не вдалося зареєструватися. Спробуйте знову.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Реєстрація</Text>
        <Text style={styles.subtitle}>Створіть новий обліковий запис</Text>
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
          placeholder="Створіть пароль"
          secureTextEntry
          error={errors.password}
        />
        
        <Input
          label="Підтвердження паролю"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Повторіть пароль"
          secureTextEntry
          error={errors.confirmPassword}
        />
        
        <Button
          title="Зареєструватися"
          onPress={handleSignUp}
          loading={loading}
          style={styles.button}
        />
        
        <TouchableOpacity 
          style={styles.linkContainer}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.linkText}>
            Вже маєте обліковий запис? Увійти
          </Text>
        </TouchableOpacity>
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
  title: { fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8 },
  subtitle: { fontSize: 16,
    color: '#666' },
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
  linkText: { color: '#007AFF',
    fontSize: 14 },
});

export default SignUpScreen;
