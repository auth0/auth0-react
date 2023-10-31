const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 7500,
  chromeWebSecurity: false,
  viewportWidth: 1000,
  viewportHeight: 1000,
  fixturesFolder: false,
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'test-results/cypress/junit-[hash].xml',
  },
  e2e: {
    setupNodeEvents(on, config) {},
    baseUrl: 'http://127.0.0.1:3000',
    supportFile: false,
  },
});
