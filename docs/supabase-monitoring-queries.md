Моніторингові SQL-запити для Supabase
Набір SQL-запитів для моніторингу та аналізу структури бази даних Supabase проєкту "Розрахуй і В'яжи"

Етап 1: Базова перевірка кількості записів
-- Етап 1: Базова перевірка кількості записів

-- Загальна кількість записів у кожній таблиці
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
Етап 2: Аналіз даних по користувачах
-- Етап 2: Аналіз даних по користувачах

-- Кількість записів за користувачами у кожній таблиці
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
Етап 3: Останні зміни в базі даних
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
Етап 4: Пошук потенційних конфліктів даних
-- Етап 4: Пошук потенційних конфліктів даних

-- Потенційні конфлікти даних (записи, оновлені майже одночасно)
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
Етап 5: Аналіз повільних запитів
-- Етап 5: Аналіз повільних запитів (виправлено для вашої версії PostgreSQL)

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
Етап 6: Аналіз розміру таблиць
-- Етап 6: Аналіз розміру таблиць

-- Розмір таблиць баз даних
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
Етап 7: Активність користувачів
-- Етап 7: Активність користувачів

-- Моніторинг активності користувачів (останні входи в систему)
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

## Як користуватися запитами

1. Відкрийте консоль SQL у Supabase
2. Скопіюйте потрібний запит
3. Вставте запит у редактор SQL
4. Натисніть кнопку "Run"
5. Аналізуйте отримані результати

Регулярний моніторинг за допомогою цих запитів допоможе виявляти проблеми синхронізації, відстежувати активність користувачів та підтримувати стабільну роботу додатка.

> **Примітка**: Для використання розширення pg_stat_statements, його потрібно увімкнути в налаштуваннях бази даних Supabase. Зверніться до документації Supabase для отримання інструкцій.