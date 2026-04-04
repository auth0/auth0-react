# AGENTS.md

Auth0 SDK for React Single Page Applications. Wraps `@auth0/auth0-spa-js` with React Context, hooks (`useAuth0`), and higher-order components (`withAuth0`, `withAuthenticationRequired`) for OAuth 2.0/OIDC authentication with PKCE.

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** React 16.11+ through 19.x (peer dependency)
- **Core dependency:** `@auth0/auth0-spa-js` ^2.18.0
- **Bundler:** Rollup (outputs UMD, ESM, CJS to `dist/`)
- **Testing:** Jest (unit), Cypress (E2E against example apps)
- **Package manager:** npm

## Project Structure

```
src/                 SDK source — hooks, context, provider, HOCs
__tests__/           Jest unit tests (mirrors src/ structure)
__mocks__/           Jest mocks for @auth0/auth0-spa-js
examples/            Example apps: CRA, Gatsby, Next.js, Express API
cypress/             E2E smoke tests
scripts/             Build helpers (OIDC provider for local dev)
static/              Dev server assets
docs/                Generated TypeDoc API docs (not hand-written)
```

## Development

```bash
npm install                  # Install dependencies
npm start                    # Dev server at localhost:3000
npm test                     # Unit tests with coverage
npm run build                # Lint + Rollup production build
npm run lint                 # ESLint
npx pretty-quick             # Prettier formatting
```

### Examples and Integration Tests

```bash
npm run install:examples     # Install all example app dependencies
npm run start:cra            # Start CRA example
npm run start:gatsby         # Start Gatsby example
npm run start:nextjs         # Start Next.js example
npm run start:api            # Start Express API (users-api)
npm run test:integration     # Run all Cypress E2E tests (CRA + Gatsby + Next.js)
```

Integration tests require env vars: `CYPRESS_USER_EMAIL`, `CYPRESS_USER_PASSWORD`, and per-framework Auth0 config (`REACT_APP_DOMAIN`, `GATSBY_DOMAIN`, `NEXT_PUBLIC_DOMAIN`, etc.). See `CONTRIBUTING.md` for setup details.

### Pre-commit

Husky runs `pretty-quick --staged` automatically on commit.

## Additional Documentation

- `EXAMPLES.md` — comprehensive usage examples (class components, protected routes, API calls, organizations, DPoP, MFA, step-up auth)
- `MIGRATION_GUIDE.md` — v1 to v2 migration (breaking changes, removed methods, new params)
- `CONTRIBUTING.md` — local dev setup, running examples, running tests
- `FAQ.md` — common questions about login persistence, post-login state, connection config
