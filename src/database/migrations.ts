import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({ migrations: [
    // Міграція для додавання полів, пов'язаних з нотатками та деталями в'язання
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'projects',
          columns: [
            { name: 'needle_size', type: 'string', isOptional: true },
            { name: 'density', type: 'string', isOptional: true },
            { name: 'tags', type: 'string', isOptional: true }
          ]
        })
      ]
    },
    // Міграція для додавання полів progress та yarn_type до проектів
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'projects',
          columns: [
            { name: 'progress', type: 'number', isOptional: true },
            { name: 'yarn_type', type: 'string', isOptional: true }
          ]
        })
      ]
    }
  ] });