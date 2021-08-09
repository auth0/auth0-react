const { createProvider } = require('../../scripts/oidc-provider');
module.exports = function(app) {
  console.log('proxy');
  app.use('/oidc', createProvider({}).callback());
};