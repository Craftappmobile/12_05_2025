const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, 'src');

// Регулярний вираз для пошуку JSX в коді
const jsxPattern = /<[A-Z][\w.]*\s*(?:[^<>"']*|"[^"]*"|'[^']*')*\s*\/?>|<\/[A-Z][\w.]*>/;

// Регулярний вираз для виключення false positive спрацьовувань (порівняння, generics і т.д.)
const falsePositivePattern = /<[\w\s]*[\w.]+>[\w\s]*\([^<>]*<|<\/(\w+)>|<[\w\s.]+>[\w\s]*=|extends\s+[\w\s.<>{}]*>|type\s+[\w\s.<>{}=|&]*|interface\s+[\w\s.<>{}=|&]*>|const\s+[\w\s.<>{}=|&]*>/;

// Функція для рекурсивного пошуку файлів у директорії
function findTsFilesWithJsx(dir) {
  const files = fs.readdirSync(dir);
  const results = [];

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Рекурсивно перевіряємо піддиректорії
      results.push(...findTsFilesWithJsx(filePath));
    } else if (
      file.endsWith('.ts') && 
      !file.endsWith('.d.ts') && 
      !file.endsWith('.test.ts')
    ) {
      // Перевіряємо тільки .ts файли, виключаємо .d.ts (definition) та тести
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (jsxPattern.test(content) && !falsePositivePattern.test(content)) {
        const lines = content.split('\n');
        const matchedLines = [];
        
        // Знаходимо всі рядки, які містять JSX
        lines.forEach((line, index) => {
          if (jsxPattern.test(line) && !falsePositivePattern.test(line)) {
            matchedLines.push({
              lineNumber: index + 1,
              line: line.trim()
            });
          }
        });
        
        if (matchedLines.length > 0) {
          results.push({
            file: filePath.replace(__dirname + path.sep, ''),
            matchedLines
          });
        }
      }
    }
  });

  return results;
}

// Основна логіка
const jsxInTsFiles = findTsFilesWithJsx(rootDir);

if (jsxInTsFiles.length === 0) {
  console.log('\x1b[32m%s\x1b[0m', '✓ Немає JSX в .ts файлах. Все добре!');
} else {
  console.log('\x1b[31m%s\x1b[0m', `⚠ Знайдено ${jsxInTsFiles.length} .ts файлів з JSX-синтаксисом:`);
  
  jsxInTsFiles.forEach(item => {
    console.log('\x1b[33m%s\x1b[0m', `\nФайл: ${item.file}`);
    
    item.matchedLines.forEach(line => {
      console.log(`  Рядок ${line.lineNumber}: ${line.line}`);
    });
    
    console.log('\x1b[36m%s\x1b[0m', '  Рекомендації:');
    console.log('  1. Перейменуйте файл з .ts на .tsx');
    console.log('  2. АБО замініть JSX на React.createElement()\n');
  });
}