module.exports = {
	root: true,
	extends: ["universe/native"],
	// Додаткові правила для перевірки displayName та невикористовуваного коду
	parser: "@typescript-eslint/parser",
	plugins: [
		"@typescript-eslint",
		"react",
		"react-hooks",
		"unused-imports"
	],
	rules: {
		"react/display-name": ["error", { "ignoreTranspilerName": false }],
		// Правило яке перевіряє, що у всіх функціональних компонентів є displayName
		"react/function-component-definition": [
			"warn",
			{
				"namedComponents": "function-declaration",
				"unnamedComponents": "arrow-function"
			}
		],
		
		// Правила для виявлення невикористовуваних імпортів
		"unused-imports/no-unused-imports": "warn",
		"unused-imports/no-unused-vars": [
			"warn",
			{ 
				"vars": "all", 
				"varsIgnorePattern": "^_", 
				"args": "after-used", 
				"argsIgnorePattern": "^_" 
			}
		],
		
		// Правила для виявлення невикористовуваних змінних
		"@typescript-eslint/no-unused-vars": ["warn", { 
			"argsIgnorePattern": "^_",
			"varsIgnorePattern": "^_",
		}],
		
		// Інші корисні правила для виявлення проблемного коду
		"no-duplicate-imports": "error",
	},
	settings: {
		"react": {
			"version": "detect"
		}
	}
};
