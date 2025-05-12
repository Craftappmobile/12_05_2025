import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database, projectsCollection, calculationsCollection } from '../database';
import { Project, Calculation } from '../database/models';
import { sanitizer } from '../utils/sanitizers';
import { handleError, validateRequiredParams } from '../utils/errorHandling';

// Перевіряємо, чи потрібно очистити кеш WatermelonDB
const shouldResetCache = Boolean(global.__WATERMELONDB_SHOULD_RESET_CACHE__);

export interface ProjectWithCalculations {
  id: string;
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'archived';
  progress: number; // Додаємо прогрес
  yarnType?: string; // Додаємо тип пряжі
  startDate: Date;
  endDate?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculations: {
    id: string;
    calculatorType: string;
    calculatorTitle: string;
    inputValues: Record<string, any>;
    results: Record<string, any>;
    notes?: string;
    createdAt: Date;
  }[];
}

export function useProjects() { const [projects, setProjects] = useState<ProjectWithCalculations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Імпортуємо функцію для наповнення тестовими даними
  const { seedTestData } = require('../database/seedTestData');

  // Завантаження проектів
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Перевіряємо чи потрібно скинути кеш
      if (shouldResetCache) {
        console.log('Скидання кешу WatermelonDB для useProjects');
        await database.adapter.unsafeResetDatabase();
        delete global.__WATERMELONDB_SHOULD_RESET_CACHE__;
        
        // Ініціалізуємо тестові дані після скидання кешу
        await seedTestData();
      }
      
      // Отримуємо всі проекти
      const projectsCollection = database.collections.get<Project>('projects');
      const projectsData = await projectsCollection.query().fetch();
      
      // Якщо проектів немає, ініціалізуємо тестові дані
      if (projectsData.length === 0) {
        await seedTestData();
        // Отримуємо проекти заново після ініціалізації
        const updatedProjectsData = await projectsCollection.query().fetch();
        if (updatedProjectsData.length > 0) {
          projectsData.push(...updatedProjectsData);
        }
      }
      
      // Перетворюємо проекти у формат, який потрібен для відображення
      const projectsWithCalculations = await Promise.all(
        projectsData.map(async (project) => {
          // Отримуємо розрахунки для проекту
          const calculations = await project.calculations.fetch();
          
          return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            progress: project.progress || project.getProgress(), // Використовуємо гетер, якщо прогрес не встановлений
            yarnType: project.yarnType, // Додаємо тип пряжі
            startDate: project.startDate,
            endDate: project.endDate,
            isFavorite: project.isFavorite,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            calculations: calculations.map(calc => ({
              id: calc.id,
              calculatorType: calc.calculatorType,
              calculatorTitle: calc.calculatorTitle,
              inputValues: calc.inputValues,
              results: calc.results,
              notes: calc.notes,
              createdAt: calc.createdAt })),
          };
        })
      );
      
      setProjects(projectsWithCalculations);
      setLoading(false);
    } catch (err) {
      console.error('Помилка при завантаженні проектів:', err);
      setError(err instanceof Error ? err : new Error('Невідома помилка'));
      setLoading(false);
    }
  };

  // Створення нового проекту
  const createProject = async (projectData: {
    name: string;
    description: string;
    status: 'planned' | 'in_progress' | 'completed' | 'archived';
    progress?: number;
    yarnType?: string;
    startDate?: Date;
    isFavorite?: boolean;
  }) => {
    try {
      // Перевірка на валідність вхідних даних
      const validationError = validateRequiredParams(
        { name: projectData.name, status: projectData.status },
        ['name', 'status']
      );
      
      if (validationError) {
        throw new Error(validationError);
      }
      
      // Безпечна обробка вхідних даних
      const sanitizedName = String(projectData.name).trim();
      const sanitizedDescription = String(projectData.description || '').trim();
      
      if (sanitizedName.length === 0) {
        throw new Error('Назва проєкту не може бути порожньою');
      }

      await database.write(async () => {
        await projectsCollection.create(project => {
          project.name = sanitizedName;
          project.description = sanitizedDescription;
          project.status = projectData.status;
          project.progress = projectData.progress || 0;
          project.yarnType = projectData.yarnType || '';  // Додаємо поле з типом пряжі
          project.startDate = projectData.startDate || new Date();
          project.isFavorite = projectData.isFavorite || false;
        });
      });
      
      // Оновлюємо список проектів
      await fetchProjects();
      
      return true;
    } catch (err) {
      const errorMessage = handleError(err, 'створення проєкту');
      console.error('Помилка при створенні проекту:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      return false;
    }
  };

  // Оновлення проекту
  const updateProject = async (
    projectId: string,
    projectData: Partial<{
      name: string;
      description: string;
      status: 'planned' | 'in_progress' | 'completed' | 'archived';
      progress: number;
      yarnType: string;
      endDate: Date | null;
      isFavorite: boolean;
    }>
  ) => {
    try {
      const project = await projectsCollection.find(projectId);
      
      await database.write(async () => {
        await project.update(proj => {
          if (projectData.name !== undefined) proj.name = projectData.name;
          if (projectData.description !== undefined) proj.description = projectData.description;
          if (projectData.status !== undefined) proj.status = projectData.status;
          if (projectData.progress !== undefined) proj.progress = projectData.progress;
          if (projectData.yarnType !== undefined) proj.yarnType = projectData.yarnType;
          if (projectData.endDate !== undefined) proj.endDate = projectData.endDate;
          if (projectData.isFavorite !== undefined) proj.isFavorite = projectData.isFavorite;
        });
      });
      
      // Оновлюємо список проектів
      await fetchProjects();
      
      return true;
    } catch (err) {
      console.error('Помилка при оновленні проекту:', err);
      setError(err instanceof Error ? err : new Error('Невідома помилка'));
      return false;
    }
  };

  // Видалення проекту
  const deleteProject = async (projectId: string) => {
    try {
      const project = await projectsCollection.find(projectId);
      
      await database.write(async () => {
        await project.markAsDeleted();
      });
      
      // Оновлюємо список проектів
      await fetchProjects();
      
      return true;
    } catch (err) {
      console.error('Помилка при видаленні проекту:', err);
      setError(err instanceof Error ? err : new Error('Невідома помилка'));
      return false;
    }
  };

  // Додавання розрахунку до проекту
  const addCalculationToProject = async (
    projectId: string,
    calculationData: {
      calculatorType: string;
      calculatorTitle: string;
      inputValues: Record<string, any>;
      results: Record<string, any>;
      notes?: string;
    }
  ) => {
    try {
      // Перевірка на валідність вхідних даних
      if (!projectId) {
        throw new Error('projectId не може бути порожнім');
      }
      
      const validationError = validateRequiredParams(
        { type: calculationData.calculatorType, title: calculationData.calculatorTitle },
        ['type', 'title']
      );
      
      if (validationError) {
        throw new Error(validationError);
      }
      
      // Безпечна обробка вхідних значень та результатів
      const inputValues = typeof calculationData.inputValues === 'object' 
        ? sanitizer(calculationData.inputValues || {}) 
        : calculationData.inputValues;
      
      const results = typeof calculationData.results === 'object' 
        ? sanitizer(calculationData.results || {}) 
        : calculationData.results;
      
      console.log('Дані для збереження розрахунку:', {
        projectId,
        calculatorType: calculationData.calculatorType,
        calculatorTitle: calculationData.calculatorTitle,
      });
      
      await database.write(async () => {
        await calculationsCollection.create(calculation => {
          calculation.calculatorType = calculationData.calculatorType;
          calculation.calculatorTitle = calculationData.calculatorTitle;
          calculation.inputValues = inputValues;
          calculation.results = results;
          calculation.notes = calculationData.notes || '';
          calculation.project.id = projectId;
        });
      });
      
      // Оновлюємо список проектів
      await fetchProjects();
      
      return true;
    } catch (err) {
      const errorMessage = handleError(err, 'додавання розрахунку до проєкту');
      console.error('Помилка при додаванні розрахунку:', errorMessage);
      setError(err instanceof Error ? err : new Error(errorMessage));
      return false;
    }
  };

  // Отримання проектів при монтуванні компонента
  useEffect(() => {
    fetchProjects();
  }, []);

  return { projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addCalculationToProject };
}