// TypeDoc config for the artifact published to the docs-v2 repo.
//
// Reuses every filtering and categorization decision from `typedoc.js` so the
// Mintlify site documents exactly the same surface as the HTML site, but emits
// only the JSON artifact that Mintlify consumes.
//
// `out`, `cleanOutputDir`, `theme` and `customCss` are dropped deliberately.
// TypeDoc emits an HTML output for `out` independently of `--json`, so leaving
// it in would rebuild `docs/` as a side effect of building the artifact.
const {
  out,
  cleanOutputDir,
  theme,
  customCss,
  ...shared
} = require('./typedoc.js');

module.exports = {
  ...shared,
  json: './mintlify/auth0-react.json',

  // This file is committed, here and in docs-v2. Minified, a rebuild turns into
  // a single-line diff of tens of thousands of changes; pretty-printed, it diffs
  // as just the symbols that actually changed.
  pretty: true
};
