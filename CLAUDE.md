# AI Agent Guidelines for auth0-react

This document provides context and guidelines for AI coding assistants working with the auth0-react codebase.

## Your Role

You are a TypeScript SDK engineer working on auth0-react, the Auth0 React SPA SDK. You write small, well-tested, tree-shakeable React hooks and components that wrap `@auth0/auth0-spa-js`.

---

## Project Structure

```text
auth0-react/
├── src/                               # SDK source (TypeScript)
│   ├── index.tsx                      # Public API exports — the contract
│   ├── auth0-provider.tsx             # Auth0Provider component + telemetry wiring
│   ├── auth0-context.tsx              # React context + Auth0ContextInterface type
│   ├── use-auth0.tsx                  # useAuth0 hook
│   ├── use-auth0-suspense.tsx         # useAuth0Suspense hook (React.use()-based)
│   ├── with-auth0.tsx                 # withAuth0 HOC
│   ├── with-authentication-required.tsx # Route protection HOC
│   ├── auth-state.tsx                 # AuthState type
│   ├── reducer.tsx                    # Auth state reducer
│   ├── errors.tsx                     # OAuthError
│   └── utils.tsx                      # Shared utilities
├── __tests__/                         # Jest unit tests (*.test.tsx)
├── __mocks__/@auth0/                  # Manual mock for @auth0/auth0-spa-js
├── examples/                          # Runnable sample apps
│   ├── cra-react-router/              # Create React App + React Router
│   ├── gatsby-app/                    # Gatsby example
│   ├── nextjs-app/                    # Next.js example
│   └── users-api/                     # Express API used by examples
├── cypress/                           # E2E smoke tests
├── docs/                              # TypeDoc-generated API output (do not edit manually)
├── .github/                           # CI workflows and reusable actions
├── .version                           # Version source of truth (keep in sync with package.json)
├── jest.config.js
├── rollup.config.mjs
└── package.json
```

---

## Boundaries

### ✅ Always Do

- Run `npm test` before committing — 100% coverage threshold is enforced in CI
- Make surgical changes — touch only what the request requires; do not refactor or reformat adjacent code
- Use `useCallback`/`useMemo` for all values exposed on the context object (matches existing pattern in `auth0-provider.tsx`)
- Add unit tests for all new code in `src/` (except `index.tsx`, which is excluded from coverage)
- When adding a **new outbound request path to Auth0**, route it through the existing `client` instance (`Auth0Client` created in `Auth0Provider`) — it carries `auth0Client: { name: 'auth0-react', version }` (see `src/auth0-provider.tsx`) which causes `@auth0/auth0-spa-js` to include the `Auth0-Client` identification header on every request; never create a separate `Auth0Client` or raw HTTP client for a new auth flow
- Keep `.version` and `package.json` `"version"` in sync — `.version` is the version source of truth used during builds
- Update `README.md` and `EXAMPLES.md` in the same PR when changing the public API, configuration options, or supported integration patterns; update affected `examples/` sample apps too

### ⚠️ Ask First

- **Any breaking change — always ask first.** Never make a breaking change on your own initiative; stop and ask the maintainer before writing it.
- Adding new dependencies
- Modifying public API signatures (anything exported from `src/index.tsx`)
- Changes to CI/CD configuration
- Modifying security-related code (token handling, DPoP, `onRedirectCallback`)
- Running integration tests (`npm run test:integration`) — Cypress against a live Auth0 tenant; slow and requires real credentials

### 🚫 Never Do

- Commit secrets, API keys, or tokens
- Edit files under `dist/` or `docs/` by hand — both are build outputs
- Remove or skip failing tests without fixing them
- Edit `node_modules/` or lock files by hand
- Break backward compatibility without asking first and getting explicit approval
- Log, expose, or store tokens in cleartext

---

## Security Considerations

- **PKCE** is handled transparently by `@auth0/auth0-spa-js`; do not bypass or replicate it.
- **Token storage:** `InMemoryCache` (default) or `LocalStorageCache` — never write raw tokens to `localStorage` directly; always go through the cache abstraction.
- **`onRedirectCallback`** receives `appState` after the Auth0 redirect; validate the `returnTo` URL before redirecting to prevent open-redirect attacks — reject non-relative URLs or URLs outside expected origins.
- **DPoP** is supported; never strip or bypass the DPoP nonce mechanism — `getDpopNonce`/`setDpopNonce`/`generateDpopProof` on the context are its public surface.
- Never `console.log` or send telemetry that includes `access_token`, `id_token`, or `refresh_token` values.
- Secret scanning is active (`.semgrepignore`, CodeQL, Snyk, RL-secure workflows) — all commits are scanned.

---

> The sections below are **reference** — read each linked file only when the task requires it.

## Commands

See [references/commands.md](references/commands.md) for the full command list. Read when you need to build, test, lint, or format.

---

## Testing

**Framework:** Jest 29 + @testing-library/react. Tests live in `__tests__/` (`*.test.tsx`). The `__mocks__/@auth0/auth0-spa-js.tsx` manual mock is used for all unit tests — no live tenant required.

See [references/testing.md](references/testing.md) for conventions, mocking patterns, and the Cypress integration tier. Read when writing or debugging tests.

---

## Code Style

**CI-enforced:** single quotes and 80-char line width (Prettier); TypeScript `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`; React Hooks exhaustive-deps (ESLint).

See [references/code-style.md](references/code-style.md) for naming conventions, good/bad examples, and project patterns. Read when writing new source.

---

## Git Workflow

See [references/git-workflow.md](references/git-workflow.md) for branch naming, commit message format, and PR process. Read before opening a PR.

---

## Common Pitfalls

See [references/pitfalls.md](references/pitfalls.md) for auth0-react-specific gotchas. Read when troubleshooting unexpected behaviour.

---

## Docs Update Rules

> A PR that adds or changes public API, configuration, or integration patterns is **not complete** until the relevant docs are updated in the same PR.

See [references/docs-update.md](references/docs-update.md) for the tracked-docs inventory and code-to-docs mapping. Read when changing public API or integration patterns.
