# Docs Update Rules — auth0-react

## Tracked Docs

| Doc | What it covers | Exists |
|-----|---------------|--------|
| `README.md` | Installation (npm/yarn), Auth0 dashboard setup, SDK configuration (`Auth0Provider` props), API reference table, feedback and contributing links | Present |
| `EXAMPLES.md` | Runnable code samples: class components, route protection, API calls with access tokens, custom token exchange, DPoP, MRRT, revoke refresh token, online access, account linking, organizations, Next.js App Router (Server Components), react-router v6, Gatsby, Next.js SPA mode | Present |
| `examples/` | Runnable sample apps: `cra-react-router/`, `gatsby-app/`, `nextjs-app/`, `users-api/` (Express API) | Present |

## When You Change Code, Update These Docs

This is a **library / SDK** — the public surface is the symbols exported from `src/index.tsx`.

| When this changes | Update these docs |
|-------------------|-------------------|
| Public API exports (`src/index.tsx`) | `README.md` (API reference section), `EXAMPLES.md` (all affected samples), affected `examples/` apps |
| Configuration options (`Auth0ProviderOptions`, `Auth0ClientOptions` fields) | `README.md` (Configure the SDK section) |
| Authentication flow (redirect, popup, silent auth, custom token exchange) | `README.md` (Getting Started / Configure the SDK), `EXAMPLES.md` (affected auth examples) |
| Install / package name / peer dependency requirements | `README.md` (Installation section) |
| New public method or exported function added | `EXAMPLES.md` (add a usage sample showing the new method) |
| Public method or exported function removed or renamed | `README.md` (remove/update references), `EXAMPLES.md` (remove/update affected samples), affected `examples/` apps |
| New integration pattern supported (new framework, new auth flow) | `EXAMPLES.md` (add an integration example section) |

> When you touch code that maps to a doc above, update that doc **in the same PR** — do not defer.
