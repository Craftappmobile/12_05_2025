/**
 * u0421u043au0440u0438u043fu0442 u0434u043bu044f u0430u0432u0442u043eu043cu0430u0442u0438u0447u043du043eu0433u043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0456u043cu043fu043eu0440u0442u0456u0432 Text u0432 u043fu0440u043eu0431u043bu0435u043cu043du0438u0445 u0444u0430u0439u043bu0430u0445
 */

const fs = require('fs');
const path = require('path');

// u041cu0430u0441u0438u0432 u043fu0440u043eu0431u043bu0435u043cu043du0438u0445 u0444u0430u0439u043bu0456u0432, u0432u0438u044fu0432u043bu0435u043du0438u0445 u0441u043au0440u0438u043fu0442u043eu043c check-text-import.js
const filesToFix = [
  'src/screens/projects/CalculationDetails.tsx',
  'src/screens/projects/CalculatorsList.tsx',
  'src/screens/projects/ClassCalculationsTab.tsx',
  'src/screens/projects/ClassNotesTab.tsx',
  'src/screens/projects/CreateProjectModal.tsx',
  'src/screens/projects/EditProject.tsx',
  'src/screens/projects/ProjectDetails.tsx',
  'src/screens/projects/ProjectNotesTab.new.tsx',
  'src/screens/projects/ProjectNotesTab.tsx',
  'src/screens/projects/SimpleProjectCalculationsTab.tsx',
  'src/screens/projects/StableBridgelessProjectDetails.tsx'
];

// u0414u043eu043fu043eu043cu0456u0436u043du0430 u0444u0443u043du043au0446u0456u044f u0434u043bu044f u0432u0438u0437u043du0430u0447u0435u043du043du044f u0448u043bu044fu0445u0443 u0434u043e Text u043au043eu043cu043fu043eu043du0435u043du0442u0430
function getTextImportPath(filePath) {
  // u0412u0438u0437u043du0430u0447u0430u0454u043cu043e u043au0456u043bu044cu043au0456u0441u0442u044c u0440u0456u0432u043du0456u0432 u0432u0433u043bu0438u0431u0438u043du0443
  const depth = filePath.split('/').length - 3; // src/screens/projects = 3 u0440u0456u0432u043du0456
  
  // u042fu043au0449u043e u0432 u0448u043bu044fu0445u0443 u0454 u0431u0456u043bu044cu0448u0435 u0440u0456u0432u043du0456u0432, u0442u043e u0434u043eu0434u0430u0454u043cu043e u0434u043eu0434u0430u0442u043au043eu0432u0456 "../"
  const pathPrefix = depth > 0 ? '../'.repeat(depth) : '';
  
  return `${pathPrefix}../../components/Text`;
}

// u0424u0443u043du043au0446u0456u044f u0434u043bu044f u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0456u043cu043fu043eu0440u0442u0456u0432 u0432 u043eu043au0440u0435u043cu043eu043cu0443 u0444u0430u0439u043bu0456
function fixImportsInFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`u0424u0430u0439u043b u043du0435 u0437u043du0430u0439u0434u0435u043du043e: ${fullPath}`);
    return false;
  }
  
  try {
    // u0427u0438u0442u0430u0454u043cu043e u0432u043cu0456u0441u0442 u0444u0430u0439u043bu0443
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // u0412u0438u0437u043du0430u0447u0430u0454u043cu043e u0448u043bu044fu0445 u0434u043e Text u043au043eu043cu043fu043eu043du0435u043du0442u0430
    const textImportPath = getTextImportPath(filePath);
    
    // u0428u0443u043au0430u0454u043cu043e u0440u0456u0437u043du0456 u0432u0430u0440u0456u0430u043du0442u0438 u0456u043cu043fu043eu0440u0442u0443 Text u0437 UI u043au043eu043cu043fu043eu043du0435u043du0442u0456u0432
    
    // u0412u0430u0440u0456u0430u043du0442 1: import { Text } from '../components/ui';
    let match = content.match(/import\s+{\s*Text\s*}\s+from\s+(['"]).+\/components\/ui\1;/);
    if (match) {
      content = content.replace(
        match[0],
        `import Text from '${textImportPath}';`
      );
    }
    
    // u0412u0430u0440u0456u0430u043du0442 2: import { Text, Something } from '../components/ui';
    match = content.match(/import\s+{\s*Text\s*,\s*([^}]+)\s*}\s+from\s+(['"]).+\/components\/ui\2;/);
    if (match) {
      const otherImports = match[1].trim();
      content = content.replace(
        match[0],
        `import { ${otherImports} } from ${match[2]}../../components/ui${match[2]};\nimport Text from '${textImportPath}';`
      );
    }
    
    // u0412u0430u0440u0456u0430u043du0442 3: import { Something, Text } from '../components/ui';
    match = content.match(/import\s+{\s*([^}]+)\s*,\s*Text\s*}\s+from\s+(['"]).+\/components\/ui\2;/);
    if (match) {
      const otherImports = match[1].trim();
      content = content.replace(
        match[0],
        `import { ${otherImports} } from ${match[2]}../../components/ui${match[2]};\nimport Text from '${textImportPath}';`
      );
    }
    
    // u0412u0430u0440u0456u0430u043du0442 4: import { Something, Text, OtherThing } from '../components/ui';
    match = content.match(/import\s+{\s*([^}]+)\s*,\s*Text\s*,\s*([^}]+)\s*}\s+from\s+(['"]).+\/components\/ui\3;/);
    if (match) {
      const beforeImports = match[1].trim();
      const afterImports = match[2].trim();
      content = content.replace(
        match[0],
        `import { ${beforeImports}, ${afterImports} } from ${match[3]}../../components/ui${match[3]};\nimport Text from '${textImportPath}';`
      );
    }
    
    // u0417u0430u043fu0438u0441u0443u0454u043cu043e u0432u0438u043fu0440u0430u0432u043bu0435u043du0438u0439 u0444u0430u0439u043b
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`u0424u0430u0439u043b u0443u0441u043fu0456u0448u043du043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043e: ${filePath}`);
    return true;
  } catch (err) {
    console.error(`u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u0432u0438u043fu0440u0430u0432u043bu0435u043du043du0456 u0444u0430u0439u043bu0443 ${filePath}:`, err);
    return false;
  }
}

// u041cu0430u043du0443u0430u043bu044cu043du0435 u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0434u043bu044f u043au043eu0436u043du043eu0433u043e u0444u0430u0439u043bu0443
function fixSpecificFiles() {
  // u0412u0438u043fu0440u0430u0432u043bu044fu0454u043cu043e u043au043eu0436u0435u043d u0444u0430u0439u043b u043eu043au0440u0435u043cu043e
  const filesToFixMap = {
    'src/screens/projects/CalculationDetails.tsx': {
      from: "import { Text, Button } from '../../../components/ui';",
      to: "import { Button } from '../../../components/ui';\nimport Text from '../../../components/Text';"
    },
    'src/screens/projects/CalculatorsList.tsx': {
      from: "import { Text } from '../../../components/ui';",
      to: "import Text from '../../../components/Text';"
    },
    'src/screens/projects/ClassCalculationsTab.tsx': {
      from: "import { Text, Button } from '../../components/ui';",
      to: "import { Button } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/ClassNotesTab.tsx': {
      from: "import { Text, Button } from '../../components/ui';",
      to: "import { Button } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/CreateProjectModal.tsx': {
      from: "import { Text, Button } from '../../../components/ui';",
      to: "import { Button } from '../../../components/ui';\nimport Text from '../../../components/Text';"
    },
    'src/screens/projects/EditProject.tsx': {
      from: "import { Text, Button } from '../../../components/ui';",
      to: "import { Button } from '../../../components/ui';\nimport Text from '../../../components/Text';"
    },
    'src/screens/projects/ProjectDetails.tsx': {
      from: "import { Text, Button } from '../../components/ui';",
      to: "import { Button } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/ProjectNotesTab.new.tsx': {
      from: "import { Text, Button, ShareMenu } from '../../components/ui';",
      to: "import { Button, ShareMenu } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/ProjectNotesTab.tsx': {
      from: "import { Text, Button, ShareMenu } from '../../components/ui';",
      to: "import { Button, ShareMenu } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/SimpleProjectCalculationsTab.tsx': {
      from: "import { Text, Button } from '../../components/ui';",
      to: "import { Button } from '../../components/ui';\nimport Text from '../../components/Text';"
    },
    'src/screens/projects/StableBridgelessProjectDetails.tsx': {
      from: "import { Text, Button } from '../../components/ui';",
      to: "import { Button } from '../../components/ui';\nimport Text from '../../components/Text';"
    }
  };
  
  console.log('\nu041fu043eu0447u0438u043du0430u0454u043cu043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u043au043eu043du043au0440u0435u0442u043du0438u0445 u0444u0430u0439u043bu0456u0432...\n');
  
  let fixedCount = 0;
  
  for (const filePath in filesToFixMap) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`u0424u0430u0439u043b u043du0435 u0437u043du0430u0439u0434u0435u043du043e: ${fullPath}`);
      continue;
    }
    
    try {
      // u0427u0438u0442u0430u0454u043cu043e u0432u043cu0456u0441u0442 u0444u0430u0439u043bu0443
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // u0417u0430u043cu0456u043du044eu0454u043cu043e u0440u044fu0434u043eu043a u0456u043cu043fu043eu0440u0442u0443
      const { from, to } = filesToFixMap[filePath];
      
      if (content.includes(from)) {
        content = content.replace(from, to);
        
        // u0417u0431u0435u0440u0456u0433u0430u0454u043cu043e u0437u043cu0456u043du0435u043du0438u0439 u0444u0430u0439u043b
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`u0424u0430u0439u043b u0443u0441u043fu0456u0448u043du043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043e: ${filePath}`);
        fixedCount++;
      } else {
        console.log(`u0412 u0444u0430u0439u043bu0456 ${filePath} u043du0435 u0437u043du0430u0439u0434u0435u043du043e u043eu0447u0456u043au0443u0432u0430u043du0438u0439 u0440u044fu0434u043eu043a u0456u043cu043fu043eu0440u0442u0443.`);
      }
    } catch (err) {
      console.error(`u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u0432u0438u043fu0440u0430u0432u043bu0435u043du043du0456 u0444u0430u0439u043bu0443 ${filePath}:`, err);
    }
  }
  
  console.log(`\nu0423u0441u043fu0456u0448u043du043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043e ${fixedCount} u0437 ${Object.keys(filesToFixMap).length} u0444u0430u0439u043bu0456u0432.`);
}

// u0417u0430u043fu0443u0441u043au0430u0454u043cu043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0444u0430u0439u043bu0456u0432
console.log('u0417u0430u043fu0443u0441u043au0430u0454u043cu043e u0430u0432u0442u043eu043cu0430u0442u0438u0447u043du0435 u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0456u043cu043fu043eu0440u0442u0456u0432 Text...\n');

// u0412u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0454u043cu043e u0444u0443u043du043au0446u0456u044e u0434u043bu044f u043cu0430u043du0443u0430u043bu044cu043du043eu0433u043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0444u0430u0439u043bu0456u0432
fixSpecificFiles();

console.log('\nu0412u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0437u0430u0432u0435u0440u0448u0435u043du043e. u0422u0435u043fu0435u0440 u0437u0430u043fu0443u0441u0442u0456u0442u044c:');
console.log('npm run start:clear');
console.log('u0430u0431u043e');
console.log('fix-and-restart.bat');