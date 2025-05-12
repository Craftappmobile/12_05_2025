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

// Виправлення синтаксичних помилок в імпортах React
function fixReactImportSyntax(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;
  
  // Виправлення зайвих ком в імпортах React
  const commaRegex = /import\s+React,\s*{\s*,\s*/g;
  if (commaRegex.test(content)) {
    content = content.replace(commaRegex, 'import React, { ');
    fixed = true;
  }
  
  // Виправлення інших потенційних проблем з імпортами
  const multipleCommasRegex = /,\s*,/g;
  if (multipleCommasRegex.test(content)) {
    content = content.replace(multipleCommasRegex, ',');
    fixed = true;
  }
  
  // Виправлення неправильно закритих дужок в імпортах
  const bracketRegex = /{\s*([^}]*)\s*,\s*}/g;
  if (bracketRegex.test(content)) {
    content = content.replace(bracketRegex, (match, group) => {
      // Видалення завершальної коми перед закриваючою дужкою
      return `{ ${group.trim().replace(/,$/, '')} }`;
    });
    fixed = true;
  }
  
  if (fixed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed syntax in: ${filePath}`);
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
    if (fixReactImportSyntax(file)) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed ${fixedCount} files with React import syntax issues`);
}

main();