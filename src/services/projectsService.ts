/**
 * @fileoverview Сервіс для роботи з проєктами та розрахунками
 */

import { database } from '../database';
import Project from '../database/models/Project';
import Calculation from '../database/models/Calculation';
import { Q } from '@nozbe/watermelondb';

/**
 * Сервіс для роботи з проєктами та розрахунками
 */
export const projectsService = {
  /**
   * Отримати всі проєкти користувача
   * @returns {Promise<Project[]>} Масив проєктів
   */
  async getUserProjects(): Promise<Project[]> {
    return await database.get<Project>('projects').query(
      Q.sortBy('created_at', 'desc')
    ).fetch();
  },

  /**
   * Отримати проєкт за ID
   * @param {string} id ID проєкту
   * @returns {Promise<Project>} Проєкт
   */
  async getProjectById(id: string): Promise<Project> {
    return await database.get<Project>('projects').find(id);
  },

  /**
   * Створити новий проєкт
   * @param {object} projectData Дані проєкту
   * @returns {Promise<string>} ID створеного проєкту
   */
  async createProject(projectData: {
    name: string,
    description?: string,
    status?: 'planned' | 'in_progress' | 'completed' | 'archived',
    progress?: number,
    yarnType?: string,
    startDate?: Date,
  }): Promise<string> {
    let newProject: Project | null = null;

    await database.write(async () => {
      newProject = await database.get<Project>('projects').create(project => {
        project.name = projectData.name;
        project.description = projectData.description || '';
        project.status = projectData.status || 'planned';
        project.progress = typeof projectData.progress === 'number' ? projectData.progress : (
          projectData.status === 'completed' ? 100 :
          projectData.status === 'in_progress' ? 70 :
          0
        );
        project.yarnType = projectData.yarnType || '';
        project.startDate = projectData.startDate || new Date();
        project.isFavorite = false;
      });
    });

    return newProject?.id || '';
  },

  /**
   * Оновити проєкт
   * @param {string} id ID проєкту
   * @param {object} projectData Дані для оновлення
   */
  async updateProject(id: string, projectData: {
    name?: string,
    description?: string,
    status?: 'planned' | 'in_progress' | 'completed' | 'archived',
    progress?: number,
    yarnType?: string,
    startDate?: Date,
    endDate?: Date,
    isFavorite?: boolean,
  }): Promise<void> {
    const project = await this.getProjectById(id);

    await database.write(async () => {
      await project.update(proj => {
        if (projectData.name) proj.name = projectData.name;
        if (projectData.description !== undefined) proj.description = projectData.description;
        
        // Якщо статус змінюється, але прогрес не встановлений явно,
        // автоматично встановлюємо прогрес на основі нового статусу
        if (projectData.status && projectData.status !== proj.status && projectData.progress === undefined) {
          proj.status = projectData.status;
          proj.progress = projectData.status === 'completed' ? 100 :
                        projectData.status === 'in_progress' ? 70 :
                        projectData.status === 'planned' ? 0 : 
                        projectData.status === 'archived' ? 100 : undefined;
        } else {
          // Інакше оновлюємо поля окремо
          if (projectData.status) proj.status = projectData.status;
          if (projectData.progress !== undefined) proj.progress = projectData.progress;
        }
        
        if (projectData.yarnType !== undefined) proj.yarnType = projectData.yarnType;
        if (projectData.startDate) proj.startDate = projectData.startDate;
        if (projectData.endDate !== undefined) proj.endDate = projectData.endDate;
        if (projectData.isFavorite !== undefined) proj.isFavorite = projectData.isFavorite;
      });
    });
  },

  /**
   * Видалити проєкт
   * @param {string} id ID проєкту
   */
  async deleteProject(id: string): Promise<void> {
    const project = await this.getProjectById(id);

    await database.write(async () => {
      await project.markAsDeleted();
      await project.destroyPermanently();
    });
  },

  /**
   * Отримати всі розрахунки для проєкту
   * @param {string} projectId ID проєкту
   * @returns {Promise<Calculation[]>} Масив розрахунків
   */
  async getProjectCalculations(projectId: string): Promise<Calculation[]> {
    const project = await this.getProjectById(projectId);
    return await project.calculations.fetch();
  },

  /**
   * Додати новий розрахунок до проєкту
   * @param {string} projectId ID проєкту
   * @param {object} calculationData Дані розрахунку
   * @returns {Promise<string>} ID доданого розрахунку
   */
  async addCalculationToProject(projectId: string, calculationData: {
    type: string,
    title: string,
    inputData: Record<string, any>,
    result: Record<string, any>,
    notes?: string,
  }): Promise<string> {
    const project = await this.getProjectById(projectId);
    let newCalculation: Calculation | null = null;

    await database.write(async () => {
      newCalculation = await database.get<Calculation>('calculations').create(calc => {
        calc.calculatorType = calculationData.type;
        calc.calculatorTitle = calculationData.title;
        calc.inputValues = calculationData.inputData;
        calc.results = calculationData.result;
        calc.notes = calculationData.notes || '';
        // @ts-ignore: Тип не співпадає, але це нормально для WatermelonDB
        calc.project.set(project);
      });
    });

    return newCalculation?.id || '';
  },

  /**
   * Оновити розрахунок
   * @param {string} id ID розрахунку
   * @param {object} calculationData Дані для оновлення
   */
  async updateCalculation(id: string, calculationData: {
    title?: string,
    inputData?: Record<string, any>,
    result?: Record<string, any>,
    notes?: string,
  }): Promise<void> {
    const calculation = await database.get<Calculation>('calculations').find(id);

    await database.write(async () => {
      await calculation.update(calc => {
        if (calculationData.title) calc.calculatorTitle = calculationData.title;
        if (calculationData.inputData) calc.inputValues = calculationData.inputData;
        if (calculationData.result) calc.results = calculationData.result;
        if (calculationData.notes !== undefined) calc.notes = calculationData.notes;
      });
    });
  },

  /**
   * Видалити розрахунок
   * @param {string} id ID розрахунку
   */
  async deleteCalculation(id: string): Promise<void> {
    const calculation = await database.get<Calculation>('calculations').find(id);

    await database.write(async () => {
      await calculation.markAsDeleted();
      await calculation.destroyPermanently();
    });
  },
};