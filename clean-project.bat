@echo off
echo Очищення проекту...
cd %~dp0
rmdir /s /q node_modules
rmdir /s /q .expo
del package-lock.json
echo Встановлення залежностей...
npm install --legacy-peer-deps
echo Проект очищено та перевстановлено.