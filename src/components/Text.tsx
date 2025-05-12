/**
 * Компонент Text для уникнення бутлегу при імпорті компонентів
 */

import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

const Text: React.FC<TextProps> = ({ 
  children, 
  style, 
  ...props 
}) => {
  return (
    <RNText style={[styles.default, style]} {...props}>
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
});

export default Text;