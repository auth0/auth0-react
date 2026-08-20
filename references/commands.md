# Commands Reference — auth0-react

## Build

```bash
npm run build
# Runs ESLint then Rollup (rollup.config.mjs); outputs CJS + ESM bundles to dist/
```

## Test (unit — safe, no credentials)

```bash
npm test
# jest --coverage; enforces 100% branches/functions/lines/statements
```

## Test (single file)

```bash
npx jest __tests__/auth-provider.test.tsx
```

## Test (watch mode)

```bash
npx jest --watch
```

## Test (dist 'use client' sanity check)

```bash
npm run test:dist:only
# Asserts the 'use client' directive is present in built bundles.
# Requires a prior build; CI runs this automatically after build.
```

## Lint

```bash
npm run lint
# eslint --ext=tsx ./src ./__tests__
```

## Format (staged — run by Husky pre-commit)

```bash
npx pretty-quick --staged
# To format all files: npx prettier --write .
```

## Type check

```bash
npx tsc --noEmit
# Strict mode; noUnusedLocals, noUnusedParameters, noImplicitReturns enforced
```

## Clean

```bash
rm -rf dist/
```

## Generate API docs

```bash
npm run docs
# TypeDoc → docs/ (do not edit the generated output manually)
```

## Dev server

```bash
npm start
# rollup -cw; serves a demo at http://localhost:3000 with live reload
```

## Integration tests (⚠️ Ask First — requires live Auth0 tenant)

```bash
# Requires: CYPRESS_USER_EMAIL, CYPRESS_USER_PASSWORD, TEST_DOMAIN, TEST_CLIENT_ID, TEST_AUDIENCE
CYPRESS_USER_EMAIL=<email> CYPRESS_USER_PASSWORD=<pw> npm run test:integration
# Runs Cypress smoke tests against CRA, Next.js, and Gatsby example apps
```
