# Виправлення помилок displayName у Bridgeless режимі

Цей документ містить інструкції з виправлення поширених помилок `Cannot read property 'displayName' of undefined`, які виникають у Bridgeless режимі React Native.

## Причини помилки

Ця помилка є типовою для нового режиму Bridgeless у React Native. Основні причини її виникнення:

1. **Циклічні залежності** між компонентами та їхніми обгортками
2. **Відсутність явного displayName** у функціональних та класових компонентах
3. **Передача undefined** у деяких контекстах, особливо при рендерингу

## Як виправити помилку

### 1. Застосуйте правильну структуру для класових компонентів

```tsx
class MyComponent extends React.Component {
  // Явно встановіть displayName для класу
  static displayName = 'MyComponent';
  
  // Переконайтеся, що render метод має displayName
  render = Object.assign(
    function() {
      return (
        // Ваш JSX код
      ); 
    }.bind(this),
    { displayName: 'MyComponent.render' }
  );
}
```

### 2. Використовуйте ErrorBoundary для перехоплення помилок рендерингу

```tsx
class SafeComponent extends React.Component {
  static displayName = 'SafeComponent';
  
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { error: error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error:', error);
    console.error('ErrorInfo:', errorInfo);
  }
  
  render() {
    if (this.state.error) {
      return <FallbackComponent error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### 3. Уникайте циклічних залежностей

Замість:
```tsx
import { BridgelessSafeComponent } from '../utils/BridgelessCompat';

const Component = () => { /* ... */ };

export default BridgelessSafeComponent(Component, 'Component');
```

Використовуйте:
```tsx
const Component = () => { /* ... */ };

// Встановлюємо displayName безпосередньо
Component.displayName = 'Component';

export default Component;
```

### 4. Використовуйте динамічний імпорт для запобігання циклічних залежностей

```tsx
class Wrapper extends React.Component {
  static displayName = 'Wrapper';
  
  renderComponent() {
    // Динамічний імпорт
    const ActualComponent = require('./ActualComponent').default;
    
    try {
      return <ActualComponent {...this.props} />;
    } catch (err) {
      return <ErrorView error={err} />;
    }
  }
  
  render() {
    return this.renderComponent();
  }
}
```

### 5. Перевірка для Bridgeless режиму

```tsx
const isBridgelessMode = () => (global as any).__BRIDGELESS__ === true;

if (isBridgelessMode()) {
  // Використовуйте більш безпечну структуру компонентів
} else {
  // Звичайна структура компонентів
}
```

## Скрипт перевірки displayName

Створіть файл `check-displayname.js` у корені проєкту:

```js
const fs = require('fs');
const path = require('path');

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory() && file !== 'node_modules' && file !== 'build' && file !== '.git') {
      findTsxFiles(filePath, fileList);
    } else if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function checkDisplayNames(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const componentDefRegex = /(?:class|const|let|var)\s+([A-Z][A-Za-z0-9]*)\s*(?:extends\s+React\.Component|:|=)/g;
  const displayNameRegex = /([A-Z][A-Za-z0-9]*)\.displayName\s*=/g;
  
  let match;
  const components = [];
  const withDisplayName = [];
  
  while (match = componentDefRegex.exec(content)) {
    components.push(match[1]);
  }
  
  while (match = displayNameRegex.exec(content)) {
    withDisplayName.push(match[1]);
  }
  
  return { 
    filePath,
    components, 
    withDisplayName,
    missingDisplayName: components.filter(c => !withDisplayName.includes(c))
  };
}

function main() {
  const srcDir = path.join(__dirname, 'src');
  const tsxFiles = findTsxFiles(srcDir);
  
  let totalComponents = 0;
  let missingDisplayName = 0;
  
  const problemFiles = [];
  
  tsxFiles.forEach(file => {
    const result = checkDisplayNames(file);
    
    totalComponents += result.components.length;
    missingDisplayName += result.missingDisplayName.length;
    
    if (result.missingDisplayName.length > 0) {
      problemFiles.push({
        file: path.relative(__dirname, file),
        components: result.missingDisplayName
      });
    }
  });
  
  console.log(`Проаналізовано ${tsxFiles.length} файлів`);
  console.log(`Знайдено ${totalComponents} компонентів`);
  console.log(`Компонентів без displayName: ${missingDisplayName}`);
  
  if (problemFiles.length > 0) {
    console.log('\nФайли з компонентами без displayName:');
    problemFiles.forEach(({ file, components }) => {
      console.log(`\n${file}:\n- ${components.join('\n- ')}`);
    });
  }
}

main();
```

Та BAT-файл `check-displayname.bat` для Windows:

```batch
@echo off
node check-displayname.js
pause
```

## Пам'ятка

- Завжди явно встановлюйте `displayName` для компонентів
- Використовуйте `ErrorBoundary` для перехоплення помилок
- Уникайте циклічних залежностей, особливо при використанні HOC
- Перевіряйте чи всі React компоненти мають явний `displayName`
- Використовуйте клас з `render` методом у складних випадках