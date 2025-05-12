import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Tab {
  key: string;
  title: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  initialTab?: string;
  scrollable?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  initialTab, 
  scrollable = false 
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key);

  const TabsHeader = () => (
    <View style={styles.tabsHeader}>
      {scrollable ? (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollableTabs}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text 
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.fixedTabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                { flex: 1 },
                activeTab === tab.key && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text 
                style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const activeContent = tabs.find(tab => tab.key === activeTab)?.content;

  return (
    <View style={styles.container}>
      <TabsHeader />
      <View style={styles.tabContent}>
        {activeContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ container: {
    flex: 1 },
  tabsHeader: { backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd' },
  scrollableTabs: { paddingHorizontal: 8 },
  fixedTabs: { flexDirection: 'row' },
  tabButton: { paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center' },
  activeTabButton: { borderBottomWidth: 2,
    borderBottomColor: '#007AFF' },
  tabButtonText: { fontSize: 14,
    color: '#666' },
  activeTabButtonText: { color: '#007AFF',
    fontWeight: '600' },
  tabContent: { flex: 1 },
});

export default Tabs;