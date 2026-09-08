export default [
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      'out/**',
      'coverage/**',
      '*.config.js',
      '**/*.d.ts',
      '**/*.d.ts.map',
      '**/*.js.map',
      'tsconfig.tsbuildinfo',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
    },
  },
];
