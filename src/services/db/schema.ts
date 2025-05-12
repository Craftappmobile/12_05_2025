import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const projectSchema = tableSchema({
  name: 'projects',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string', isOptional: true },
    { name: 'status', type: 'string' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
    { name: 'yarn_type', type: 'string', isOptional: true },
    { name: 'yarn_color', type: 'string', isOptional: true },
    { name: 'yarn_amount', type: 'number', isOptional: true },
  ]
});

export const calculationSchema = tableSchema({
  name: 'calculations',
  columns: [
    { name: 'project_id', type: 'string', isIndexed: true, isOptional: true },
    { name: 'type', type: 'string' },
    { name: 'input_data', type: 'string' }, // JSON-рядок з вхідними даними
    { name: 'result_data', type: 'string' }, // JSON-рядок з результатами
    { name: 'created_at', type: 'number' },
    { name: 'is_favorite', type: 'boolean' },
  ]
});

// Використовуємо appSchema замість простого масиву
export const schemas = appSchema({
  version: 1,
  tables: [
    projectSchema,
    calculationSchema,
  ]
});
