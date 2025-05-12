/**
 * Скрипт для виправлення проблем з React Navigation та Bridgeless режимом
 */

const fs = require('fs');
const path = require('path');

// Функція для перевірки на помилки з displayName
console.log('Перевірка на помилки displayName в React Navigation...');

// Шлях до node_modules
const basePath = path.join(__dirname, 'node_modules');

// Шляхи до файлів, які треба перевірити
const filesToCheck = [
  path.join(basePath, '@react-navigation/native/lib/module/NavigationStateContext.js'),
  path.join(basePath, '@react-navigation/native/lib/module/NavigationHelpersContext.js'),
  path.join(basePath, '@react-navigation/core/lib/module/NavigationStateContext.js'),
  path.join(basePath, '@react-navigation/core/lib/module/NavigationHelpersContext.js')
];

// Функція виправлення файлу
function fixDisplayNameInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Файл не знайдено: ${filePath}`);
    return false;
  }
  
  // Читаємо вміст файлу
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Шукаємо проблемний код, який викликає помилку з displayName
  if (content.includes('context.displayName = ')) {
    console.log(`Знайдено проблемний код з displayName в ${path.basename(filePath)}. Виправляю...`);
    
    // Заміна проблемного коду на більш безпечну версію
    const fixedContent = content.replace(
      'context.displayName = name;',
      'if (context && typeof context === "object") { context.displayName = name; }'
    );
    
    // Зберігаємо змінений файл
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    return true;
  }
  
  return false;
}

// Перевіряємо і виправляємо всі файли
let fixedCount = 0;
for (const file of filesToCheck) {
  if (fixDisplayNameInFile(file)) {
    fixedCount++;
  }
}

if (fixedCount > 0) {
  console.log(`Виправлено ${fixedCount} файлів. Тепер перезапустіть додаток, очистивши кеш.`);
} else {
  console.log('Проблемний код не знайдено або вже виправлено.');
}

// Оновлюємо навігатор
console.log('Перевірка навігатора...');

// Шлях до файлу навігатора
const navigatorPath = path.join(__dirname, 'src', 'navigation', 'EnhancedAppNavigator.tsx');

if (fs.existsSync(navigatorPath)) {
  console.log('Навігатор знайдено. Перевірка конфігурації...');
  
  // Читаємо вміст файлу
  const content = fs.readFileSync(navigatorPath, 'utf8');
  
  // Перевірка, чи навігатор використовує StableImprovedProjectDetails
  if (content.includes('component={StableImprovedProjectDetails}')) {
    console.log('Навігатор вже налаштовано на використання StableImprovedProjectDetails.');
  } else {
    console.log('Оновлення навігатора для використання StableImprovedProjectDetails...');
    
    // Замінюємо компонент на StableImprovedProjectDetails
    const updatedContent = content.replace(
      /<Stack.Screen[\s\S]*?name="ProjectDetails"[\s\S]*?component=\{[^\}]+\}[\s\S]*?options=\{\{[\s\S]*?\}\}[\s\S]*?\/>/,
      `<Stack.Screen 
      name="ProjectDetails" 
      component={StableImprovedProjectDetails}
      options={{ 
        title: "\Д\е\т\а\л\і \п\р\о\є\к\т\у",
        // \П\р\и\х\о\в\у\є\м\о \с\т\а\н\д\а\р\т\н\и\й \з\а\г\о\л\о\в\о\к, \б\о \в\и\к\о\р\и\с\т\о\в\у\є\м\о \в\л\а\с\н\и\й
        headerShown: false
      }}
    />`
    );
    
    // Перевіряємо, чи були зміни
    if (content !== updatedContent) {
      // Записуємо оновлений вміст назад у файл
      fs.writeFileSync(navigatorPath, updatedContent, 'utf8');
      console.log('Навігатор успішно оновлено!');
    } else {
      console.log('Не вдалося оновити навігатор. Перевірте файл вручну.');
    }
  }
} else {
  console.log('Не знайдено файл навігатора.');
}

console.log('Виправлення завершено. Перезапустіть додаток з очищеним кешем.');