# GitHub Copilot Instructions — auth0-react

This is the default entry point for GitHub Copilot and similar tools working on auth0-react.

## What This Repository Is

**auth0-react** is the Auth0 SDK for React Single Page Applications. It provides React hooks and components that wrap `@auth0/auth0-spa-js` for seamless OAuth 2.0 + OIDC integration.

- **Type:** TypeScript SDK
- **Test coverage:** 100% enforced (Jest + @testing-library/react)
- **Public API:** React hooks (`useAuth0`, `useAuth0Suspense`) + components/HOCs (`Auth0Provider`, `withAuth0`, `withAuthenticationRequired`)
- **Key dependency:** `@auth0/auth0-spa-js` (managed by Auth0)

## Key Constraints

1. **Breaking changes:** Always ask first — never make them unilaterally.
2. **100% test coverage:** Run `npm test` before submitting any changes.
3. **Security-sensitive code:** Token handling, DPoP, `onRedirectCallback` — ask before modifying.
4. **Surgical edits:** Change only what the request requires; no refactoring or adjacent reformatting.
5. **New dependencies:** Ask before adding any.
6. **Public API changes:** Requires approval and docs updates.

## Common Tasks

- **Run tests:** `npm test`
- **Build:** `npm run build`
- **Type check:** `npx tsc --noEmit`
- **Lint:** `npm run lint`
- **Format (staged):** `npx prettier --write .` (Husky pre-commit runs this)

## For Detailed Guidance

👉 See [AGENTS.md](../AGENTS.md) in the repository root for the main agent map.
👉 Use [.github/AGENT-CHEAT-SHEET.md](../.github/AGENT-CHEAT-SHEET.md) for a quick-start lookup.
👉 Review the specialized agents in [.github/agents](./agents) for feature work, code review, and onboarding.

---

*Last updated: 2026-08-31*
