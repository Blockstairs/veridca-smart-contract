module.exports = {
  env: {
    es2021: true,
    mocha: true,
    node: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'standard-with-typescript',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['*.ts'],
    },
  ],
  parserOptions: {
    project: './tsconfig.json',
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.eslintrc.js', 'commitlint.config.js'],
  rules: {
    'max-len': ['warn', 120, 2],
    '@typescript-eslint/no-non-null-assertion': 'off',
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts', '.d.ts'],
    },
  },
};
