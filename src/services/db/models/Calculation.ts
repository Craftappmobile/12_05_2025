import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';
import Project from './Project';

export default class Calculation extends Model {
  static table = 'calculations';

  @text('project_id') projectId?: string;
  @text('type') type!: string;
  @text('input_data') inputData!: string;
  @text('result_data') resultData!: string;
  @readonly @date('created_at') createdAt!: Date;
  @field('is_favorite') isFavorite!: boolean;

  // Зв'язок з проєктом (якщо є)
  @relation('projects', 'project_id') project?: Project;

  // Допоміжні методи для роботи з JSON-даними
  getInputData() {
    try {
      return JSON.parse(this.inputData);
    } catch (e) {
      return {};
    }
  }

  getResultData() {
    try {
      return JSON.parse(this.resultData);
    } catch (e) {
      return {};
    }
  }
}