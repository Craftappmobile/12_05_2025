/**
 * u0421u043au0440u0438u043fu0442 u0434u043bu044f u0432u0438u044fu0432u043bu0435u043du043du044f u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432 u0432 u043fu0440u043eu0454u043au0442u0456
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// u0424u0443u043du043au0446u0456u044f u0434u043bu044f u0437u0430u043fu0443u0441u043au0443 ESLint u0442u0430 u0437u0431u0435u0440u0435u0436u0435u043du043du044f u0440u0435u0437u0443u043bu044cu0442u0430u0442u0456u0432
function runESLintAndSaveReport() {
  try {
    const reportFile = path.join(__dirname, '..', 'eslint-report.txt');
    
    // u0417u0430u043fu0443u0441u043au0430u0454u043cu043e ESLint u0442u0430 u0437u0431u0435u0440u0456u0433u0430u0454u043cu043e u0432u0438u0432u0456u0434 u0432 u0444u0430u0439u043b
    console.log('u0417u0430u043fu0443u0441u043a ESLint u0434u043bu044f u043fu043eu0448u0443u043au0443 u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432...');
    execSync('npx eslint "src/**/*.{ts,tsx}" "components/**/*.{ts,tsx}" --no-fix > eslint-report.txt', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    return reportFile;
  } catch (error) {
    console.error('u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u0437u0430u043fu0443u0441u043au0443 ESLint:', error.message);
    return null;
  }
}

// u0424u0443u043du043au0446u0456u044f u0434u043bu044f u0430u043du0430u043bu0456u0437u0443 u0437u0432u0456u0442u0443 ESLint u0442u0430 u0432u0438u0434u0456u043bu0435u043du043du044f u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432
function analyzeESLintReport(reportFile) {
  if (!reportFile || !fs.existsSync(reportFile)) {
    console.error('u0424u0430u0439u043b u0437u0432u0456u0442u0443 ESLint u043du0435 u0437u043du0430u0439u0434u0435u043du043e.');
    return { unusedImports: [], unusedVars: [] };
  }
  
  try {
    const report = fs.readFileSync(reportFile, 'utf8');
    const lines = report.split('\n');
    
    const unusedImports = [];
    const unusedVars = [];
    
    let currentFile = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // u0412u0438u0437u043du0430u0447u0430u0454u043cu043e u043fu043eu0442u043eu0447u043du0438u0439 u0444u0430u0439u043b
      if (line.includes('C:\\Users\\Admin\\Workspace\\app\\')) {
        currentFile = line.trim();
      }
      
      // u0428u0443u043au0430u0454u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0456u043cu043fu043eu0440u0442u0438
      if (line.includes('unused-imports/no-unused-imports') && currentFile) {
        const match = line.match(/'([^']+)'\s+is\s+defined\s+but\s+never\s+used/);
        if (match) {
          const importName = match[1];
          unusedImports.push({ file: currentFile, importName });
        }
      }
      
      // u0428u0443u043au0430u0454u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0437u043cu0456u043du043du0456
      if (line.includes('@typescript-eslint/no-unused-vars') && currentFile) {
        const match = line.match(/'([^']+)'\s+is\s+defined\s+but\s+never\s+used/);
        if (match) {
          const varName = match[1];
          unusedVars.push({ file: currentFile, varName });
        }
      }
    }
    
    return { unusedImports, unusedVars };
  } catch (error) {
    console.error('u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u0430u043du0430u043bu0456u0437u0456 u0437u0432u0456u0442u0443 ESLint:', error.message);
    return { unusedImports: [], unusedVars: [] };
  }
}

// u0424u0443u043du043au0446u0456u044f u0434u043bu044f u0432u0438u0432u043eu0434u0443 u0440u0435u0437u0443u043bu044cu0442u0430u0442u0456u0432
function displayResults(results) {
  console.log('\n\nu0410u043du0430u043bu0456u0437 u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432 u0456 u0437u043cu0456u043du043du0438u0445 u0432 u043fu0440u043eu0454u043au0442u0456 "u0420u043eu0437u0440u0430u0445u0443u0439 u0456 u0412\'u044fu0436u0438"');
  console.log('------------------------------------------------------------------');
  
  // u0413u0440u0443u043fu0443u0454u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0456u043cu043fu043eu0440u0442u0438 u0437u0430 u0444u0430u0439u043bu0430u043cu0438
  const unusedImportsByFile = {};
  results.unusedImports.forEach(({ file, importName }) => {
    if (!unusedImportsByFile[file]) {
      unusedImportsByFile[file] = [];
    }
    unusedImportsByFile[file].push(importName);
  });
  
  // u0412u0438u0432u043eu0434u0438u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0456u043cu043fu043eu0440u0442u0438
  console.log('\n1. u041du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0456u043cu043fu043eu0440u0442u0438:');
  console.log('------------------------------------------------------------------');
  
  Object.keys(unusedImportsByFile).forEach(file => {
    console.log(`\nu0424u0430u0439u043b: ${file}`);
    unusedImportsByFile[file].forEach(importName => {
      console.log(`   - ${importName}`);
    });
  });
  
  // u0413u0440u0443u043fu0443u0454u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0437u043cu0456u043du043du0456 u0437u0430 u0444u0430u0439u043bu0430u043cu0438
  const unusedVarsByFile = {};
  results.unusedVars.forEach(({ file, varName }) => {
    if (!unusedVarsByFile[file]) {
      unusedVarsByFile[file] = [];
    }
    unusedVarsByFile[file].push(varName);
  });
  
  // u0412u0438u0432u043eu0434u0438u043cu043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0437u043cu0456u043du043du0456
  console.log('\n\n2. u041du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0456 u0437u043cu0456u043du043du0456:');
  console.log('------------------------------------------------------------------');
  
  Object.keys(unusedVarsByFile).forEach(file => {
    console.log(`\nu0424u0430u0439u043b: ${file}`);
    unusedVarsByFile[file].forEach(varName => {
      console.log(`   - ${varName}`);
    });
  });
  
  // u0412u0438u0432u043eu0434u0438u043cu043e u0441u0442u0430u0442u0438u0441u0442u0438u043au0443
  console.log('\n\n3. u0421u0442u0430u0442u0438u0441u0442u0438u043au0430:');
  console.log('------------------------------------------------------------------');
  console.log(`- u0417u043du0430u0439u0434u0435u043du043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0456u043cu043fu043eu0440u0442u0456u0432: ${results.unusedImports.length}`);
  console.log(`- u0417u043du0430u0439u0434u0435u043du043e u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u0445 u0437u043cu0456u043du043du0438u0445: ${results.unusedVars.length}`);
  console.log(`- u0417u0430u0433u0430u043bu044cu043du0430 u043au0456u043bu044cu043au0456u0441u0442u044c u0444u0430u0439u043bu0456u0432 u0437 u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du0438u043c u043au043eu0434u043eu043c: ${Object.keys(unusedImportsByFile).length + Object.keys(unusedVarsByFile).length}`);
  console.log('\nu0420u0435u043au043eu043cu0435u043du0434u0430u0446u0456u044f: u041fu0440u043eu0432u0435u0434u0456u0442u044c u0440u0435u0444u0430u043au0442u043eu0440u0438u043du0433 u0434u043bu044f u0432u0438u0434u0430u043bu0435u043du043du044f u043du0435u0432u0438u043au043eu0440u0438u0441u0442u043eu0432u0443u0432u0430u043du043eu0433u043e u043au043eu0434u0443 u0440u0430u0437u043eu043c u0437 u0434u0443u0431u043bu044cu043eu0432u0430u043du0438u043cu0438 u043au043eu043cu043fu043eu043du0435u043du0442u0430u043cu0438.');
}

// u0413u043eu043bu043eu0432u043du0430 u0444u0443u043du043au0446u0456u044f u0434u043bu044f u0437u0430u043fu0443u0441u043au0443 u0430u043du0430u043bu0456u0437u0443
async function main() {
  const reportFile = runESLintAndSaveReport();
  const results = analyzeESLintReport(reportFile);
  displayResults(results);
}

// u0417u0430u043fu0443u0441u043au0430u0454u043cu043e u0430u043du0430u043bu0456u0437
main().catch(error => {
  console.error('u041fu043eu043cu0438u043bu043au0430 u043fu0440u0438 u0432u0438u043au043eu043du0430u043du043du0456 u0430u043du0430u043bu0456u0437u0443:', error);
});