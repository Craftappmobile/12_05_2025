Тестування міграцій Supabase для проєкту "Розрахуй і В'яжи"
Набір SQL-скриптів для створення, тестування і перевірки міграцій в Supabase з інфраструктурою відстеження версій схеми

Загальний огляд
Цей документ містить набір SQL-скриптів для поетапного створення, керування та тестування міграцій бази даних проєкту "Розрахуй і В'яжи" у Supabase. Міграції забезпечують контрольоване оновлення схеми бази даних з можливістю відстеження версій.

Етап 1: Створення інфраструктури для відстеження міграцій
Створення таблиці для зберігання історії міграцій та допоміжних функцій:

SQL
-- Створення таблиці історії міграцій
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  version INTEGER NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT,
  direction TEXT CHECK (direction IN ('up', 'down')),
  status TEXT CHECK (status IN ('success', 'failed')),
  error_message TEXT
);

-- Створення індексу для швидкого пошуку за версією
CREATE INDEX IF NOT EXISTS idx_schema_migrations_version ON schema_migrations(version);

-- Функція для отримання поточної версії схеми
CREATE OR REPLACE FUNCTION get_current_schema_version()
RETURNS INTEGER AS $$
DECLARE
  current_version INTEGER;
BEGIN
  SELECT version INTO current_version FROM schema_migrations 
  WHERE status = 'success' 
  ORDER BY applied_at DESC LIMIT 1;
  
  IF current_version IS NULL THEN
    RETURN 0;
  END IF;
  
  RETURN current_version;
END;

$$ LANGUAGE plpgsql;

-- Функція для запису історії міграції
CREATE OR REPLACE FUNCTION log_migration(
  p_version INTEGER,
  p_description TEXT,
  p_direction TEXT,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO schema_migrations (version, description, direction, status, error_message)
  VALUES (p_version, p_description, p_direction, p_status, p_error_message);
END;

$$ LANGUAGE plpgsql;
Перевірка етапу 1
SQL
-- Перевірка створення таблиці міграцій
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'schema_migrations'
);

-- Перевірка створення функцій
SELECT proname, proargtypes 
FROM pg_proc 
WHERE proname IN ('get_current_schema_version', 'log_migration');

-- Перевірка поточної версії (має бути 0)
SELECT get_current_schema_version();
Етап 2: Міграція до Версії 1 - Створення початкової схеми
Створення основних таблиць проєкту:

SQL
DO $migration$
DECLARE
  policy_exists boolean;
  trigger_exists boolean;
BEGIN
  -- Перевірка чи не була ця міграція вже застосована
  IF (SELECT get_current_schema_version()) >= 1 THEN
    RAISE NOTICE 'Migration to version 1 already applied';
    PERFORM log_migration(1, 'Initial schema creation', 'up', 'success', 'Already applied');
    RETURN;
  END IF;


  -- Перевірка і створення таблиць
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
    CREATE TABLE projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      pattern_source TEXT,
      difficulty INTEGER,
      status TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );
    RAISE NOTICE 'Created table projects';
  ELSE
    RAISE NOTICE 'Table projects already exists, skipping creation';
  END IF;


  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calculations') THEN
    CREATE TABLE calculations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      yarn_type TEXT NOT NULL,
      gauge_rows NUMERIC,
      gauge_stitches NUMERIC,
      params JSONB,
      result JSONB,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );
    RAISE NOTICE 'Created table calculations';
  ELSE
    RAISE NOTICE 'Table calculations already exists, skipping creation';
  END IF;


  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'photos') THEN
    CREATE TABLE photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      url TEXT NOT NULL,
      thumbnail_url TEXT,
      description TEXT,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );
    RAISE NOTICE 'Created table photos';
  ELSE
    RAISE NOTICE 'Table photos already exists, skipping creation';
  END IF;


  -- Створення індексів (безпечно з IF NOT EXISTS)
  CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
  CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
  CREATE INDEX IF NOT EXISTS idx_calculations_project_id ON calculations(project_id);
  CREATE INDEX IF NOT EXISTS idx_photos_project_id ON photos(project_id);
  CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);


  -- Безпечне включення RLS
  EXECUTE 'ALTER TABLE projects ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE calculations ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE photos ENABLE ROW LEVEL SECURITY';


  -- Безпечне створення політик (перевірка існування перед створенням)
  -- Політики для projects
  SELECT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_select_policy') INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY projects_select_policy ON projects FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_insert_policy') INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY projects_insert_policy ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_update_policy') INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY projects_update_policy ON projects FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  SELECT EXISTS(SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'projects_delete_policy') INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY projects_delete_policy ON projects FOR DELETE USING (auth.uid() = user_id);
  END IF;


  -- Безпечне створення тригерів
  SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') INTO trigger_exists;
  IF NOT trigger_exists THEN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE
    ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;


  SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'update_calculations_updated_at') INTO trigger_exists;
  IF NOT trigger_exists THEN
    CREATE TRIGGER update_calculations_updated_at BEFORE UPDATE
    ON calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;


  SELECT EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'update_photos_updated_at') INTO trigger_exists;
  IF NOT trigger_exists THEN
    CREATE TRIGGER update_photos_updated_at BEFORE UPDATE
    ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;


  -- Запис успішної міграції
  PERFORM log_migration(1, 'Initial schema creation', 'up', 'success');
  RAISE NOTICE 'Migration to version 1 successfully applied';
EXCEPTION WHEN OTHERS THEN
  PERFORM log_migration(1, 'Initial schema creation', 'up', 'failed', SQLERRM);
  RAISE EXCEPTION 'Migration failed: %', SQLERRM;
END;
$migration$ LANGUAGE plpgsql;
Перевірка етапу 2
SQL
-- Перевірка поточної версії (має бути 1)
SELECT get_current_schema_version();

-- Перевірка створених таблиць
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('projects', 'calculations', 'photos');

-- Перевірка індексів
SELECT 
    tablename, 
    indexname 
FROM 
    pg_indexes 
WHERE 
    schemaname = 'public' 
    AND tablename IN ('projects', 'calculations', 'photos');

-- Перевірка політик RLS
SELECT 
    tablename,
    policyname,
    cmd 
FROM 
    pg_policies
WHERE 
    schemaname = 'public'
    AND tablename IN ('projects', 'calculations', 'photos')
ORDER BY 
    tablename, cmd;

-- Перевірка тригерів
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM 
    information_schema.triggers
WHERE 
    trigger_schema = 'public'
    AND event_object_table IN ('projects', 'calculations', 'photos');

-- Перевірка журналу міграцій
SELECT version, description, direction, status, applied_at 
FROM schema_migrations 
ORDER BY applied_at DESC LIMIT 5;
Етап 4: Міграція до Версії 2 - Додавання таблиці нотаток
Додавання таблиці нотаток та необхідних обмежень:

SQL
BEGIN;

DO $$
DECLARE
  current_version INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Перевірка поточної версії
  SELECT get_current_schema_version() INTO current_version;
  
  IF current_version <> 1 THEN
    RAISE NOTICE 'Current version is not 1, cannot migrate to version 2';
    PERFORM log_migration(2, 'Adding notes table', 'up', 'failed', 'Current version is not 1');
    RETURN;
  END IF;

  IF current_version >= 2 THEN
    RAISE NOTICE 'Migration to version 2 already applied';
    PERFORM log_migration(2, 'Adding notes table', 'up', 'success', 'Already applied');
    RETURN;
  END IF;

  -- Перевірка існування таблиці
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'notes'
  ) INTO table_exists;

  BEGIN
    -- Створення таблиці, якщо не існує
    IF NOT table_exists THEN
      CREATE TABLE notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
      );
      
      RAISE NOTICE 'Table notes created successfully';
    ELSE
      RAISE NOTICE 'Table notes already exists, ensuring proper constraints';
      
      -- Додавання зовнішніх ключів, якщо відсутні
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'notes' 
        AND constraint_name = 'notes_project_id_fkey'
      ) THEN
        ALTER TABLE notes 
          ADD CONSTRAINT notes_project_id_fkey 
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'notes' 
        AND constraint_name = 'notes_user_id_fkey'
      ) THEN
        ALTER TABLE notes 
          ADD CONSTRAINT notes_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
      END IF;
    END IF;

    -- Створення індексів, якщо вони не існують
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_project_id') THEN
      CREATE INDEX idx_notes_project_id ON notes(project_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notes_user_id') THEN
      CREATE INDEX idx_notes_user_id ON notes(user_id);
    END IF;
    
    -- Встановлення політик RLS
    ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
    
    -- Видалення дублюючих політик, якщо вони існують
    DROP POLICY IF EXISTS "Authenticated users can delete their own notes" ON notes;
    DROP POLICY IF EXISTS "Authenticated users can insert their own notes" ON notes;
    DROP POLICY IF EXISTS "Authenticated users can read their own notes" ON notes;
    DROP POLICY IF EXISTS "Authenticated users can update their own notes" ON notes;
    
    -- Створення стандартних політик
    DROP POLICY IF EXISTS notes_select_policy ON notes;
    DROP POLICY IF EXISTS notes_insert_policy ON notes;
    DROP POLICY IF EXISTS notes_update_policy ON notes;
    DROP POLICY IF EXISTS notes_delete_policy ON notes;
    
    CREATE POLICY notes_select_policy ON notes 
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY notes_insert_policy ON notes 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY notes_update_policy ON notes 
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY notes_delete_policy ON notes 
      FOR DELETE USING (auth.uid() = user_id);
    
    -- Створення тригера, якщо він не існує
    DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
    CREATE TRIGGER update_notes_updated_at BEFORE UPDATE
    ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Запис успішної міграції
    PERFORM log_migration(2, 'Adding notes table', 'up', 'success');
    RAISE NOTICE 'Migration to version 2 successfully applied';
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_migration(2, 'Adding notes table', 'up', 'failed', SQLERRM);
    RAISE EXCEPTION 'Migration failed: %', SQLERRM;
  END;
END $$;

COMMIT;
Перевірка етапу 4
SQL
SELECT 
  'Узгодженість схеми версії 2' AS перевірка,
  get_current_schema_version() AS поточна_версія,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') AS notes_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') AS projects_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculations') AS calculations_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photos') AS photos_існує,
  CASE 
    WHEN get_current_schema_version() >= 2 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes')
    THEN 'Узгоджено'
    ELSE 'Неузгоджено'
  END AS статус;

-- Перевірка зовнішніх ключів для таблиці notes
SELECT
  'Зовнішні ключі notes' AS перевірка,
  EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'notes' 
    AND kcu.column_name = 'project_id'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) AS fk_project_id_існує,
  EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'notes' 
    AND kcu.column_name = 'user_id'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) AS fk_user_id_існує,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'notes' 
      AND kcu.column_name = 'project_id'
      AND tc.constraint_type = 'FOREIGN KEY'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name = 'notes' 
      AND kcu.column_name = 'user_id'
      AND tc.constraint_type = 'FOREIGN KEY'
    )
    THEN 'Зовнішні ключі в порядку'
    ELSE 'Відсутні зовнішні ключі'
  END AS статус_зовнішніх_ключів;
Етап 6: Міграція до Версії 3 - Додавання таблиці налаштувань користувача
Створення таблиці налаштувань користувача:

SQL
BEGIN;

DO $$
DECLARE
  current_version INTEGER;
  table_exists BOOLEAN;
BEGIN
  -- Перевірка поточної версії
  SELECT get_current_schema_version() INTO current_version;
  
  -- Перевірка наявності таблиці
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'user_settings'
  ) INTO table_exists;
  
  IF current_version <> 2 AND NOT table_exists THEN
    -- Таблиці немає і версія не 2 - не можемо продовжувати
    RAISE NOTICE 'Current version is not 2, cannot migrate to version 3';
    PERFORM log_migration(3, 'Adding user_settings table', 'up', 'failed', 'Current version is not 2');
    RETURN;
  END IF;

  IF current_version >= 3 THEN
    -- Версія вже 3 або вища - міграція виконана раніше
    RAISE NOTICE 'Migration to version 3 already applied';
    PERFORM log_migration(3, 'Adding user_settings table', 'up', 'success', 'Already applied');
    RETURN;
  END IF;

  BEGIN
    -- Якщо таблиця вже існує, пропускаємо створення
    IF table_exists THEN
      RAISE NOTICE 'Table user_settings already exists, skipping creation';
    ELSE
      -- Створення таблиці
      CREATE TABLE user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        theme TEXT DEFAULT 'light',
        language TEXT DEFAULT 'uk',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        sync_frequency INTEGER DEFAULT 15,
        preferences JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
      );
      
      -- Створення індексу
      CREATE UNIQUE INDEX idx_user_settings_user_id ON user_settings(user_id);
      
      RAISE NOTICE 'Table user_settings created successfully';
    END IF;
    
    -- Переконуємося, що RLS та політики налаштовані (незалежно від того, існувала таблиця чи ні)
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    
    -- Створення політик (спочатку видаляємо, якщо вони існують)
    DROP POLICY IF EXISTS user_settings_select_policy ON user_settings;
    DROP POLICY IF EXISTS user_settings_insert_policy ON user_settings;
    DROP POLICY IF EXISTS user_settings_update_policy ON user_settings;
    DROP POLICY IF EXISTS user_settings_delete_policy ON user_settings;
    
    CREATE POLICY user_settings_select_policy ON user_settings 
      FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY user_settings_insert_policy ON user_settings 
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY user_settings_update_policy ON user_settings 
      FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY user_settings_delete_policy ON user_settings 
      FOR DELETE USING (auth.uid() = user_id);
    
    -- Створення тригера, якщо він не існує
    DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
    CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE
    ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    -- Запис успішної міграції з оновленням версії схеми
    PERFORM log_migration(3, 'Adding user_settings table', 'up', 'success');
    RAISE NOTICE 'Migration to version 3 successfully applied';
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_migration(3, 'Adding user_settings table', 'up', 'failed', SQLERRM);
    RAISE EXCEPTION 'Migration failed: %', SQLERRM;
  END;
END $$;

COMMIT;
Перевірка етапу 6
SQL
-- Перевірка узгодженості версії схеми та існування таблиць
SELECT 
  'Узгодженість схеми' AS перевірка,
  get_current_schema_version() AS поточна_версія,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') AS user_settings_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') AS notes_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') AS projects_існує,
  CASE 
    WHEN get_current_schema_version() = 3 AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings')
    THEN 'Узгоджено'
    ELSE 'Неузгоджено'
  END AS статус;
Скрипт міграції версії 4 для додавання зовнішніх ключів
Додавання відсутніх зовнішніх ключів до таблиці notes:

SQL
BEGIN;

DO $$
DECLARE
  current_version INTEGER;
BEGIN
  -- Перевірка поточної версії
  SELECT get_current_schema_version() INTO current_version;
  
  IF current_version <> 3 THEN
    RAISE NOTICE 'Current version is not 3, cannot migrate to version 4';
    PERFORM log_migration(4, 'Adding foreign keys to notes table', 'up', 'failed', 'Current version is not 3');
    RETURN;
  END IF;

  IF current_version >= 4 THEN
    RAISE NOTICE 'Migration to version 4 already applied';
    PERFORM log_migration(4, 'Adding foreign keys to notes table', 'up', 'success', 'Already applied');
    RETURN;
  END IF;

  BEGIN
    -- Додавання зовнішніх ключів до таблиці notes
    
    -- Перевірка існування таблиці notes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
      -- Перевірка чи відсутні зовнішні ключі
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'notes' 
        AND kcu.column_name = 'project_id'
        AND tc.constraint_type = 'FOREIGN KEY'
      ) THEN
        -- Додаємо зовнішній ключ для project_id
        ALTER TABLE notes
          ADD CONSTRAINT fk_notes_project_id FOREIGN KEY (project_id) 
          REFERENCES projects(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for project_id';
      END IF;
      
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'notes' 
        AND kcu.column_name = 'user_id'
        AND tc.constraint_type = 'FOREIGN KEY'
      ) THEN
        -- Додаємо зовнішній ключ для user_id
        ALTER TABLE notes
          ADD CONSTRAINT fk_notes_user_id FOREIGN KEY (user_id) 
          REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint for user_id';
      END IF;
      
      -- Перевірка політик RLS, щоб уникнути дублювання
      DROP POLICY IF EXISTS "Authenticated users can delete their own notes" ON notes;
      DROP POLICY IF EXISTS "Authenticated users can insert their own notes" ON notes;
      DROP POLICY IF EXISTS "Authenticated users can read their own notes" ON notes;
      DROP POLICY IF EXISTS "Authenticated users can update their own notes" ON notes;
      
      -- Запис успішної міграції
      PERFORM log_migration(4, 'Adding foreign keys to notes table', 'up', 'success');
      RAISE NOTICE 'Migration to version 4 successfully applied';
    ELSE
      RAISE EXCEPTION 'Table notes does not exist';
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    PERFORM log_migration(4, 'Adding foreign keys to notes table', 'up', 'failed', SQLERRM);
    RAISE EXCEPTION 'Migration failed: %', SQLERRM;
  END;
END $$;

COMMIT;
Перевірка після міграції
SQL
SELECT
  'Зовнішні ключі notes після міграції' AS перевірка,
  EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'notes' 
    AND kcu.column_name = 'project_id'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) AS fk_project_id_існує,
  EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'notes' 
    AND kcu.column_name = 'user_id'
    AND tc.constraint_type = 'FOREIGN KEY'
  ) AS fk_user_id_існує,
  get_current_schema_version() AS поточна_версія;
Етап 8: Комплексна перевірка стану бази даних після всіх міграцій
SQL
-- 1. Загальна інформація про поточний стан
SELECT 
  'Загальна інформація' AS категорія,
  get_current_schema_version() AS поточна_версія,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') AS кількість_таблиць;

-- 2. Перевірка наявності всіх очікуваних таблиць
SELECT 
  'Наявність таблиць' AS категорія,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') AS projects_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculations') AS calculations_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photos') AS photos_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') AS notes_існує,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') AS user_settings_існує,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calculations')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'photos')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings')
    THEN 'Всі таблиці наявні'
    ELSE 'Відсутні деякі таблиці'
  END AS статус;

-- 3. Перевірка зовнішніх ключів для кожної таблиці
WITH expected_fks AS (
  SELECT 'projects' AS таблиця, 'user_id' AS колонка, 'auth.users' AS reference_table UNION ALL
  SELECT 'calculations', 'project_id', 'projects' UNION ALL
  SELECT 'calculations', 'user_id', 'auth.users' UNION ALL
  SELECT 'photos', 'project_id', 'projects' UNION ALL
  SELECT 'photos', 'user_id', 'auth.users' UNION ALL
  SELECT 'notes', 'project_id', 'projects' UNION ALL
  SELECT 'notes', 'user_id', 'auth.users' UNION ALL
  SELECT 'user_settings', 'user_id', 'auth.users'
)
SELECT 
  'Зовнішні ключі' AS категорія,
  efk.таблиця || '.' || efk.колонка AS очікуваний_ключ,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = efk.таблиця
      AND kcu.column_name = efk.колонка
      AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN 'Наявний'
    ELSE 'Відсутній'
  END AS статус
FROM expected_fks efk
ORDER BY efk.таблиця, efk.колонка;

-- 4. Перевірка політик RLS для кожної таблиці
SELECT 
  'Політики RLS' AS категорія,
  table_name AS таблиця,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name) AS кількість_політик,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = table_name) >= 4 
    THEN 'В порядку'
    ELSE 'Недостатньо політик'
  END AS статус
FROM (
  SELECT 'projects' AS table_name UNION ALL
  SELECT 'calculations' UNION ALL
  SELECT 'photos' UNION ALL
  SELECT 'notes' UNION ALL
  SELECT 'user_settings'
) t
ORDER BY table_name;

-- 5. Перевірка тригерів для оновлення timestamps
SELECT 
  'Тригери' AS категорія,
  event_object_table AS таблиця,
  COUNT(*) AS кількість_тригерів,
  CASE 
    WHEN COUNT(*) > 0 THEN 'Наявні'
    ELSE 'Відсутні'
  END AS статус
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND (action_statement LIKE '%update_updated_at_column%' OR action_statement LIKE '%update_timestamp%')
GROUP BY event_object_table
ORDER BY event_object_table;

-- 6. Перевірка структури таблиці notes (детально)
SELECT 
  'Структура таблиці notes' AS категорія,
  column_name AS колонка,
  data_type AS тип_даних,
  is_nullable AS допускає_null,
  column_default AS значення_за_замовчуванням
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'notes'
ORDER BY ordinal_position;

-- 7. Перевірка структури таблиці user_settings (детально)
SELECT 
  'Структура таблиці user_settings' AS категорія,
  column_name AS колонка,
  data_type AS тип_даних,
  is_nullable AS допускає_null,
  column_default AS значення_за_замовчуванням
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_settings'
ORDER BY ordinal_position;

-- 8. Узагальнений статус бази даних
SELECT
  'Узагальнений статус БД' AS категорія,
  CASE 
    WHEN get_current_schema_version() = 4
     AND (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN 
          ('projects', 'calculations', 'photos', 'notes', 'user_settings')) = 5
     AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20 -- Приблизно 4 політики на таблицю
    THEN 'База даних у відповідності до міграцій'
    ELSE 'Виявлено невідповідності'
  END AS статус;
Етап 9: Перевірка безпеки та рекомендовані заходи безпеки
SQL
-- 1. Перевірка параметрів безпеки паролів
SELECT name, setting, short_desc 
FROM pg_settings 
WHERE name LIKE '%password%' OR name LIKE '%auth%';

-- 2. Перевірка налаштувань RLS для всіх таблиць (виправлено)
SELECT
  c.relname AS tablename,
  CASE WHEN c.relrowsecurity THEN 'Enabled' ELSE 'Disabled' END AS rls_enabled,
  (SELECT COUNT(*) FROM pg_policies p WHERE p.tablename = c.relname) AS policy_count
FROM pg_class c
WHERE c.relkind = 'r' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY c.relname;

-- 3. Перевірка прав доступу до таблиць
SELECT
  table_schema,
  table_name,
  grantee,
  string_agg(privilege_type, ', ') AS privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public'
GROUP BY table_schema, table_name, grantee
ORDER BY table_schema, table_name;

-- 4. Перевірка політик RLS у деталях
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Перевірка ролей і їх привілеїв
SELECT
  r.rolname,
  r.rolsuper,
  r.rolinherit,
  r.rolcreaterole,
  r.rolcreatedb,
  r.rolcanlogin,
  ARRAY(SELECT b.rolname 
        FROM pg_catalog.pg_auth_members m 
        JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid) 
        WHERE m.member = r.oid) AS memberof
FROM pg_catalog.pg_roles r
WHERE r.rolname NOT LIKE 'pg_%'
ORDER BY 1;
Ключові рекомендації щодо підвищення безпеки
Вдосконалення захисту паролів:
Переконайтеся, що password_encryption встановлено на 'scram-sha-256'
Увімкніть захист від витоку пароля в панелі керування Supabase
Перевірте Row Level Security:
Переконайтеся, що RLS увімкнено для всіх таблиць з даними користувачів
Перевірте, що всі необхідні політики (SELECT, INSERT, UPDATE, DELETE) налаштовані
Налаштування прав доступу:
Обмежте права для загальнодоступних ролей до мінімально необхідних
Перегляньте ролі з привілеями суперкористувача
Додаткові заходи безпеки в Supabase:
Налаштуйте MFA (Multi-Factor Authentication)
Увімкніть Captcha захист
Встановіть розумні обмеження на кількість запитів (Rate Limiting)
Регулярний аудит:
Створіть план регулярної перевірки налаштувань безпеки
Перевіряйте журнали аутентифікації на предмет підозрілої активності
Додаткові моніторингові запити
Важливо регулярно моніторити стан бази даних для підтримки її працездатності та оптимізації продуктивності.

SQL
-- Етап 1: Базова перевірка кількості записів
SELECT
  'projects' AS table_name,
  COUNT(*) AS total_count
FROM projects
UNION ALL
SELECT
  'calculations' AS table_name,
  COUNT(*) AS total_count
FROM calculations
UNION ALL
SELECT
  'notes' AS table_name,
  COUNT(*) AS total_count
FROM notes
UNION ALL
SELECT
  'photos' AS table_name,
  COUNT(*) AS total_count
FROM photos
UNION ALL
SELECT
  'user_settings' AS table_name,
  COUNT(*) AS total_count
FROM user_settings
ORDER BY table_name;

-- Етап 2: Аналіз даних по користувачах
SELECT
  auth.users.email,
  'projects' AS table_name,
  COUNT(projects.*) AS record_count
FROM
  auth.users
LEFT JOIN
  projects ON projects.user_id = auth.users.id
GROUP BY
  auth.users.email
UNION ALL
SELECT
  auth.users.email,
  'calculations' AS table_name,
  COUNT(calculations.*) AS record_count
FROM
  auth.users
LEFT JOIN
  calculations ON calculations.user_id = auth.users.id
GROUP BY
  auth.users.email
UNION ALL
SELECT
  auth.users.email,
  'notes' AS table_name,
  COUNT(notes.*) AS record_count
FROM
  auth.users
LEFT JOIN
  notes ON notes.user_id = auth.users.id
GROUP BY
  auth.users.email
ORDER BY
  email, table_name;

-- Етап 3: Останні зміни в базі даних
SELECT
  'projects' AS table_name,
  id::text,  -- Перетворення на text
  updated_at,
  created_at
FROM projects
UNION ALL
SELECT
  'calculations' AS table_name,
  id::text,
  updated_at,
  created_at
FROM calculations
UNION ALL
SELECT
  'notes' AS table_name,
  id::text,
  updated_at,
  created_at
FROM notes
UNION ALL
SELECT
  'photos' AS table_name,
  id::text,  -- Перетворення на text
  updated_at,
  created_at
FROM photos
ORDER BY updated_at DESC
LIMIT 50;

-- Етап 4: Пошук потенційних конфліктів даних
WITH recent_updates AS (
  SELECT
    'projects' AS table_name,
    id,
    updated_at,
    user_id
  FROM projects
  WHERE updated_at > NOW() - INTERVAL '24 hours'
  UNION ALL
  SELECT
    'calculations' AS table_name,
    id,
    updated_at,
    user_id
  FROM calculations
  WHERE updated_at > NOW() - INTERVAL '24 hours'
  UNION ALL
  SELECT
    'notes' AS table_name,
    id,
    updated_at,
    user_id
  FROM notes
  WHERE updated_at > NOW() - INTERVAL '24 hours'
)
SELECT
  r1.table_name,
  r1.id,
  r1.updated_at AS update1_time,
  r2.updated_at AS update2_time,
  ABS(EXTRACT(EPOCH FROM (r1.updated_at - r2.updated_at))) AS time_diff_seconds,
  r1.user_id = r2.user_id AS same_user
FROM
  recent_updates r1
JOIN
  recent_updates r2 ON r1.id = r2.id AND r1.table_name = r2.table_name AND r1.updated_at <> r2.updated_at
WHERE
  ABS(EXTRACT(EPOCH FROM (r1.updated_at - r2.updated_at))) < 60 -- Різниця менше 60 секунд
ORDER BY
  time_diff_seconds ASC;

-- Етап 5: Аналіз повільних запитів
SELECT
  query,
  calls,
  total_exec_time,      -- замість total_time
  mean_exec_time,       -- замість mean_time
  rows
FROM
  pg_stat_statements
WHERE
  query NOT LIKE '%pg_stat_statements%'
ORDER BY
  mean_exec_time DESC   -- сортування за середнім часом виконання
LIMIT 20;

-- Етап 6: Аналіз розміру таблиць
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS total_size,
  pg_size_pretty(pg_relation_size(quote_ident(table_name))) AS data_size,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)) - pg_relation_size(quote_ident(table_name))) AS external_size
FROM
  information_schema.tables
WHERE
  table_schema = 'public'
ORDER BY
  pg_total_relation_size(quote_ident(table_name)) DESC;

-- Етап 7: Активність користувачів
SELECT
  auth.users.email,
  auth.users.last_sign_in_at,
  (CURRENT_TIMESTAMP - auth.users.last_sign_in_at) AS time_since_last_login,
  auth.users.created_at,
  COUNT(DISTINCT projects.id) AS projects_count,
  COUNT(DISTINCT calculations.id) AS calculations_count
FROM
  auth.users
LEFT JOIN
  projects ON projects.user_id = auth.users.id
LEFT JOIN
  calculations ON calculations.user_id = auth.users.id
GROUP BY
  auth.users.email, auth.users.last_sign_in_at, auth.users.created_at
ORDER BY
  auth.users.last_sign_in_at DESC;