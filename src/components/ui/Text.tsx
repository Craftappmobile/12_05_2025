import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'body' | 'caption';
}

const Text: React.FC<CustomTextProps> = ({ 
  children, 
  style, 
  variant = 'default', 
  ...props 
}) => {
  const getTextStyle = () => {
    const textStyles = [styles.default];
    
    if (variant === 'title') {
      textStyles.push(styles.title);
    } else if (variant === 'subtitle') {
      textStyles.push(styles.subtitle);
    } else if (variant === 'body') {
      textStyles.push(styles.body);
    } else if (variant === 'caption') {
      textStyles.push(styles.caption);
    }
    
    if (style) {
      if (Array.isArray(style)) {
        textStyles.push(...style);
      } else {
        textStyles.push(style);
      }
    }
    
    return textStyles;
  };
  
  return (
    <RNText style={getTextStyle()} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  default: {
    color: '#2E3E28',
    fontSize: 14,
    fontFamily: 'System',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: '#6B8A5E',
  },
});

export default Text;