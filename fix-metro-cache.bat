@echo off
echo Зупиняємо всі процеси Metro Bundler...
taskkill /f /im node.exe

echo Очищення кешу та тимчасових файлів...
if exist ".expo" rmdir /s /q .expo
if exist "node_modules/.cache" rmdir /s /q node_modules/.cache
if exist "android/.gradle" rmdir /s /q android/.gradle

echo Видалення файлів Expo...
if exist ".expo-shared" rmdir /s /q .expo-shared
if exist ".virtual-metro-entry.js" del /f .virtual-metro-entry.js

echo Очищення тимчасових файлів Android...
if exist "android/app/build" rmdir /s /q android/app/build

echo Перевстановлюємо залежності...
npm install

echo Запускаємо додаток знову...
npm run android