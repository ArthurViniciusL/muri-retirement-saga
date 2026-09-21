// @ts-check
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'src/assets/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // Clean Code — variáveis e imports mortos
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Clean Code — tipagem explícita, `any` só com justificativa
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-member-accessibility': ['warn', { accessibility: 'explicit' }],
      '@typescript-eslint/consistent-type-imports': 'warn',

      // Clean Code — retornos e fluxo previsíveis
      'consistent-return': 'error',
      'no-else-return': 'warn',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-param-reassign': 'error',
      'no-magic-numbers': 'off',
      curly: ['error', 'all'],
    },
  },
  {
    // Arquivos de configuração rodam em Node, fora do tsconfig do jogo.
    files: ['*.config.js', '*.config.ts'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: null },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];
