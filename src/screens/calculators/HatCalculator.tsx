import React from 'react';
import { CalculatorTemplate } from '../../../components/CalculatorTemplate';

const HatCalculator: React.FC<{ route: any, navigation: any }> = ({ route, navigation }) => { // Визначення полів для калькулятора шапки
  const fields = [
    {
      id: 'headCircumference',
      label: 'Обхват голови',
      type: 'number' as const,
      placeholder: 'Наприклад: 56',
      unit: 'см' },
    { id: 'gauge',
      label: 'Щільність в\'язання',
      type: 'number' as const,
      placeholder: 'Наприклад: 20',
      unit: 'петель на 10 см' },
    {
      id: 'style',
      label: 'Стиль шапки',
      type: 'select' as const,
      options: [
        { value: 'beanie', label: 'Біні (облягаюча)' },
        { value: 'slouchy', label: 'Вільна (оверсайз)' },
        { value: 'earflap', label: 'З вушками' },
      ],
    },
  ];

  // Функція розрахунку
  const calculate = (values: Record<string, any>) => {
    const headCircumference = Number(values.headCircumference);
    const gauge = Number(values.gauge);
    const style = values.style;

    // Коефіцієнт для різних стилів шапок
    let styleCoefficient = 1;
    switch (style) {
      case 'beanie':
        styleCoefficient = 0.9; // Облягаюча шапка трохи менша за обхват голови
        break;
      case 'slouchy':
        styleCoefficient = 1.1; // Вільна шапка трохи більша
        break;
      case 'earflap':
        styleCoefficient = 1; // Шапка з вушками за розміром голови
        break;
      default:
        styleCoefficient = 1;
    }

    // Розрахунок кількості петель для набору
    const stitchesToCast = Math.round((headCircumference * styleCoefficient * gauge) / 10);
    
    // Розрахунок висоти шапки (приблизно)
    const hatHeight = Math.round(headCircumference * 0.33 * styleCoefficient);
    
    // Розрахунок кількості рядів (приблизно)
    const rowsToKnit = Math.round(hatHeight * 1.4);

    return {
      'Кількість петель для набору': stitchesToCast,
      'Висота шапки': `${hatHeight} см`,
      'Приблизна кількість рядів': rowsToKnit,
    };
  };

  // Інформація для модального вікна допомоги
  const helpInfo = {
    purpose: 'Цей калькулятор допомагає розрахувати кількість петель для набору та висоту шапки на основі обхвату голови та щільності в\'язання.',
    steps: [
      { 
        step: '1', 
        description: 'Виміряйте обхват голови в найширшому місці (зазвичай трохи вище брів і вух).' 
      },
      { 
        step: '2', 
        description: 'Визначте щільність в\'язання, зв\'язавши зразок 10х10 см та порахувавши кількість петель.' 
      },
      { 
        step: '3', 
        description: 'Виберіть бажаний стиль шапки.' 
      },
      { 
        step: '4', 
        description: 'Натисніть "Розрахувати" для отримання результатів.' 
      },
    ],
    tips: [
      'Для більш точного результату завжди в\'яжіть контрольний зразок.',
      'Якщо шапка для дитини, додайте 1-2 см до обхвату для запасу на ріст.',
      'Для шапки біні зазвичай використовують резинку 1х1 або 2х2 для нижньої частини.',
    ],
  };

  return (
    <CalculatorTemplate
      title="Калькулятор шапки"
      description="Розрахунок петель для в'язання шапки"
      fields={fields}
      calculate={calculate}
      helpInfo={helpInfo}
      route={route}
      navigation={navigation}
    />
  );
};

export default HatCalculator;
