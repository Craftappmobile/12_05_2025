-- Створення таблиці для проєктів
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  yarn_type TEXT,
  yarn_color TEXT,
  yarn_amount NUMERIC,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Створення таблиці для розрахунків
CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Створення індексів для швидкого пошуку
CREATE INDEX projects_user_id_idx ON projects(user_id);
CREATE INDEX calculations_user_id_idx ON calculations(user_id);
CREATE INDEX calculations_project_id_idx ON calculations(project_id);
CREATE INDEX calculations_type_idx ON calculations(type);

-- Налаштування RLS (Row Level Security) для безпеки даних
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Політики для проєктів
CREATE POLICY "Users can view their own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Політики для розрахунків
CREATE POLICY "Users can view their own calculations" 
  ON calculations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculations" 
  ON calculations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculations" 
  ON calculations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculations" 
  ON calculations FOR DELETE 
  USING (auth.uid() = user_id);

-- Тригер для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();