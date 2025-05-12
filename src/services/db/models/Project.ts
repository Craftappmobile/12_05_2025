import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Project extends Model {
  static table = 'projects';

  @text('name') name!: string;
  @text('description') description?: string;
  @text('status') status!: string;
  @readonly @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @text('yarn_type') yarnType?: string;
  @text('yarn_color') yarnColor?: string;
  @field('yarn_amount') yarnAmount?: number;
}