/**
 * u0421u043au0440u0438u043fu0442 u0434u043bu044f u043fu0435u0440u0435u0432u0456u0440u043au0438 u0456u043cu043fu043eu0440u0442u0456u0432 Text u043au043eu043cu043fu043eu043du0435u043du0442u0430 u0432 u043fu0440u043eu0435u043au0442u0456
 */

const fs = require('fs');
const path = require('path');

// u0414u0438u0440u0435u043au0442u043eu0440u0456u0457, u044fu043au0456 u0442u0440u0435u0431u0430 u043fu0440u043eu043fu0443u0441u0442u0438u0442u0438
const excludeDirs = ['node_modules', '.git', '.expo', 'android', 'ios', 'build', 'dist'];

// u0420u0435u043au0443u0440u0441u0438u0432u043du0438u0439 u043fu043eu0448u0443u043a u0444u0430u0439u043bu0456u0432
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    // u041fu0440u043eu043fu0443u0441u043au0430u0454u043cu043e u0432u0438u043au043bu044eu0447u0435u043du0456 u0434u0438u0440u0435u043au0442u043eu0440u0456u0457
    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      walkDir(filePath, callback);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
      callback(filePath);
    }
  });
}

// u041fu0435u0440u0435u0432u0456u0440u043au0430 u0456u043cu043fu043eu0440u0442u0456u0432 Text u0437 UI u043au043eu043cu043fu043eu043du0435u043du0442u0456u0432
function checkTextImport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // u0428u0443u043au0430u0454u043cu043e u0456u043cu043fu043eu0440u0442 Text u0437 UI u043au043eu043cu043fu043eu043du0435u043du0442u0456u0432
    const importFromUI = content.match(/import\s+{[^}]*Text[^}]*}\s+from\s+['"].*\/components\/ui['"];/);
    
    if (importFromUI) {
      console.log(`u0417u043du0430u0439u0434u0435u043du043e u043fu0440u043eu0431u043bu0435u043cu043du0438u0439 u0456u043cu043fu043eu0440u0442 u0432 u0444u0430u0439u043bu0456: ${filePath}`);
      console.log(`  u0406u043cu043fu043eu0440u0442: ${importFromUI[0]}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u043eu0431u0440u043eu0431u0446u0456 u0444u0430u0439u043bu0443 ${filePath}: ${err.message}`);
    return false;
  }
}

// u0413u043eu043bu043eu0432u043du0430 u0444u0443u043du043au0446u0456u044f u043fu0435u0440u0435u0432u0456u0440u043au0438
console.log('u041fu043eu0448u0443u043a u0444u0430u0439u043bu0456u0432 u0437 u043fu0440u043eu0431u043bu0435u043cu043du0438u043c u0456u043cu043fu043eu0440u0442u043eu043c Text u0437 UI u043au043eu043cu043fu043eu043du0435u043du0442u0456u0432...');

let problemFiles = 0;
walkDir(path.join(__dirname, 'src'), (filePath) => {
  if (checkTextImport(filePath)) {
    problemFiles++;
  }
});

if (problemFiles > 0) {
  console.log(`\nu0417u043du0430u0439u0434u0435u043du043e ${problemFiles} u0444u0430u0439u043bu0456u0432 u0437 u043fu0440u043eu0431u043bu0435u043cu043du0438u043c u0456u043cu043fu043eu0440u0442u043eu043c.`);
  console.log('u0412u0430u043c u043fu043eu0442u0440u0456u0431u043du043e u0432u0438u043fu0440u0430u0432u0438u0442u0438 u0456u043cu043fu043eu0440u0442 u0432 u0446u0438u0445 u0444u0430u0439u043bu0430u0445 u043du0430:');
  console.log('import { Button /* u0442u0430 u0456u043du0448u0456 u043au043eu043cu043fu043eu043du0435u043du0442u0438 */ } from \'../../components/ui\';');
  console.log('import Text from \'../../components/Text\';');
} else {
  console.log('\nu041fu0440u043eu0431u043bu0435u043cu043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432 u043du0435 u0437u043du0430u0439u0434u0435u043du043e.');
}

console.log('\nu041fu0435u0440u0435u0432u0456u0440u043au0430 u0437u0430u0432u0435u0440u0448u0435u043du0430.');