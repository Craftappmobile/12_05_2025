import { Model } from '@nozbe/watermelondb';
import { field, date, relation, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Photo extends Model {
  static table = 'photos';
  
  static associations = {
    projects: { type: 'belongs_to', key: 'project_id' },
  };

  @text('uri') uri!: string;
  @text('name') name!: string;
  @text('description') description?: string;
  @relation('projects', 'project_id') project!: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}