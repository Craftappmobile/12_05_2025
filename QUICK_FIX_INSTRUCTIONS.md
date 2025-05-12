# Швидкі інструкції з виправлення помилки Bridgeless

## Кроки для виправлення помилки `Cannot read property 'displayName' of undefined`

### Варіант 1: Використання автоматичного скрипту

1. Відкрийте командний рядок (cmd) або PowerShell
2. Перейдіть до директорії проєкту:
   ```
   cd C:\Users\Admin\Workspace\app
   ```
3. Запустіть скрипт фіксу:
   - Для CMD: `fix-bridgeless.bat`
   - Для PowerShell: `.\fix-bridgeless.bat`
4. Через 5 секунд відкрийте нове вікно терміналу і виконайте:
   ```
   npm run android
   ```

### Варіант 2: Покрокові інструкції

#### Крок 1: Очистіть кеш Watermelon та Metro

```cmd
cd C:\Users\Admin\Workspace\app

rmdir /s /q .watermelon
rmdir /s /q .expo
```

#### Крок 2: Запустіть Metro в Bridgeless режимі

```cmd
npx expo start --no-dev --minify --clear --no-bundler
```

#### Крок 3: Запустіть додаток на пристрої

Відкрийте новий термінал і виконайте:

```cmd
cd C:\Users\Admin\Workspace\app
npm run android
```

## Примітки

- Якщо проблема залишається, перегляньте файл `BRIDGELESS_FIXES.md` для детальних пояснень.
- Додаткова документація з виправлення displayName знаходиться в файлі `DISPLAYNAME_FIX.md`.