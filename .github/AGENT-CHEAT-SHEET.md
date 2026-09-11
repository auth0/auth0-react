# auth0-react AI Agent Cheat Sheet

## Quick Start

Use the project instructions and specialized agents to keep work aligned with the repo standards.

- Entry point: [AGENTS.md](../AGENTS.md)
- Copilot default instructions: [.github/copilot-instructions.md](copilot-instructions.md)
- Deep guidance: [CLAUDE.md](../CLAUDE.md)
- Commands: [references/commands.md](../references/commands.md)
- Testing: [references/testing.md](../references/testing.md)

## When to Use Each Agent

### @sdk-engineer
Use when you need to:
- implement a feature
- fix a bug
- refactor safely
- keep 100% coverage and repo patterns intact

Example prompts:
- "@sdk-engineer add a new `useAuth0` option for custom redirect handling"
- "@sdk-engineer fix the login popup edge case in auth0-provider"

### @sdk-reviewer
Use when you need to:
- review a PR
- validate docs coverage
- check walkthrough readiness
- confirm the repo checklist is satisfied

Example prompts:
- "@sdk-reviewer review the changes and flag any blockers"
- "@sdk-reviewer check whether this PR follows the auth0-react checklist"

### @onboarding
Use when you need to:
- understand the repo
- learn project conventions
- find the right source file to edit
- get setup or testing help

Example prompts:
- "@onboarding how does Auth0Provider manage auth state?"
- "@onboarding where should I add a new hook and how do I test it?"

## Critical Rules

- Ask before breaking changes
- Ask before modifying security-sensitive code
- Ask before adding a dependency or changing a public API
- Keep changes surgical and minimal
- Run tests before finalizing work
- Update docs when public API changes

## Validation Commands

```bash
npm test
npm run lint
npx tsc --noEmit
```

## Test Conventions

- Use Jest + @testing-library/react
- Follow `describe('ComponentName', ...)` naming
- Use `it('should <behaviour> when <condition>', ...)`
- Use the shared mock at `__mocks__/@auth0/auth0-spa-js.tsx`
- Use `createWrapper()` from `__tests__/helpers.tsx`
- Keep 100% coverage for all `src/` files except `index.tsx`

## Most Important Files

- [src/auth0-provider.tsx](../src/auth0-provider.tsx)
- [src/use-auth0.tsx](../src/use-auth0.tsx)
- [src/with-authentication-required.tsx](../src/with-authentication-required.tsx)
- [__tests__/helpers.tsx](../__tests__/helpers.tsx)
- [README.md](../README.md)
- [EXAMPLES.md](../EXAMPLES.md)
