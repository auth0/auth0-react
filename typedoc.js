module.exports = {
  out: './docs/',
  toc: [
    'useAuth0',
    'withAuth0',
    'withLoginRequired',
    'Auth0Provider',
    'defaultOnRedirectCallback',
    'defaultOnRedirecting',
    'Auth0ContextInterface',
    'Auth0ProviderOptions',
    'AuthState',
    'WithAuth0Props',
    'AppState',
    'initialAuthState',
  ],
  mode: 'file',
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  includeDeclarations: true,
  hideGenerator: true,
  ignoreCompilerErrors: true,
  theme: 'minimal',
};
