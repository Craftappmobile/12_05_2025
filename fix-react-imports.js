const fs = require('fs');
const path = require('path');

// Рекурсивний пошук всіх TypeScript файлів
function findTypeScriptFiles(dir) {
  let results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results = results.concat(findTypeScriptFiles(fullPath));
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

// Виправлення дублюючих імпортів React
function fixReactImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Регулярний вираз для виявлення різних форм дублюючих імпортів
  const regex = /import\s+React(\s*,\s*{[^}]*})?\s+from\s+['"]react['"];\s*import\s+React/g;
  
  if (regex.test(content)) {
    // Заміна дублюючих імпортів
    content = content.replace(/import\s+React(\s*,\s*{[^}]*})?\s+from\s+['"]react['"];\s*import\s+React(\s*,\s*{[^}]*})?\s+from\s+['"]react['"];/g, 
      (match, group1, group2) => {
        // Об'єднання імпортів, якщо вони містять деструктуризацію
        if (group1 && group2) {
          // Видалення дублікатів у деструктуризованих імпортах
          const imports1 = group1.trim().replace(/[\s{}]/g, '').split(',');
          const imports2 = group2.trim().replace(/[\s{}]/g, '').split(',');
          const uniqueImports = [...new Set([...imports1, ...imports2])].join(', ');
          return `import React, { ${uniqueImports} } from 'react';`;
        } else if (group1) {
          return `import React${group1} from 'react';`;
        } else if (group2) {
          return `import React${group2} from 'react';`;
        } else {
          return `import React from 'react';`;
        }
      }
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Головна функція
function main() {
  const srcDir = path.join(__dirname, 'src');
  const files = findTypeScriptFiles(srcDir);
  console.log(`Found ${files.length} TypeScript files`);
  
  let fixedCount = 0;
  for (const file of files) {
    if (fixReactImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} files with duplicate React imports`);
}

main();