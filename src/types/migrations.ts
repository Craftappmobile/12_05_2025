// src/types/migrations.ts
export interface Migration {
  version: number;
  name: string;
  up: (database: any) => Promise<void>;
  down: (database: any) => Promise<void>;
}

export interface MigrationState {
  schemaVersion: number;
  lastMigrationDate: Date;
}

export interface MigrationAction {
  type: 'up' | 'down';
  version: number;
  timestamp: Date;
  success: boolean;
  error?: Error;
}

export interface MigrationProgress {
  success: boolean;
  message: string;
  actions: MigrationAction[];
  error?: Error;
}