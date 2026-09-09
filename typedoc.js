const { CATEGORY_ORDER } = require('./scripts/typedoc-plugin.js');

module.exports = {
  // Document what the package actually exports. Pointing TypeDoc at `src/`
  // instead made it expand every file in the tree, which pulled internal
  // modules (the reducer, auth state, utils) into the reference.
  entryPoints: ['./src/index.tsx'],
  entryPointStrategy: 'resolve',

  out: './docs/',
  readme: './README.md',
  name: 'Auth0 React SDK',
  cleanOutputDir: true,

  plugin: ['./scripts/typedoc-plugin.js'],
  theme: 'auth0',
  customCss: './scripts/typedoc.css',

  // Keep the reference to the public surface.
  excludePrivate: true,
  excludeProtected: true,
  excludeInternal: true,
  // Without this, every error class inherits Error's `stack`, `captureStackTrace`
  // and `prepareStackTrace` from TypeScript's own lib types, and React's own
  // types leak in through the component props. Almost the entire type surface is
  // re-exported from `@auth0/auth0-spa-js` and is part of our public API, so
  // only the TypeScript lib, React and other third-party packages are external.
  excludeExternals: true,
  externalPattern: [
    '**/node_modules/typescript/**',
    '**/node_modules/@types/**',
    '**/node_modules/react/**',
    '**/node_modules/react-dom/**'
  ],
  // Note: no blanket `node_modules` exclusion here. `exclude` is matched against
  // a symbol's declaration file, so excluding node_modules would also drop the
  // options, errors and sub-clients we deliberately re-export from
  // `@auth0/auth0-spa-js`.
  exclude: [
    '**/__tests__/**/*',
    '**/__mocks__/**/*',
    '**/cypress/**/*',
    './src/utils.tsx',
    './src/reducer.tsx'
  ],

  // Group the landing page and sidebar by category rather than by TypeScript
  // kind, so readers see "Getting Started" before a wall of interfaces.
  categorizeByGroup: false,
  categoryOrder: CATEGORY_ORDER,
  defaultCategory: 'Other Types',
  navigation: {
    includeCategories: true,
    includeGroups: false
  },
  sort: ['kind', 'alphabetical'],
  kindSortOrder: [
    'Function',
    'Class',
    'Interface',
    'TypeAlias',
    'Enum',
    'Variable'
  ],

  hideGenerator: true,
  searchInComments: true,
  highlightLanguages: ['typescript', 'javascript', 'jsx', 'tsx', 'bash'],

  visibilityFilters: {
    protected: false,
    inherited: true,
    external: true
  },

  compilerOptions: {
    skipLibCheck: true
  }
};
