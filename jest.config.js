module.exports = {
  clearMocks: true,
  coveragePathIgnorePatterns: ['/__tests__/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  preset: 'ts-jest',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: 'test-results/jest' }],
  ],
  testRegex: '/__tests__/.+test.tsx?$',
};
