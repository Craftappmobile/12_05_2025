import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 3, // Збільшуємо версію схеми
  tables: [
    tableSchema({
      name: 'projects',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'progress', type: 'number', isOptional: true },
        { name: 'yarn_type', type: 'string', isOptional: true },
        { name: 'needle_size', type: 'string', isOptional: true },
        { name: 'density', type: 'string', isOptional: true },
        { name: 'tags', type: 'string', isOptional: true },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number', isOptional: true },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'calculations',
      columns: [
        { name: 'calculator_type', type: 'string' },
        { name: 'calculator_title', type: 'string' },
        { name: 'input_values', type: 'string' },
        { name: 'results', type: 'string' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'notes',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'content', type: 'string' },
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'photos',
      columns: [
        { name: 'uri', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'project_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});