# Code Style Reference — auth0-react

## Naming Conventions

| Construct | Convention | Example |
|-----------|-----------|---------|
| React components | PascalCase | `Auth0Provider`, `WithAuthenticationRequired` |
| Hooks | camelCase with `use` prefix | `useAuth0`, `useAuth0Suspense` |
| HOCs | camelCase with `with` prefix | `withAuth0`, `withAuthenticationRequired` |
| TypeScript types / interfaces | PascalCase | `Auth0ContextInterface`, `AppState`, `AuthState` |
| Internal helpers | camelCase | `loginError`, `tokenError`, `hasAuthParams` |
| Reducer action types | string literal in UPPER_SNAKE_CASE | `'INITIALISED'`, `'LOGIN_POPUP_STARTED'`, `'ERROR'` |

## CI-Enforced Rules

These rules fail CI if violated — treat them as guardrails, not suggestions:

- **Single quotes** for all strings (Prettier; `.prettierrc`: `"singleQuote": true`)
- **80-char max line width** (Prettier; `.prettierrc`: `"printWidth": 80`)
- **TypeScript `strict`** mode — all strict checks active (`tsconfig.json`)
- **`noUnusedLocals` + `noUnusedParameters`** — every declared variable and parameter must be used
- **`noImplicitReturns`** — all code paths in a function must return a value (or be `void`)
- **React Hooks exhaustive-deps** (`eslint-plugin-react-hooks/recommended`) — all reactive values must appear in the dependency array of `useEffect` / `useCallback` / `useMemo`

## Dominant Patterns

### Context methods are always memoized

All methods exposed on the context value are wrapped in `useCallback`; the context object itself is built with `useMemo`. This prevents unnecessary re-renders when the provider re-renders:

**✅ Good — memoized with `useCallback`:**
```ts
const getIdTokenClaims = useCallback(
  () => client.getIdTokenClaims(),
  [client]
);
```

**❌ Bad — creates a new function reference on every render:**
```ts
const getIdTokenClaims = () => client.getIdTokenClaims();
```

### Auth state uses `useReducer`

Auth state (`isAuthenticated`, `isLoading`, `user`, `error`) is managed by a single `useReducer` in `Auth0Provider`. Dispatch typed actions (`{ type: 'INITIALISED', user }`) instead of calling `setState` individually — keeps state transitions predictable and testable.

### Errors are normalised before dispatch or rethrow

Wrap unknown errors with `loginError(error)` or `tokenError(error)` before dispatching or rethrowing. Do not let raw `unknown` error objects escape into the context or test assertions.

### `'use client'` directive

The Rollup build injects `'use client'` into both CJS and ESM bundle outputs. Do not add `'use client'` to individual source files — it is a build-time concern. The `test:dist:only` CI job asserts its presence in the built artifact.
