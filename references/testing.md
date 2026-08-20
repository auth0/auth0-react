# Testing Reference — auth0-react

## Framework & Location

| Item | Value |
|------|-------|
| Framework | Jest 29 + @testing-library/react 16 |
| Test directory | `__tests__/` |
| File pattern | `__tests__/*.test.tsx` |
| Mock directory | `__mocks__/@auth0/auth0-spa-js.tsx` |
| Test environment | jsdom (jest-environment-jsdom) |
| Coverage threshold | 100% branches / functions / lines / statements |
| Coverage exclusions | `/__tests__/`, `index.tsx` |

## Running Unit Tests (no credentials required)

```bash
# All tests with coverage
npm test

# Single file
npx jest __tests__/auth-provider.test.tsx

# Watch mode
npx jest --watch
```

The default `npm test` suite is unit-only — no Auth0 tenant or network access required. All calls to `Auth0Client` go through the manual mock.

## Integration / Acceptance Tests

> ⚠️ These tests start real example apps (CRA, Next.js, Gatsby) and run Cypress smoke tests against a live Auth0 tenant. They are slow and require real credentials. **Ask before running** (see Boundaries in CLAUDE.md).

```bash
# Requires:
#   CYPRESS_USER_EMAIL    — test user email on your Auth0 tenant
#   CYPRESS_USER_PASSWORD — test user password
#   TEST_DOMAIN, TEST_CLIENT_ID, TEST_AUDIENCE — Auth0 app configuration

CYPRESS_USER_EMAIL=<email> CYPRESS_USER_PASSWORD=<pw> npm run test:integration
```

See `examples/README.md` for example app setup instructions.

## Testing Conventions

- **Grouping:** `describe('ComponentName / hookName', () => { ... })`
- **Naming:** `it('should <behaviour> when <condition>', ...)`
- **Async hooks:** use `renderHook` + `waitFor` from `@testing-library/react`
- **Rendered components:** use `render` + `screen` + `act` for event-driven state changes
- **URL cleanup:** `afterEach(() => { window.history.pushState({}, document.title, '/'); })` to restore URL state between redirect-related tests
- **Provider wrapping:** import `createWrapper()` from `__tests__/helpers.tsx` to wrap hooks in `Auth0Provider` with sensible test defaults

## Mocking `@auth0/auth0-spa-js`

The manual mock at `__mocks__/@auth0/auth0-spa-js.tsx` provides `jest.fn()` stubs for every `Auth0Client` method. Configure per-test behaviour with `.mockResolvedValueOnce`:

```ts
import { Auth0Client } from '@auth0/auth0-spa-js';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

// Configure for a specific test scenario
clientMock.checkSession.mockResolvedValueOnce(undefined);
clientMock.getUser.mockResolvedValue({ sub: 'user123', name: 'Test User' });
```

Do not replace the manual mock with inline `jest.mock()` — the shared file keeps all method stubs consistent and avoids re-declaring the full `Auth0Client` shape in every test file.

## Coverage

100% coverage is enforced by Jest. The `coveragePathIgnorePatterns` config excludes `/__tests__/` and `index.tsx` (the re-export barrel). All new code added to other files under `src/` must have branch, function, line, and statement coverage.
