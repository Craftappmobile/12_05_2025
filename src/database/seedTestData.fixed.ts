import { database, projectsCollection, calculationsCollection, notesCollection, photosCollection } from './index';

/**
 * Функція для створення тестових даних в базі даних
 * Викликається при першому запуску або після очищення кешу
 */
export async function seedTestData() {
  try {
    // Перевіряємо, чи вже є проекти в базі даних
    const existingProjects = await projectsCollection.query().fetch();
    
    if (existingProjects.length > 0) {
      console.log('База даних вже містить проекти, пропускаємо ініціалізацію тестових даних');
      return;
    }
    
    // Типізація для тестових даних
    interface TestNote {
      title: string;
      content: string;
    }
    
    interface TestProject {
      name: string;
      description: string;
      status: string;
      progress: number;
      yarnType: string;
      needleSize?: string;
      density?: string;
      tags?: string;
      startDate: Date;
      endDate?: Date;
      isFavorite: boolean;
      notes?: TestNote[];
      calculations?: any[];
    }
    
    // Масив тестових проектів
    const testProjects: TestProject[] = [
      {
        name: 'Светр «Осінь»',
        description: 'Жіночий светр вільного крою з V-подібним вирізом та подовженими рукавами. Виконується пряжею середньої товщини.',
        status: 'in_progress',
        progress: 70,
        yarnType: 'Merino Wool',
        startDate: new Date('2025-03-10'),
        isFavorite: true,
        needleSize: '4.5 мм',
        density: '22x30',
        tags: 'светр,осінь,меріно',
        notes: [
          {
            title: 'Вибір пряжі',
            content: 'Для цього проєкту краще використовувати пряжу з вмістом вовни не менше 50%. Розглянути варіанти від Drops та Katia. Потрібно близько 500г пряжі. Колір: глибокий бордовий або теракотовий.'
          },
          {
            title: 'Ідеї для оздоблення',
            content: 'Додати вишивку на манжетах. Використати контрастну нитку для обв\'язки горловини. Можливо додати кишені з аплікацією. Перевірити наявність ґудзиків для декору.'
          }
        ],
        calculations: [
          {
            calculatorType: 'yarn',
            calculatorTitle: 'Розрахунок пряжі',
            inputValues: JSON.stringify({
              width: 120,
              length: 70,
              density: 18,
              weightPer100m: 50
            }),
            results: JSON.stringify({
              totalWeight: 450,
              totalLength: 900
            }),
            notes: 'Купити додатково 50г для зразка'
          },
          {
            calculatorType: 'vneck',
            calculatorTitle: 'Розрахунок горловини',
            inputValues: JSON.stringify({
              neckWidth: 40,
              stitchCount: 180,
              rowsCount: 60
            }),
            results: JSON.stringify({
              decreaseRate: 3,
              decreaseStitches: 88
            }),
            notes: ''
          },
          {
            calculatorType: 'adaptation',
            calculatorTitle: 'Адаптація МК',
            inputValues: JSON.stringify({
              patternDensity: 22,
              myDensity: 20,
              originalWidth: 50
            }),
            results: JSON.stringify({
              newStitchCount: 110,
              widthDifference: 5
            }),
            notes: "Врахувати при в'язанні рукавів"
          }
        ]
      },
      {
        name: 'Шапка «Сніжинка»',
        description: "Зимова шапка з об'ємним візерунком та помпоном. Використовується техніка джгутів і кіс.",
        status: 'completed',
        progress: 100,
        yarnType: 'Alpaca Blend',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-02-05'),
        isFavorite: false,
        needleSize: '3.5 мм',
        density: '24x32',
        tags: 'шапка,зима,альпака',
        notes: [
          {
            title: 'Техніка виконання кіс',
            content: 'Коси виконувати за схемою з книги "The Ultimate Book of Cables". Перехрещення робити кожні 6 рядів, повторювати візерунок 5 разів.'
          }
        ],
        calculations: [
          {
            calculatorType: 'hat',
            calculatorTitle: 'Розрахунок шапки',
            inputValues: JSON.stringify({
              headCircumference: 58,
              density: 20,
              decreaseStyle: 'gradual'
            }),
            results: JSON.stringify({
              stitchCount: 116,
              decreaseRows: 8
            }),
            notes: ''
          },
          {
            calculatorType: 'yarn',
            calculatorTitle: 'Розрахунок пряжі',
            inputValues: JSON.stringify({
              pattern: 'hat',
              size: 'adult',
              weightPer100m: 100
            }),
            results: JSON.stringify({
              totalWeight: 120,
              additionalBall: true
            }),
            notes: 'Залишилось 30г після завершення'
          }
        ]
      },
      {
        name: 'Шкарпетки',
        description: "Базові шкарпетки з укріпленою п'яткою та резинкою. Виконуються на 5 шпицях.",
        status: 'planned',
        progress: 0,
        yarnType: 'Sock Yarn',
        startDate: new Date('2025-04-15'),
        isFavorite: false,
        calculations: [
          {
            calculatorType: 'adaptation',
            calculatorTitle: 'Адаптація розміру',
            inputValues: JSON.stringify({
              footLength: 26,
              ankleCircumference: 22,
              density: 30
            }),
            results: JSON.stringify({
              stitchCount: 74,
              heelLength: 28
            }),
            notes: 'Спробувати техніку afterthought heel'
          }
        ]
      }
    ];
    
    console.log('Початок ініціалізації тестових даних...');
    
    // Транзакція для збереження всіх даних
    await database.write(async () => {
      // Створюємо проекти та їх розрахунки
      for (const projectData of testProjects) {
        const { calculations, notes, ...projectInfo } = projectData;
        
        // Створюємо проект
        const project = await projectsCollection.create(project => {
          project.name = projectInfo.name;
          project.description = projectInfo.description;
          project.status = projectInfo.status as any;
          project.progress = projectInfo.progress;
          project.yarnType = projectInfo.yarnType;
          project.needleSize = projectInfo.needleSize || null;
          project.density = projectInfo.density || null;
          project.tags = projectInfo.tags || null;
          project.startDate = projectInfo.startDate;
          if (projectInfo.endDate) project.endDate = projectInfo.endDate;
          project.isFavorite = projectInfo.isFavorite;
        });
        
        // Додаємо розрахунки до проекту
        if (calculations && calculations.length > 0) {
          for (const calc of calculations) {
            await calculationsCollection.create(calculation => {
              calculation.calculatorType = calc.calculatorType;
              calculation.calculatorTitle = calc.calculatorTitle;
              calculation.inputValues = calc.inputValues;
              calculation.results = calc.results;
              calculation.notes = calc.notes;
              calculation.project.id = project.id;
            });
          }
        }
        
        // Додаємо нотатки до проекту, якщо вони є
        if (notes && notes.length > 0) {
          for (const noteData of notes) {
            await notesCollection.create(note => {
              note.title = noteData.title;
              note.content = noteData.content;
              note.project.id = project.id;
            });
          }
        }
      }
    });
    
    console.log('Тестові дані успішно ініціалізовано!');
  } catch (error) {
    console.error('Помилка при створенні тестових даних:', error);
  }
}