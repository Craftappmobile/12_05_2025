import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

// Дозволяємо анімацію для Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  initiallyExpanded?: boolean;
  rightElement?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ 
  title, 
  children, 
  initiallyExpanded = false,
  rightElement
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          {rightElement}
          {expanded ? (
            <ChevronUp size={24} color="#333" />
          ) : (
            <ChevronDown size={24} color="#333" />
          )}
        </View>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    backgroundColor: '#fff'
  },
});

export default Accordion;