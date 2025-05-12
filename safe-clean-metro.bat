@echo off
echo "Безпечне очищення кешів Metro bundler..."

echo "Закриваємо процеси Metro..."
taskkill /f /im "metro.js" >nul 2>&1

echo "Видаляємо кеш Metro з тимчасової директорії..."
rd /s /q "%TEMP%\metro-cache" >nul 2>&1
rd /s /q "%TEMP%\metro-bundler-cache" >nul 2>&1

echo "Видаляємо тимчасові файли..."
del /q /f /s "metro-cache-*.*" >nul 2>&1
del /q /f /s "metro-bundler-cache-*.*" >nul 2>&1

echo "Очищуємо тимчасові файли .expo..."
rd /s /q ".expo\web\cache" >nul 2>&1

echo "Готово! Кеш Metro очищено."
echo "Тепер можна запустити Metro bundler заново командою 'npx expo start'."

pause