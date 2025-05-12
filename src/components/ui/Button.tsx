import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...rest
}) => {
  const getButtonStyle = () => {
    let buttonStyle = [styles.button];
    
    // Варіант кнопки
    if (variant === 'primary') {
      buttonStyle.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      buttonStyle.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      buttonStyle.push(styles.outlineButton);
    }
    
    // Розмір кнопки
    if (size === 'small') {
      buttonStyle.push(styles.smallButton);
    } else if (size === 'large') {
      buttonStyle.push(styles.largeButton);
    }
    
    // Стан кнопки
    if (disabled) {
      buttonStyle.push(styles.disabledButton);
    }
    
    // Користувацький стиль
    if (style) {
      buttonStyle.push(style);
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyleArray = [styles.buttonText];
    
    if (variant === 'primary') {
      textStyleArray.push(styles.primaryButtonText);
    } else if (variant === 'secondary') {
      textStyleArray.push(styles.secondaryButtonText);
    } else if (variant === 'outline') {
      textStyleArray.push(styles.outlineButtonText);
    }
    
    if (size === 'small') {
      textStyleArray.push(styles.smallButtonText);
    } else if (size === 'large') {
      textStyleArray.push(styles.largeButtonText);
    }
    
    if (disabled) {
      textStyleArray.push(styles.disabledButtonText);
    }
    
    if (textStyle) {
      textStyleArray.push(textStyle);
    }
    
    return textStyleArray;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? '#007AFF' : '#fff'} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({ button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row' },
  primaryButton: { backgroundColor: '#007AFF' },
  secondaryButton: { backgroundColor: '#6c757d' },
  outlineButton: { backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF' },
  smallButton: { paddingVertical: 8,
    paddingHorizontal: 12 },
  largeButton: { paddingVertical: 16,
    paddingHorizontal: 24 },
  disabledButton: { backgroundColor: '#e9ecef',
    borderColor: '#e9ecef' },
  buttonText: { fontWeight: '600',
    textAlign: 'center' },
  primaryButtonText: { color: '#fff' },
  secondaryButtonText: { color: '#fff' },
  outlineButtonText: { color: '#007AFF' },
  smallButtonText: { fontSize: 14 },
  largeButtonText: { fontSize: 18 },
  disabledButtonText: { color: '#adb5bd' },
});

export default Button;