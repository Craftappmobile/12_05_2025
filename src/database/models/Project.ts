import { Model } from '@nozbe/watermelondb';
import { field, date, children, readonly, text } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Project extends Model {
  static table = 'projects';
  
  static associations: Associations = {
    calculations: { type: 'has_many', foreignKey: 'project_id' },
    notes: { type: 'has_many', foreignKey: 'project_id' },
    photos: { type: 'has_many', foreignKey: 'project_id' },
  };

  @text('name') name!: string;
  @text('description') description!: string;
  @text('status') status!: 'planned' | 'in_progress' | 'completed' | 'archived';
  @field('progress') progress?: number; // Поле для відстеження прогресу
  @text('yarn_type') yarnType?: string; // Тип пряжі
  @text('needle_size') needleSize?: string; // Розмір спиць
  @text('density') density?: string; // Щільність в'язання
  @text('tags') tags?: string; // Теги проєкту
  @date('start_date') startDate!: Date;
  @date('end_date') endDate?: Date;
  @field('is_favorite') isFavorite!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('calculations') calculations: any;
  @children('notes') notes: any;
  @children('photos') photos: any;
  
  /**
   * Обчислює прогрес проєкту на основі збереженого значення або статусу
   * @returns Значення прогресу від 0 до 100
   */
  getProgress(): number {
    // Якщо прогрес встановлено явно, повертаємо його
    if (typeof this.progress === 'number') {
      return this.progress;
    }
    
    // Інакше визначаємо прогрес на основі статусу
    switch(this.status) {
      case 'planned': return 0;
      case 'completed': return 100;
      case 'in_progress': return 70; // Значення за замовчуванням для проєктів у процесі
      case 'archived': return 100;
      default: return 0;
    }
  }
}