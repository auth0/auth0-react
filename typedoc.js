module.exports = {
  out: './docs/',
  toc: ['useAuth0', 'withAuth0', 'withAuthenticationRequired', 'Auth0Provider'],
  mode: 'file',
  exclude: ['./src/utils.tsx', './src/reducer.tsx'],
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  includeDeclarations: true,
  hideGenerator: true,
  theme: 'minimal',
  readme: 'none',
};
