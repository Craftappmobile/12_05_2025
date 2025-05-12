import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Linking } from 'react-native';
import { Text } from './ui';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  purpose: string;
  steps: { step: string; description: string }[];
  tips?: string[];
  videoUrl?: string;
}

export function HelpModal({ 
  open, 
  onOpenChange, 
  title, 
  purpose, 
  steps, 
  tips, 
  videoUrl 
}: HelpModalProps) {
  const [tipsExpanded, setTipsExpanded] = useState(false);

  const handleOpenVideo = () => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch((err) => 
        console.error('Помилка при відкритті відео:', err)
      );
    }
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="slide"
      onRequestClose={() => onOpenChange(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Допомога: {title}</Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => onOpenChange(false)}
            >
              <X size={20} color="#4A6741" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.emoji}>📋</Text>
                <Text style={styles.sectionTitle}>Призначення:</Text>
              </View>
              <Text style={styles.purposeText}>{purpose}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.emoji}>🔢</Text>
                <Text style={styles.sectionTitle}>Як користуватися:</Text>
              </View>
              <View style={styles.stepsList}>
                {steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>[{index + 1}]</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                ))}
              </View>
            </View>

            {tips && tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <TouchableOpacity 
                  style={styles.tipsHeader}
                  onPress={() => setTipsExpanded(!tipsExpanded)}
                >
                  <View style={styles.tipsHeaderLeft}>
                    <Text style={styles.emoji}>💡</Text>
                    <Text style={styles.sectionTitle}>Підказки</Text>
                  </View>
                  {tipsExpanded ? (
                    <ChevronUp size={20} color="#4A6741" />
                  ) : (
                    <ChevronDown size={20} color="#4A6741" />
                  )}
                </TouchableOpacity>
                
                {tipsExpanded && (
                  <View style={styles.tipsList}>
                    {tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Text style={styles.tipBullet}>•</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {videoUrl && (
              <TouchableOpacity 
                style={styles.videoButton}
                onPress={handleOpenVideo}
              >
                <Text style={styles.videoButtonText}>
                  Подивитись відео-інструкцію
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F4EF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EBE2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E3E28',
  },
  purposeText: {
    marginLeft: 30,
    color: '#4A6741',
    fontSize: 14,
    lineHeight: 20,
  },
  stepsList: {
    marginLeft: 30,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNumber: {
    fontWeight: 'bold',
    marginRight: 6,
    color: '#4A6741',
  },
  stepDescription: {
    flex: 1,
    color: '#4A6741',
    fontSize: 14,
    lineHeight: 20,
  },
  tipsContainer: {
    borderWidth: 1,
    borderColor: '#E5EBE2',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7FAF5',
  },
  tipsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipsList: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#E5EBE2',
  },
  tipItem: {
    flexDirection: 'row',
    marginLeft: 30,
    marginBottom: 6,
  },
  tipBullet: {
    marginRight: 8,
    color: '#4A6741',
  },
  tipText: {
    flex: 1,
    color: '#4A6741',
    fontSize: 14,
    lineHeight: 20,
  },
  videoButton: {
    backgroundColor: '#6B8A5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  videoButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});