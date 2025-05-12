import React from 'react';
import { CalculatorTemplate } from '../../../components/CalculatorTemplate';

const VNeckDecreaseCalculator: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => { // Визначення полів для калькулятора V-подібної горловини
  const fields = [
    {
      id: 'neckWidth',
      label: 'Ширина горловини',
      type: 'number' as const,
      placeholder: 'Наприклад: 20',
      unit: 'см' },
    { id: 'neckDepth',
      label: 'Глибина горловини',
      type: 'number' as const,
      placeholder: 'Наприклад: 15',
      unit: 'см' },
    { id: 'gauge',
      label: 'Щільність в\'язання',
      type: 'number' as const,
      placeholder: 'Наприклад: 20',
      unit: 'петель на 10 см' },
    { id: 'rowGauge',
      label: 'Щільність в\'язання по висоті',
      type: 'number' as const,
      placeholder: 'Наприклад: 28',
      unit: 'рядів на 10 см' },
    {
      id: 'decreaseFrequency',
      label: 'Частота убавок',
      type: 'select' as const,
      options: [
        { value: 'every-row', label: 'Кожен ряд' },
        { value: 'every-2-rows', label: 'Кожні 2 ряди' },
        { value: 'every-4-rows', label: 'Кожні 4 ряди' },
        { value: 'every-6-rows', label: 'Кожні 6 рядів' },
      ],
    },
  ];

  // Функція розрахунку
  const calculate = (values: Record<string, any>) => {
    const neckWidth = Number(values.neckWidth);
    const neckDepth = Number(values.neckDepth);
    const gauge = Number(values.gauge);
    const rowGauge = Number(values.rowGauge);
    const decreaseFrequency = values.decreaseFrequency;

    // Розрахунок кількості петель для убавки
    const stitchesToDecrease = Math.round((neckWidth * gauge) / 10);
    
    // Розрахунок кількості рядів для убавки
    const rowsToDecrease = Math.round((neckDepth * rowGauge) / 10);
    
    // Розрахунок кількості убавок залежно від частоти
    let decreaseEveryNRows = 1;
    switch (decreaseFrequency) {
      case 'every-row':
        decreaseEveryNRows = 1;
        break;
      case 'every-2-rows':
        decreaseEveryNRows = 2;
        break;
      case 'every-4-rows':
        decreaseEveryNRows = 4;
        break;
      case 'every-6-rows':
        decreaseEveryNRows = 6;
        break;
      default:
        decreaseEveryNRows = 2;
    }
    
    // Кількість убавок
    const numberOfDecreases = Math.floor(rowsToDecrease / decreaseEveryNRows);
    
    // Кількість петель на одну убавку
    const stitchesPerDecrease = Math.ceil(stitchesToDecrease / numberOfDecreases);
    
    // Залишок петель, які потрібно убавити в останньому ряду
    const remainingStitches = stitchesToDecrease - (numberOfDecreases * stitchesPerDecrease);

    return { 'Загальна кількість петель для убавки': stitchesToDecrease,
      'Кількість рядів для убавки': rowsToDecrease,
      'Кількість убавок': numberOfDecreases,
      'Петель на одну убавку': stitchesPerDecrease,
      'Залишок петель': remainingStitches > 0 ? remainingStitches : 0 };
  };

  // Інформація для модального вікна допомоги
  const helpInfo = {
    purpose: 'Цей калькулятор допомагає розрахувати кількість і частоту убавок для формування V-подібної горловини.',
    steps: [
      { 
        step: '1', 
        description: 'Виміряйте або визначте бажану ширину горловини в найширшій частині.' 
      },
      { 
        step: '2', 
        description: 'Виміряйте або визначте бажану глибину горловини від верхньої точки до нижньої точки V.' 
      },
      { 
        step: '3', 
        description: 'Визначте щільність в\'язання по горизонталі (петлі) та вертикалі (ряди).' 
      },
      { 
        step: '4', 
        description: 'Виберіть бажану частоту убавок (кожен ряд, кожні 2 ряди тощо).' 
      },
      { 
        step: '5', 
        description: 'Натисніть "Розрахувати" для отримання результатів.' 
      },
    ],
    tips: [
      'Для більш плавної лінії горловини рекомендується робити убавки кожні 2 ряди.',
      'Якщо ви в\'яжете лицьовою гладдю, убавки краще робити в лицьових рядах.',
      'Для симетричної V-горловини убавки потрібно робити з обох сторін від центральної петлі.',
      'Для більш глибокої V-горловини збільшіть значення глибини горловини.',
    ],
  };

  return (
    <CalculatorTemplate
      title="Калькулятор V-горловини"
      description="Розрахунок убавок для V-подібної горловини"
      fields={fields}
      calculate={calculate}
      helpInfo={helpInfo}
      route={route}
      navigation={navigation}
    />
  );
};

export default VNeckDecreaseCalculator;
