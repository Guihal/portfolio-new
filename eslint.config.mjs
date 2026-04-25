// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Ignore test files — не попадают в nuxt tsconfig projectService
  {
    ignores: ['tests/**', 'vitest.config.ts', 'playwright.config.ts', 'scripts/**'],
  },
  // General rules for all files
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
    },
  },
  // Logger implementation may use any console method
  {
    files: ['shared/utils/logger.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  // TypeScript-aware rules — only for TS/Vue files
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // P3-01/P3-02 будут фиксить архитектурно. До тех пор — warn.
      'vue/no-mutating-props': 'warn',
      'vue/no-ref-as-operand': 'error',
      // Background, Loader — единичные общие компоненты, единственное число оправдано.
      'vue/multi-word-component-names': 'off',
    },
  },
)
