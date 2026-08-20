# Common Pitfalls — auth0-react

## 1. Hook called outside `Auth0Provider`

`useAuth0` and `useAuth0Suspense` read from React context. If no `Auth0Provider` ancestor is present, the context is the uninitialized `initialContext` — every method is a no-op and `isAuthenticated` is always `false`. Wrap the component tree in `<Auth0Provider>` at the application root.

## 2. `'use client'` in Next.js App Router

The SDK bundles `'use client'` into its output files so `Auth0Provider` can be imported directly from a Server Component (e.g. `app/layout.tsx`). However, **any component that calls `useAuth0` must itself be a Client Component** — add `'use client'` to the top of those files. Forgetting this causes a "hooks can only be called inside a Client Component" build error.

## 3. `getAccessTokenSilently` throwing unexpectedly

The method throws typed errors from `@auth0/auth0-spa-js` on failure. Handle these at the call site:
- `MissingRefreshTokenError` — refresh token rotation expired; redirect to login
- `MissingScopesError` — requested scope not granted on the current token
- `TimeoutError` — silent auth iframe timed out (e.g. 3rd-party cookie blocked)

Do not swallow the error or wrap the entire component in a generic error boundary — distinct error types need distinct recovery paths.

## 4. URL not cleaned up after redirect

If you do not supply `onRedirectCallback`, the default uses `window.history.replaceState` to strip `?code=&state=` from the URL. With a client-side router (React Router, Next.js router), supply a custom callback — validate `returnTo` before navigating to prevent open-redirect attacks, then fall back to `/`:

```ts
onRedirectCallback={(appState) => {
  const returnTo = appState?.returnTo;
  const safeReturnTo =
    returnTo?.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/';
  router.replace(safeReturnTo);
}}
```

Without a custom callback the router's internal location state stays stale and back-button navigation breaks.

## 5. Multiple `Auth0Provider` instances sharing state

When nesting two providers (e.g. for account linking), you must:
- Pass a distinct `context` prop (`React.createContext(initialContext)`) to each provider and pass the same context to the matching `useAuth0` / `withAuth0` / `withAuthenticationRequired` calls
- Set `skipRedirectCallback` on each provider for the other provider's `redirect_uri` to avoid one provider consuming the other's callback code
- Use distinct `audience` + `scope` combinations if both use `localStorage`, so the cache key differs and one provider does not overwrite the other's cached session
