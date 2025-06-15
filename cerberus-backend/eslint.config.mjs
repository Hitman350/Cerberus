// eslint.config.js

// Import plugins and configurations
import js from '@eslint/js';
import globals from 'globals';
import pluginSecurity from 'eslint-plugin-security';
import prettierConfig from 'eslint-config-prettier';

// Export the configuration array
export default [
  // 1. Base Configurations
  js.configs.recommended, // ESLint's recommended rules
  pluginSecurity.configs.recommended, // Security plugin's recommended rules
  prettierConfig, // Disables ESLint rules that conflict with Prettier

  // 2. Global Configuration for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // All Node.js global variables
        ...globals.jest, // All Jest global variables
      },
    },
    rules: {
      // Your custom rules go here. These will override the recommended settings.
      'no-console': 'warn', // Warn about console.log statements instead of erroring
      'no-unused-vars': ['warn', { args: 'none' }], // Warn about unused variables
    },
  },
];