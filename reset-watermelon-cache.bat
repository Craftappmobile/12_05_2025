@echo off
echo Скидання кешу та стану WatermelonDB для розділу "Мої проєкти"...

echo Зупиняємо Metro Bundler, якщо він запущений...
taskkill /f /im node.exe >nul 2>&1

echo Очищення кешу Metro...
if exist ".expo" rmdir /s /q .expo
if exist "node_modules/.cache" rmdir /s /q node_modules/.cache

echo Виставляємо прапорець для скидання кешу WatermelonDB при наступному запуску...
echo WATERMELONDB_SHOULD_RESET_CACHE=true > .env.local
echo INITIALIZE_TEST_DATA=true >> .env.local

echo Видаляємо файли локальної бази даних WatermelonDB (якщо вони існують)...
if exist "android\app\src\main\assets\default.db" del /f "android\app\src\main\assets\default.db"
if exist ".expo-shared\watermelon.db" del /f ".expo-shared\watermelon.db"

echo Перезапуск Metro Bundler чистим стартом...
call npm run start:reset