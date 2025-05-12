@echo off
echo Виправлення помилки Metro Bundler...
cd %~dp0
node fix-metro-error.js
echo Готово. Тепер запустіть додаток командою: npx expo start --clear