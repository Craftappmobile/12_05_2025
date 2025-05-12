import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AdaptationData {
  patternGauge: {
    stitches: string;
    rows: string;
    width: string;
    height: string;
  };
  yourGauge: {
    stitches: string;
    rows: string;
    width: string;
    height: string;
  };
  patternSize: {
    width: string;
    height: string;
    armhole: string;
    shoulderWidth: string;
    neckWidth: string;
    neckDepth: string;
  };
  yourSize: {
    width: string;
    height: string;
    armhole: string;
    shoulderWidth: string;
    neckWidth: string;
    neckDepth: string;
  };
}

const AdaptationCalculator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [data, setData] = useState<AdaptationData>({
    patternGauge: {
      stitches: '',
      rows: '',
      width: '',
      height: '',
    },
    yourGauge: {
      stitches: '',
      rows: '',
      width: '',
      height: '',
    },
    patternSize: {
      width: '',
      height: '',
      armhole: '',
      shoulderWidth: '',
      neckWidth: '',
      neckDepth: '',
    },
    yourSize: {
      width: '',
      height: '',
      armhole: '',
      shoulderWidth: '',
      neckWidth: '',
      neckDepth: '',
    },
  });

  const [results, setResults] = useState<{
    width: string;
    height: string;
    armhole: string;
    shoulderWidth: string;
    neckWidth: string;
    neckDepth: string;
  } | null>(null);

  const calculateAdaptation = () => {
    const patternStitchesPerCm = parseFloat(data.patternGauge.stitches) / parseFloat(data.patternGauge.width);
    const patternRowsPerCm = parseFloat(data.patternGauge.rows) / parseFloat(data.patternGauge.height);
    
    const yourStitchesPerCm = parseFloat(data.yourGauge.stitches) / parseFloat(data.yourGauge.width);
    const yourRowsPerCm = parseFloat(data.yourGauge.rows) / parseFloat(data.yourGauge.height);
    
    // Determine scale factors
    const widthScaleFactor = yourStitchesPerCm / patternStitchesPerCm;
    const heightScaleFactor = yourRowsPerCm / patternRowsPerCm;
    
    // Calculate new dimensions
    const adaptedWidth = (
      parseFloat(data.yourSize.width) !== 0 ? data.yourSize.width : 
      (parseFloat(data.patternSize.width) / widthScaleFactor).toFixed(1)
    );
    
    const adaptedHeight = (
      parseFloat(data.yourSize.height) !== 0 ? data.yourSize.height :
      (parseFloat(data.patternSize.height) / heightScaleFactor).toFixed(1)
    );
    
    const adaptedArmhole = (
      parseFloat(data.yourSize.armhole) !== 0 ? data.yourSize.armhole :
      (parseFloat(data.patternSize.armhole) / heightScaleFactor).toFixed(1)
    );
    
    const adaptedShoulderWidth = (
      parseFloat(data.yourSize.shoulderWidth) !== 0 ? data.yourSize.shoulderWidth :
      (parseFloat(data.patternSize.shoulderWidth) / widthScaleFactor).toFixed(1)
    );
    
    const adaptedNeckWidth = (
      parseFloat(data.yourSize.neckWidth) !== 0 ? data.yourSize.neckWidth :
      (parseFloat(data.patternSize.neckWidth) / widthScaleFactor).toFixed(1)
    );
    
    const adaptedNeckDepth = (
      parseFloat(data.yourSize.neckDepth) !== 0 ? data.yourSize.neckDepth :
      (parseFloat(data.patternSize.neckDepth) / heightScaleFactor).toFixed(1)
    );
    
    setResults({
      width: typeof adaptedWidth === 'string' ? adaptedWidth : adaptedWidth.toString(),
      height: typeof adaptedHeight === 'string' ? adaptedHeight : adaptedHeight.toString(),
      armhole: typeof adaptedArmhole === 'string' ? adaptedArmhole : adaptedArmhole.toString(),
      shoulderWidth: typeof adaptedShoulderWidth === 'string' ? adaptedShoulderWidth : adaptedShoulderWidth.toString(),
      neckWidth: typeof adaptedNeckWidth === 'string' ? adaptedNeckWidth : adaptedNeckWidth.toString(),
      neckDepth: typeof adaptedNeckDepth === 'string' ? adaptedNeckDepth : adaptedNeckDepth.toString(),
    });
  };

  const updateValue = (section: keyof AdaptationData, field: string, value: string) => {
    setData({
      ...data,
      [section]: {
        ...data[section],
        [field]: value,
      },
    });
  };

  const renderInputGroup = (title: string, section: keyof AdaptationData, fields: { label: string; field: string }[]) => (
    <View style={styles.inputGroup}>
      <Text style={styles.groupTitle}>{title}</Text>
      {fields.map((item) => (
        <View key={item.field} style={styles.inputRow}>
          <Text style={styles.inputLabel}>{item.label}:</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={data[section][item.field as keyof typeof data[typeof section]]}
            onChangeText={(value) => updateValue(section, item.field, value)}
          />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Адаптація майстер-класу</Text>
        <Text style={styles.description}>
          Цей калькулятор допоможе адаптувати розміри із майстер-класу під вашу щільність в'язання та бажані розміри.
        </Text>

        {renderInputGroup("Щільність в'язання з МК", 'patternGauge', [
          { label: 'К-сть петель', field: 'stitches' },
          { label: 'К-сть рядів', field: 'rows' },
          { label: 'Ширина зразка (см)', field: 'width' },
          { label: 'Висота зразка (см)', field: 'height' },
        ])}

        {renderInputGroup("Ваша щільність в'язання", 'yourGauge', [
          { label: 'К-сть петель', field: 'stitches' },
          { label: 'К-сть рядів', field: 'rows' },
          { label: 'Ширина зразка (см)', field: 'width' },
          { label: 'Висота зразка (см)', field: 'height' },
        ])}

        {renderInputGroup('Розміри з МК (см)', 'patternSize', [
          { label: 'Ширина', field: 'width' },
          { label: 'Висота', field: 'height' },
          { label: 'Глибина пройми', field: 'armhole' },
          { label: 'Ширина плеча', field: 'shoulderWidth' },
          { label: 'Ширина горловини', field: 'neckWidth' },
          { label: 'Глибина горловини', field: 'neckDepth' },
        ])}

        {renderInputGroup('Ваші бажані розміри (см)', 'yourSize', [
          { label: 'Ширина', field: 'width' },
          { label: 'Висота', field: 'height' },
          { label: 'Глибина пройми', field: 'armhole' },
          { label: 'Ширина плеча', field: 'shoulderWidth' },
          { label: 'Ширина горловини', field: 'neckWidth' },
          { label: 'Глибина горловини', field: 'neckDepth' },
        ])}

        <TouchableOpacity style={styles.calculateButton} onPress={calculateAdaptation}>
          <Text style={styles.calculateButtonText}>Розрахувати</Text>
        </TouchableOpacity>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Результати адаптації:</Text>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Ширина:</Text>
              <Text style={styles.resultValue}>{results.width} см</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Висота:</Text>
              <Text style={styles.resultValue}>{results.height} см</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Глибина пройми:</Text>
              <Text style={styles.resultValue}>{results.armhole} см</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Ширина плеча:</Text>
              <Text style={styles.resultValue}>{results.shoulderWidth} см</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Ширина горловини:</Text>
              <Text style={styles.resultValue}>{results.neckWidth} см</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Глибина горловини:</Text>
              <Text style={styles.resultValue}>{results.neckDepth} см</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    color: '#6c757d',
  },
  inputGroup: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#343a40',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    flex: 2,
    fontSize: 16,
    color: '#495057',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  calculateButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 4,
    marginVertical: 16,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: '#e9f7ef',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2e7d32',
  },
  resultItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  resultLabel: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
  },
  resultValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
});

export default AdaptationCalculator;