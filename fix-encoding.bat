@echo off
chcp 65001 > nul
echo Виправлення помилки displayName в Bridgeless режимі...

echo Очищення кешу WatermelonDB...
if exist ".watermelon" (
  rmdir /s /q .watermelon
)

echo Очищення кешу Metro...
if exist ".expo" (
  rmdir /s /q .expo
)

echo Запуск додатку у Bridgeless режимі...
start cmd /k "npx expo start --no-dev --minify --clear --no-bundler"

echo Дочекайтесь 5 секунд...
timeout /t 5 /nobreak

echo Відкрийте нову командну строку і запустіть "npm run android"