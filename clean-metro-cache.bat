@echo off
echo Очищення кешу Metro bundler...
rmdir /s /q C:\Users\Admin\Workspace\app\node_modules\.cache\metro
rmdir /s /q C:\Users\Admin\Workspace\app\node_modules\.cache\babel-loader
echo Кеш очищено. Готово до перезапуску.

echo Перезапуск Metro bundler з чистим кешем...
npx react-native start --reset-cache