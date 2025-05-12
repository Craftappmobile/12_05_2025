/**
 * Скрипт для перевірки наявності displayName у всіх компонентах React
 * 
 * Запуск: node check-displayname.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфігурація
const config = {
  // Папки для сканування
  directories: ['src/screens', 'src/components', 'src/navigation'],
  // Розширення файлів для перевірки
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  // Патерни для пошуку компонентів без displayName
  patterns: [
    // Функціональні компоненти
    {
      regex: /(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+([A-Z][A-Za-z0-9]+)\s*=\s*(?:\(.*?\)|.*?)\s*=>\s*{/g,
      displayNameRegex: /\1\.displayName\s*=/,
      type: 'Functional Component (Arrow)',
    },
    // Функціональні компоненти (функції)
    {
      regex: /(?:export\s+(?:default\s+)?)?function\s+([A-Z][A-Za-z0-9]+)\s*\(/g,
      displayNameRegex: /\1\.displayName\s*=/,
      type: 'Functional Component (Function)',
    },
    // forwardRef компоненти
    {
      regex: /(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+([A-Z][A-Za-z0-9]+)\s*=\s*(?:React\.)?forwardRef/g,
      displayNameRegex: /\1\.displayName\s*=/,
      type: 'ForwardRef Component',
    },
    // React.memo компоненти
    {
      regex: /(?:export\s+(?:default\s+)?)?(?:const|let|var)\s+([A-Z][A-Za-z0-9]+)\s*=\s*(?:React\.)?memo/g,
      displayNameRegex: /\1\.displayName\s*=/,
      type: 'Memo Component',
    },
  ],
};

/**
 * Отримує всі файли з вказаними розширеннями в директорії
 */
function getAllFiles(dir, extensions = []) {
  let files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, extensions));
      } else if (extensions.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Помилка при скануванні директорії ${dir}:`, error.message);
  }
  
  return files;
}

/**
 * Перевіряє файл на наявність компонентів без displayName
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Перевіряємо кожен патерн
    for (const pattern of config.patterns) {
      const { regex, displayNameRegex, type } = pattern;
      
      // Пошук всіх співпадінь
      let match;
      const componentRegex = new RegExp(regex.source, 'g');
      
      while ((match = componentRegex.exec(content)) !== null) {
        const componentName = match[1];
        const displayNamePattern = new RegExp(`${componentName}\.displayName\s*=`, 'g');
        
        // Якщо не знайдено displayName
        if (!displayNamePattern.test(content) && !new RegExp(`class\s+${componentName}\s+extends\s+React\.Component\s*{[^}]*static\s+displayName\s*=`, 's').test(content)) {
          issues.push({
            componentName,
            type,
            line: content.substring(0, match.index).split('\n').length,
          });
        }
      }
    }
    
    return issues;
  } catch (error) {
    console.error(`Помилка при перевірці файлу ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Головна функція перевірки
 */
function runCheck() {
  // Отримуємо всі файли для перевірки
  let allFiles = [];
  for (const dir of config.directories) {
    const fullDir = path.join(process.cwd(), dir);
    allFiles = allFiles.concat(getAllFiles(fullDir, config.extensions));
  }
  
  console.log(`\n\x1b[1mПеревірка displayName у ${allFiles.length} файлах\x1b[0m\n`);
  
  let totalIssues = 0;
  let filesWithIssues = 0;
  
  // Перевіряємо кожен файл
  for (const file of allFiles) {
    const issues = checkFile(file);
    
    if (issues.length > 0) {
      filesWithIssues++;
      totalIssues += issues.length;
      
      // Відносний шлях для зручності
      const relativePath = path.relative(process.cwd(), file);
      console.log(`\x1b[33m${relativePath}\x1b[0m:`);
      
      // Виводимо всі проблеми у файлі
      for (const issue of issues) {
        console.log(`  Рядок ${issue.line}: \x1b[31mКомпонент ${issue.componentName} (${issue.type}) не має displayName\x1b[0m`);
        console.log(`  Додайте: ${issue.componentName}.displayName = '${issue.componentName}';\n`);
      }
    }
  }
  
  // Загальний результат
  if (totalIssues > 0) {
    console.log(`\x1b[31m\x1b[1mЗнайдено ${totalIssues} проблем з displayName у ${filesWithIssues} файлах\x1b[0m`);
    console.log('\x1b[33mЦі проблеми можуть викликати помилки в Bridgeless режимі!\x1b[0m\n');
    
    // Поради
    console.log('\x1b[36mПоради для виправлення:\x1b[0m');
    console.log('1. Додайте displayName до всіх функціональних компонентів:');
    console.log('   const MyComponent = () => { /* ... */ };');
    console.log('   MyComponent.displayName = \'MyComponent\';');
    console.log('');
    console.log('2. Для проблемних компонентів використовуйте HOC:');
    console.log('   import { createSafeNavigationComponent } from \'./src/utils/createSafeNavigationComponent\';');
    console.log('   export default createSafeNavigationComponent(MyComponent, \'MyComponent\');');
    console.log('');
    console.log('3. Або перетворіть компонент на клас-компонент:');
    console.log('   class MyComponent extends React.Component {');
    console.log('     static displayName = \'MyComponent\';');
    console.log('     /* ... */');
    console.log('   }');
  } else {
    console.log('\x1b[32m\x1b[1mУспіх! Усі компоненти мають правильні displayName\x1b[0m\n');
  }
  
  return totalIssues;
}

// Запуск перевірки
const issues = runCheck();

// Встановлюємо код завершення: 0 - усі в порядку, 1 - є проблеми
process.exit(issues > 0 ? 1 : 0);