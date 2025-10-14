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
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' || browser.name === 'chromium') {
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-gpu')
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--disable-software-rasterizer')
        }
        return launchOptions
      })
    },
    baseUrl: 'http://localhost:3000',
    supportFile: false,
  },
});
