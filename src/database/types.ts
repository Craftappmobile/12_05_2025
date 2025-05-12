// Типи для імпорту без створення циклічних залежностей

import { Database, Model } from '@nozbe/watermelondb';

// Типи моделей
export type ProjectModel = Model & {
  name: string;
  description: string;
  status: 'planned' | 'in_progress' | 'completed' | 'archived';
  progress?: number;
  yarnType?: string;
  needleSize?: string;
  density?: string;
  tags?: string;
  startDate: Date;
  endDate?: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculations: any;
  notes: any;
  photos: any;
  getProgress: () => number;
};

export type CalculationModel = Model & {
  calculatorType: string;
  calculatorTitle: string;
  inputValues: string;
  results: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  project: any;
};

export type NoteModel = Model & {
  title: string;
  content: string;
  project: any;
  createdAt: Date;
  updatedAt: Date;
};

export type PhotoModel = Model & {
  uri: string;
  name: string;
  description?: string;
  project: any;
  createdAt: Date;
  updatedAt: Date;
};

// Тип функції для створення тестових даних
export type SeedTestDataFunction = () => Promise<void>;

// Тип функції для скидання бази даних
export type ResetDatabaseFunction = () => Promise<boolean>;