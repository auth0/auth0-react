const pkg = require('./package.json');

module.exports = {
  clearMocks: true,
  coveragePathIgnorePatterns: ['/__tests__/', 'index.tsx'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  preset: 'ts-jest',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/jest' }],
  ],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'https://www.example.com/',
  },
  testRegex: '/__tests__/.+test.tsx?$',
  globals: {
    __VERSION__: pkg.version,
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'es6',
        },
      },
    ],
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
