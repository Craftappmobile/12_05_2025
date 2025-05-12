import { getCalculationsCollection } from '../db';

interface YarnCalculatorInput {
  width: number;
  height: number;
  gauge: number;
  yarnWeight: number;
  ballWeight: number;
}

interface YarnCalculatorResult {
  yarnNeeded: number;
  ballsNeeded: number;
}

export const calculateYarnNeeded = (input: YarnCalculatorInput): YarnCalculatorResult => {
  const { width, height, gauge, yarnWeight, ballWeight } = input;
  
  // Розрахунок площі в м²
  const area = (width * height) / 10000; // переводимо см² в м²
  
  // Розрахунок кількості пряжі в грамах
  const yarnNeeded = area * yarnWeight * gauge;
  
  // Розрахунок кількості мотків
  const ballsNeeded = Math.ceil(yarnNeeded / ballWeight);
  
  return { yarnNeeded, ballsNeeded };
};

export const saveCalculation = async (
  input: YarnCalculatorInput, 
  result: YarnCalculatorResult, 
  projectId?: string
) => {
  const calculationsCollection = getCalculationsCollection();
  
  try {
    const calculation = await calculationsCollection.create(record => {
      record.type = 'yarn';
      record.inputData = JSON.stringify(input);
      record.resultData = JSON.stringify(result);
      if (projectId) {
        record.projectId = projectId;
      }
      record.isFavorite = false;
    });
    
    return calculation;
  } catch (error) {
    console.error('Помилка при збереженні розрахунку:', error);
    throw error;
  }
};

export const getRecentCalculations = async (limit = 10) => {
  const calculationsCollection = getCalculationsCollection();
  
  try {
    return await calculationsCollection
      .query()
      .where('type', 'yarn')
      .sortBy('created_at', 'desc')
      .limit(limit)
      .fetch();
  } catch (error) {
    console.error('Помилка при отриманні останніх розрахунків:', error);
    return [];
  }
};

export const getFavoriteCalculations = async () => {
  const calculationsCollection = getCalculationsCollection();
  
  try {
    return await calculationsCollection
      .query()
      .where('is_favorite', true)
      .where('type', 'yarn')
      .sortBy('created_at', 'desc')
      .fetch();
  } catch (error) {
    console.error('Помилка при отриманні улюблених розрахунків:', error);
    return [];
  }
};

export const toggleFavorite = async (calculationId: string) => {
  const calculationsCollection = getCalculationsCollection();
  
  try {
    const calculation = await calculationsCollection.find(calculationId);
    await calculation.update(record => {
      record.isFavorite = !record.isFavorite;
    });
    return true;
  } catch (error) {
    console.error('Помилка при зміні статусу улюбленого:', error);
    return false;
  }
};