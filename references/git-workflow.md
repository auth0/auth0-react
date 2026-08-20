# Git Workflow Reference — auth0-react

## Branch Naming

| Purpose | Pattern | Example |
|---------|---------|---------|
| Feature | `feat/<short-description>` | `feat/dpop-revocation` |
| Bug fix | `fix/<short-description>` | `fix/open-redirect-callback` |
| Chore / maintenance | `chore/<short-description>` | `chore/update-auth0-spa-js` |
| Release | `release/v<major>` | `release/v3` (major-version work only) |

## Commit Messages

This repo uses Conventional Commits style. PR titles are linted by the `lint-pr-title` CI workflow.

```
<type>(<scope>): <subject>

feat(provider): add DPoP nonce refresh support
fix(withAuthRequired): sanitize returnTo URL before redirect
chore(deps): bump @auth0/auth0-spa-js to 2.25.0
test(hooks): add coverage for useAuth0Suspense retry path
```

Common types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `ci`

## Pull Requests

The **Auth0 org-level PR template** applies — [github.com/auth0/.github/blob/master/.github/PULL_REQUEST_TEMPLATE.md](https://github.com/auth0/.github/blob/master/.github/PULL_REQUEST_TEMPLATE.md).

Sections to fill out: **Description** (what and why), **References** (linked issue or ticket), **Testing** (how the change was tested), **Checklist** — key items:
- Adds test coverage for new/changed functionality
- Added documentation for new/changed functionality
- Targets the correct base branch (use `release/v<major>` for breaking changes, `main` otherwise)

## Husky Pre-commit Hook

`npx pretty-quick --staged` runs automatically on every commit, formatting only the staged files. If Prettier reformats a file you did not intend to touch, use `git add -p` to stage selectively.
