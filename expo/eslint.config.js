const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Catch kebab-case DOM/SVG props like clip-path on web
      'react/no-unknown-property': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
]);
