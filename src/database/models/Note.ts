import { Model } from '@nozbe/watermelondb';
import { field, date, relation, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Note extends Model {
  static table = 'notes';
  
  static associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
  };

  @text('title') title!: string;
  @text('content') content!: string;
  @relation('projects', 'project_id') project!: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}