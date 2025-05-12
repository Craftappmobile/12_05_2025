@echo off
chcp 65001

echo Очищення кешу та перезапуск додатку...

:: Зупиняємо всі процеси Metro
taskkill /f /im node.exe 2>nul

:: Очищаємо кеш Metro
echo Очищаємо кеш Metro...
rd /s /q ".expo" 2>nul
rd /s /q "android\.gradle" 2>nul
rd /s /q ".gradle" 2>nul
rd /s /q "node_modules\.cache" 2>nul

:: Очищаємо кеш WatermelonDB
echo Очищаємо кеш WatermelonDB...
set WATERMELONDB_SHOULD_RESET_CACHE=true

:: Застосовуємо патчі
echo Застосовуємо патчі для React Navigation та SafeAreaProvider...
node fix-navigator.js
node fix-safe-area.js

:: Виправляємо Unicode-екранування кирилиці
echo Виправляємо Unicode-екранування в файлах...
node fix-unicode.js

:: Запускаємо додаток з очищеним кешем
echo Запускаємо додаток...
npm run android:dev

echo Готово! Додаток перезапущено з очищеним кешем.