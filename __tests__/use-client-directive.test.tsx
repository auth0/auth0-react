/**
 * @jest-environment node
 *
 *  React Server Components support.
 *
 * These assertions run against the BUILT bundles in dist/, not src/. The entry
 * (src/index.tsx) is a re-export barrel with no directive of its own, and the
 * 'use client' directives in the imported leaf modules are dropped when Rollup
 * concatenates them into a single file, so the directive is injected at the
 * bundle top via rollup's output.banner instead. The RSC-consumed entry points
 * are the CJS (main) and ESM (module) outputs; the UMD <script> builds
 * intentionally do NOT carry it.
 *
 * dist/ is not built by `npm test` (which is just `jest --coverage`). Locally,
 * when the bundles are absent these tests skip with a clear message; run
 * `npm run test:dist` to build first and assert against fresh output. Under CI
 * (process.env.CI) missing bundles are a hard error rather than a silent skip,
 * so the guarantee can never masquerade as a pass. Files are read as TEXT
 * (never imported), so nothing here is pulled into coverage collection.
 */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const dist = (file: string): string => resolve(__dirname, '..', 'dist', file);

const firstNonEmptyLine = (file: string): string => {
  const line = readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (line === undefined) {
    throw new Error(
      `Bundle ${file} has no non-empty lines (empty or truncated build output?)`
    );
  }
  return line;
};

// A 'use client' directive is a bare string-literal statement, e.g. `'use client';`
// on its own line. It must NOT be confused with the same text appearing inside a
// JSDoc comment (the Auth0Provider doc block mentions the directive, and that prose
// is carried into every bundle). This matches a standalone directive only.
const hasClientDirective = (file: string): boolean =>
  readFileSync(file, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .some((l) => l === "'use client';" || l === '"use client";');

const rscBundles = ['auth0-react.cjs.js', 'auth0-react.esm.js'];
const umdBundles = ['auth0-react.js', 'auth0-react.min.js'];

const distBuilt = [...rscBundles, ...umdBundles].every((f) => existsSync(dist(f)));

if (!distBuilt) {
  if (process.env.CI) {
    throw new Error(
      "dist/ bundles are missing but CI must assert the 'use client' directive. " +
        'Ensure the build runs before jest (see the `test:dist` script / rsc-directive CI job).'
    );
  }
  console.warn(
    'Skipping use-client-directive tests: dist/ not built. Run `npm run test:dist`.'
  );
}

const describeIfBuilt = distBuilt ? describe : describe.skip;

describeIfBuilt("'use client' directive in built bundles", () => {
  it.each(rscBundles)('%s starts with the client directive', (file) => {
    expect(firstNonEmptyLine(dist(file))).toBe("'use client';");
  });

  it.each(umdBundles)('%s does not carry the client directive', (file) => {
    expect(hasClientDirective(dist(file))).toBe(false);
  });
});
