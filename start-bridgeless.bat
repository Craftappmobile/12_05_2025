@echo off
echo Запуск додатку в режимі Bridgeless...
echo.

:: Очищення кешу Metro
echo Очищення кешу Metro...
echo y | npx react-native start --reset-cache --port 8082 --config metro.config.js --no-interactive --bridgeless

echo.
echo Додаток успішно запущено в режимі Bridgeless!
echo.