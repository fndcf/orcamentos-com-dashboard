module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules', 'coverage', '**/__tests__/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    // Regras para detectar codigo nao utilizado
    '@typescript-eslint/no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    'no-unused-vars': 'off', // Desabilita a regra padrao em favor da do typescript

    // Detectar imports nao utilizados
    '@typescript-eslint/no-unused-expressions': 'warn',

    // Detectar funcoes vazias
    '@typescript-eslint/no-empty-function': 'warn',

    // Detectar interfaces/tipos vazios
    '@typescript-eslint/no-empty-interface': 'warn',

    // Relaxar regras que nao sao sobre codigo nao utilizado
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',

    // React refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // Outras regras uteis
    'no-console': 'warn',
    'no-debugger': 'warn',
    'prefer-const': 'warn',
    'no-var': 'error',
    'eqeqeq': ['warn', 'always'],
  },
};
