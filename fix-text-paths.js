/**
 * u0421u043au0440u0438u043fu0442 u0434u043bu044f u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0448u043bu044fu0445u0456u0432 u0456u043cu043fu043eu0440u0442u0443 Text
 */

const fs = require('fs');
const path = require('path');

// u041cu0430u043fu0430 u0444u0430u0439u043bu0456u0432 u0456 u043fu0440u0430u0432u0438u043bu044cu043du0438u0445 u0448u043bu044fu0445u0456u0432
const filePathMap = {
  'src/screens/projects/CalculationDetails.tsx': {
    from: "import Text from '../../../components/Text';",
    to: "import Text from '../../components/Text';"
  },
  'src/screens/projects/CalculatorsList.tsx': {
    from: "import Text from '../../../components/Text';",
    to: "import Text from '../../components/Text';"
  },
  'src/screens/projects/CreateProjectModal.tsx': {
    from: "import Text from '../../../components/Text';",
    to: "import Text from '../../components/Text';"
  },
  'src/screens/projects/EditProject.tsx': {
    from: "import Text from '../../../components/Text';",
    to: "import Text from '../../components/Text';"
  }
};

// u0424u0443u043du043au0446u0456u044f u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f u0448u043bu044fu0445u0456u0432
function fixPaths() {
  console.log('u0412u0438u043fu0440u0430u0432u043bu044fu0454u043cu043e u0448u043bu044fu0445u0438 u0456u043cu043fu043eu0440u0442u0443 Text...');
  
  let fixedCount = 0;
  
  for (const filePath in filePathMap) {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`u0424u0430u0439u043b u043du0435 u0437u043du0430u0439u0434u0435u043du043e: ${fullPath}`);
      continue;
    }
    
    try {
      // u0427u0438u0442u0430u0454u043cu043e u0432u043cu0456u0441u0442 u0444u0430u0439u043bu0443
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // u0417u0430u043cu0456u043du044eu0454u043cu043e u0440u044fu0434u043eu043a u0456u043cu043fu043eu0440u0442u0443
      const { from, to } = filePathMap[filePath];
      
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
  
  console.log(`\nu0412u0438u043fu0440u0430u0432u043bu0435u043du043e ${fixedCount} u0444u0430u0439u043bu0456u0432.`);
}

// u0417u0430u043fu0443u0441u043au0430u0454u043cu043e u0432u0438u043fu0440u0430u0432u043bu0435u043du043du044f
fixPaths();

console.log('\nu0413u043eu0442u043eu0432u043e! u0422u0435u043fu0435u0440 u0437u0430u043fu0443u0441u0442u0456u0442u044c:');
console.log('fix-and-restart.bat');