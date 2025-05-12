import { Model } from '@nozbe/watermelondb';
import { field, date, relation, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Calculation extends Model {
  static table = 'calculations';
  
  static associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
  };

  @text('calculator_type') calculatorType!: string;
  @text('calculator_title') calculatorTitle!: string;
  @text('input_values') inputValuesText!: string;
  @text('results') resultsText!: string;
  @text('notes') notes?: string;
  @relation('projects', 'project_id') project!: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  // Геттери та сеттери для зручного доступу до JSON даних
  get inputValues(): Record<string, any> {
    try {
      return this.inputValuesText ? JSON.parse(this.inputValuesText) : {};
    } catch (error) {
      console.error('Помилка при парсингу inputValues:', error);
      return {};
    }
  }

  set inputValues(values: Record<string, any>) {
    this.inputValuesText = JSON.stringify(values || {});
  }

  get results(): Record<string, any> {
    try {
      return this.resultsText ? JSON.parse(this.resultsText) : {};
    } catch (error) {
      console.error('Помилка при парсингу results:', error);
      return {};
    }
  }

  set results(values: Record<string, any>) {
    this.resultsText = JSON.stringify(values || {});
  }
}