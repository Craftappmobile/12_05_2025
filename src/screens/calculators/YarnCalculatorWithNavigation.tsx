/**
 * @fileoverview Компонент калькулятора витрат пряжі з підтримкою навігації
 */

import React from 'react';
import YarnCalculator from './YarnCalculator';
import { useProjects } from '../../hooks/useProjects';
import { Alert } from 'react-native';
import { projectsService } from '../../services/projectsService';
import { sanitizer } from '../../utils/sanitizers';

interface CalculationResult {
  yarnNeeded: number;
  ballsNeeded: number;
  width?: string;
  height?: string;
  gauge?: string;
  yarnWeight?: string;
  ballWeight?: string;
}

/**
 * Компонент калькулятора витрат пряжі з підтримкою навігації
 */
const YarnCalculatorWithNavigation: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => {
  const { addCalculationToProject } = useProjects();
  const projectId = route?.params?.projectId;
  const editMode = route?.params?.editMode;
  const calculationId = route?.params?.calculationId;
  const inputData = route?.params?.inputData;

  /**
   * Збереження результату до проєкту
   */
  const handleSaveToProject = async (result: CalculationResult) => {
    if (projectId) {
      try {
        if (editMode && calculationId) {
          // Оновлюємо існуючий розрахунок
          await projectsService.updateCalculation(calculationId, {
            inputData: sanitizer({
              width: result.width,
              height: result.height,
              gauge: result.gauge,
              yarnWeight: result.yarnWeight,
              ballWeight: result.ballWeight
            }),
            result: sanitizer({
              yarnNeeded: result.yarnNeeded,
              ballsNeeded: result.ballsNeeded,
            })
          });

          Alert.alert(
            'Успішно оновлено',
            'Розрахунок оновлено в проєкті',
            [
              { 
                text: 'OK', 
                onPress: () => navigation.navigate('ProjectDetails', { projectId }) 
              }
            ]
          );
        } else {
          // Додаємо новий розрахунок до проєкту
          await projectsService.addCalculationToProject(projectId, {
            type: 'YarnCalculator',
            title: 'Калькулятор витрат пряжі',
            inputData: sanitizer({
              width: result.width,
              height: result.height,
              gauge: result.gauge,
              yarnWeight: result.yarnWeight,
              ballWeight: result.ballWeight
            }),
            result: sanitizer({
              yarnNeeded: result.yarnNeeded,
              ballsNeeded: result.ballsNeeded,
            })
          });

          Alert.alert(
            'Успішно збережено',
            'Розрахунок збережено до проєкту',
            [
              { 
                text: 'OK', 
                onPress: () => navigation.navigate('ProjectDetails', { projectId }) 
              }
            ]
          );
        }
      } catch (error) {
        console.error('Помилка при збереженні розрахунку:', error);
        Alert.alert(
          'Помилка',
          'Не вдалося зберегти розрахунок. Спробуйте ще раз.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <YarnCalculator 
      onSaveResult={handleSaveToProject} 
      route={route} 
    />
  );
};

export default YarnCalculatorWithNavigation;