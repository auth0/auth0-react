---
description: "Use when writing or modifying unit tests in auth0-react. Enforces Jest + testing-library conventions, mocking patterns for @auth0/auth0-spa-js, and naming standards."
applyTo: "__tests__/**/*.test.tsx"
---

# Testing Guidelines for auth0-react

When writing tests for auth0-react, follow these conventions to maintain consistency and readability.

## Test File Structure

```tsx
// ✅ Good: Clear describe block naming
describe('useAuth0', () => {
  it('should return authentication state when user is logged in', () => {
    // test
  });
});

// ❌ Bad: Vague test names
describe('Test useAuth0', () => {
  it('works', () => {
    // test
  });
});
```

## Naming Convention

- **`describe` block**: Component or hook name exactly as exported
  - `describe('Auth0Provider', ...)`
  - `describe('useAuth0', ...)`
  - `describe('withAuthenticationRequired', ...)`
- **`it` block**: `should <behaviour> when <condition>`
  - ✅ `it('should return user when authenticated', ...)`
  - ❌ `it('returns user', ...)`

## Mocking Auth0Client

Always use the manual mock at `__mocks__/@auth0/auth0-spa-js.tsx`—never inline `jest.mock()`:

```tsx
import { Auth0Client } from '@auth0/auth0-spa-js';

const clientMock = jest.mocked(new Auth0Client({ clientId: '', domain: '' }));

// Configure per-test behavior
clientMock.checkSession.mockResolvedValueOnce(undefined);
clientMock.getUser.mockResolvedValue({ sub: 'user123', name: 'Test User' });
```

## Async Hooks Testing

Use `renderHook` + `waitFor` from `@testing-library/react`:

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth0 } from '../use-auth0';
import { createWrapper } from './helpers';

it('should load user on mount', async () => {
  const { result } = renderHook(() => useAuth0(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
```

## Provider Wrapping

Import `createWrapper()` from `__tests__/helpers.tsx` to wrap hooks in `Auth0Provider` with sensible test defaults:

```tsx
const { result } = renderHook(() => useAuth0(), {
  wrapper: createWrapper(),
});
```

## URL Cleanup

For tests that interact with redirects, clean up the URL after each test:

```tsx
afterEach(() => {
  window.history.pushState({}, document.title, '/');
});
```

## Coverage

All new code in `src/` (except `index.tsx`) must have **100% branch, function, line, and statement coverage**. Run `npm test` before committing.

```bash
npm test
# ✅ Expected output:
# Statements   : 100% ( 262/262 )
# Branches     : 100% ( 95/95 )
# Functions    : 100% ( 67/67 )
# Lines        : 100% ( 249/249 )
```

## Do Not

- ❌ Use `jest.fn()` inline without going through the manual mock
- ❌ Write tests that require a live Auth0 tenant (unit tests only)
- ❌ Skip failing tests without fixing them
- ❌ Leave test code with `console.log` or `debugger` statements
