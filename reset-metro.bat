@echo off
echo Очищення кешу Metro Bundler...
cd %~dp0
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
echo Кеш очищено. Запуск Metro Bundler...
npx react-native start --reset-cache