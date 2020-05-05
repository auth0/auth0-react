module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/camelcase': 'off',
  },
  overrides: [
    {
      files: ['*.test.tsx'],
      rules: {
        '@typescript-eslint/ban-ts-ignore': 'off',
      },
    },
  ],
};
