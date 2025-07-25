module.exports = {
  name: '@auth0/auth0-react',
  out: './docs/',
  exclude: ['./src/utils.tsx', './src/reducer.tsx'],
  excludeExternals: false,
  excludePrivate: true,
  hideGenerator: true,
  readme: './README.md',
  highlightLanguages: ['typescript', 'javascript', 'jsx', 'tsx', 'bash'],
  visibilityFilters: {
    protected: false,
    inherited: true,
    external: true,
  },
};
