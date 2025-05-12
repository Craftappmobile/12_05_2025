import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NetworkDebugProps {
  message?: string;
}

/**
 * Компонент для відлагодження мережевих з'єднань та рендерингу
 */
const NetworkDebug: React.FC<NetworkDebugProps> = ({ message = 'Debug component loaded' }) => {
  useEffect(() => {
    console.log('NetworkDebug component mounted');
    
    return () => {
      console.log('NetworkDebug component unmounted');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: '#f44336',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkDebug;