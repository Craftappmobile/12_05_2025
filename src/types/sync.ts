// src/types/sync.ts
export enum ConflictStrategy {
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  NEWEST_WINS = 'NEWEST_WINS',
  MANUAL = 'MANUAL'
}

export enum SyncStage {
  INITIALIZING = 'INITIALIZING',
  PUSHING = 'PUSHING',
  PULLING = 'PULLING',
  RESOLVING_CONFLICTS = 'RESOLVING_CONFLICTS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface SyncRecord {
  local: any;
  server: any;
  resolved: any;
  table: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  stage: SyncStage;
  stats?: {
    pushed: number;
    pulled: number;
    conflicts: number;
    duration: number;
  };
  error?: Error;
}