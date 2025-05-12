/**
 * Скрипт для аналізу дубльованого та невикористовуваного коду в проєкті "Розрахуй і В'яжи"
 */

const fs = require('fs');
const path = require('path');

// Шляхи для аналізу
const componentsPaths = [
  path.join(__dirname, '..', 'src', 'components'),
  path.join(__dirname, '..', 'components')
];

// Функція для збору файлів з однаковими іменами
function findDuplicatedComponentsByName() {
  const componentFiles = {};
  
  // Функція для обходу директорій та пошуку файлів
  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverseDir(filePath);
      } else if (stat.isFile() && (
        file.endsWith('.tsx') || 
        file.endsWith('.ts') || 
        file.endsWith('.jsx') || 
        file.endsWith('.js')
      )) {
        // Отримуємо назву компонента (без шляху та розширення)
        const componentName = path.parse(file).name.toLowerCase();
        
        if (!componentFiles[componentName]) {
          componentFiles[componentName] = [];
        }
        
        componentFiles[componentName].push(filePath);
      }
    });
  }
  
  // Обходимо всі директорії, які потрібно проаналізувати
  componentsPaths.forEach(dir => {
    traverseDir(dir);
  });
  
  // Знаходимо тільки дубльовані компоненти (більше одного файлу з однаковою назвою)
  const duplicatedComponents = Object.keys(componentFiles)
    .filter(componentName => componentFiles[componentName].length > 1)
    .reduce((result, componentName) => {
      result[componentName] = componentFiles[componentName];
      return result;
    }, {});
  
  return duplicatedComponents;
}

// Функція для пошуку файлів з бекапами та резервними копіями
function findBackupFiles() {
  const backupFiles = [];
  
  function traverseDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        traverseDir(filePath);
      } else if (stat.isFile() && (
        file.endsWith('.bak') || 
        file.endsWith('.old') || 
        file.endsWith('.new') || 
        file.endsWith('.backup') ||
        file.includes('.bak.') ||
        file.includes('.old.') ||
        file.includes('.new.')
      )) {
        backupFiles.push(filePath);
      }
    });
  }
  
  componentsPaths.forEach(dir => {
    traverseDir(dir);
  });
  
  return backupFiles;
}

// Функція для порівняння вмісту файлів на схожість
function compareFilesContent(filePath1, filePath2) {
  try {
    const content1 = fs.readFileSync(filePath1, 'utf8');
    const content2 = fs.readFileSync(filePath2, 'utf8');
    
    // Простий алгоритм порівняння - відсоток схожості
    const lines1 = content1.split('\n');
    const lines2 = content2.split('\n');
    
    const totalLines = Math.max(lines1.length, lines2.length);
    let matchingLines = 0;
    
    for (let i = 0; i < lines1.length; i++) {
      if (i < lines2.length && lines1[i].trim() === lines2[i].trim()) {
        matchingLines++;
      }
    }
    
    return Math.round((matchingLines / totalLines) * 100);
  } catch (error) {
    console.error(`Помилка при порівнянні файлів ${filePath1} і ${filePath2}:`, error.message);
    return 0;
  }
}

// Основна функція для аналізу та виводу результатів
async function analyzeProject() {
  console.log('Аналіз дубльованого коду в проєкті "Розрахуй і В\'яжи"');
  console.log('---------------------------------------------------');
  
  // 1. Знаходимо дубльовані компоненти за назвами
  const duplicatedComponents = findDuplicatedComponentsByName();
  console.log('\n1. Дубльовані компоненти (за назвою файлу):');
  console.log('---------------------------------------------------');
  
  Object.keys(duplicatedComponents).forEach(componentName => {
    const files = duplicatedComponents[componentName];
    console.log(`\nКомпонент: ${componentName}`);
    
    // Виводимо шляхи до файлів та порівнюємо їх вміст
    files.forEach((file, index) => {
      console.log(`   [${index + 1}] ${file}`);
      
      // Порівнюємо поточний файл з наступними
      for (let i = index + 1; i < files.length; i++) {
        const similarityPercentage = compareFilesContent(file, files[i]);
        console.log(`       - ${similarityPercentage}% схожості з файлом [${i + 1}]`);
      }
    });
  });
  
  // 2. Знаходимо бекап файли, які, можливо, можна видалити
  const backupFiles = findBackupFiles();
  console.log('\n\n2. Знайдені бекап/резервні файли:');
  console.log('---------------------------------------------------');
  
  backupFiles.forEach(file => {
    console.log(`   ${file}`);
    
    // Шукаємо оригінальний файл для порівняння
    const originalPath = file.replace(/\.bak|\.old|\.new|\.backup/g, '');
    if (fs.existsSync(originalPath)) {
      const similarityPercentage = compareFilesContent(file, originalPath);
      console.log(`       - ${similarityPercentage}% схожості з оригінальним файлом ${originalPath}`);
    }
  });
  
  // 3. Додаткові рекомендації
  console.log('\n\n3. Рекомендації:');
  console.log('---------------------------------------------------');
  console.log(`- Знайдено ${Object.keys(duplicatedComponents).length} дубльованих компонентів за назвою`);
  console.log(`- Знайдено ${backupFiles.length} бекап/резервних файлів`);
  console.log('- Рекомендується провести рефакторинг для усунення дублювання');
}

// Запускаємо аналіз
analyzeProject().catch(error => {
  console.error('Помилка при аналізі проєкту:', error);
});