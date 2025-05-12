@echo off
chcp 65001

echo Оновлення та повне очищення кешу...

:: Зупиняємо всі процеси Metro
taskkill /f /im node.exe 2>nul

:: Очищаємо кеш Metro
echo Очищаємо кеш Metro...
rd /s /q ".expo" 2>nul
rd /s /q "android\.gradle" 2>nul
rd /s /q ".gradle" 2>nul

:: Очищаємо кеш WatermelonDB
echo Очищаємо кеш WatermelonDB...
set WATERMELONDB_SHOULD_RESET_CACHE=true

:: Запускаємо додаток з очищеним кешем
echo Запускаємо додаток з новими компонентами...
npm run android:dev

echo Готово! Додаток перезапущено з очищеним кешем та новими компонентами.