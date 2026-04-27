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
  // ──────────────────────────────────────────────────────────────────────────
  // Phase 8 — Architecture limits & separation
  // См. docs/RULES.md, docs/refactor/REFACTOR-PLAN.md.
  // P8-18: max-lines (file-level) → error после завершения всех splits.
  // max-lines-per-function/complexity остаются warn — Pinia setup-store
  // factory и historical fetch flows превышают 60 LOC by-design.
  // ──────────────────────────────────────────────────────────────────────────
  {
    files: ['app/**/*.ts', 'app/**/*.vue', 'server/**/*.ts', 'shared/**/*.ts'],
    ignores: ['shared/types/**'],
    rules: {
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['warn', { max: 60, skipBlankLines: true, skipComments: true, IIFEs: true }],
      complexity: ['warn', { max: 12 }],
    },
  },
  // Permanent whitelist — data, registries
  {
    files: [
      'app/components/Programs/Explorer/Nav/facts-data.ts',
      'app/programs/index.ts',
    ],
    rules: { 'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }] },
  },
  // ──────────────────────────────────────────────────────────────────────────
  // P8-02 — services/ layer import isolation
  // app/services/ изолирован от Vue/Pinia слоёв (composables/stores/components).
  // См. docs/RULES.md §2a/§2b и app/services/README.md.
  // ──────────────────────────────────────────────────────────────────────────
  {
    files: ['app/services/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/composables/**'], message: 'services/ не импортит composables/' },
          { group: ['**/stores/**'], message: 'services/ не импортит stores/' },
          { group: ['**/components/**'], message: 'services/ не импортит components/' },
        ],
      }],
    },
  },
)
