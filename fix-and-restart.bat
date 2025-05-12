@echo off
chcp 65001

echo ============================================================
echo          Виправлення та перезапуск додатку
echo ============================================================

echo 1) Застосовуємо патч для SafeAreaProvider...
node fix-safe-area-patch.js

echo.
echo 2) Зупиняємо Metro-сервер, якщо він запущений...
taskkill /f /im node.exe >nul 2>&1

echo 3) Видаляємо кеш...
if exist .expo rmdir /s /q .expo
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo 4) Встановлюємо змінну для скидання кешу WatermelonDB...
set WATERMELONDB_SHOULD_RESET_CACHE=true

echo.
echo ============================================================
echo          Запускаємо додаток з очищеним кешем
echo ============================================================
echo.

npm run start:clear

echo.
echo Готово! Якщо помилка залишилась, спробуйте інші варіанти рішення.