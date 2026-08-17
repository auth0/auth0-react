// Default import, NOT `import * as React`: webpack checks namespace member names
// against the module's export list, so `React.use` on a namespace binding warns
// for React 16-18 consumers even if they never call this hook (#1205). A default
// import is react's module.exports object, so the read is unchecked. Named
// (`import { use }`) is worse still: it fails at link time.
import React, { useContext, useMemo } from 'react';
import { User } from '@auth0/auth0-spa-js';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * The value returned by `useAuth0Suspense`: the full `useAuth0` interface minus
 * `isLoading` and the internal `_initPromise`. `error` is
 * retained for post-init failures such as `loginWithPopup`.
 */
export type Auth0SuspenseContextInterface<TUser extends User = User> = Omit<
  Auth0ContextInterface<TUser>,
  'isLoading' | '_initPromise'
>;

/**
 * ```jsx
 * <Suspense fallback={<Spinner />}>
 *   <Profile />
 * </Suspense>
 *
 * function Profile() {
 *   const { user, isAuthenticated } = useAuth0Suspense();
 *   return isAuthenticated ? <p>Hello {user.name}</p> : <p>Please log in</p>;
 * }
 * ```
 *
 * Suspense-enabled variant of `useAuth0`. Suspends the component until Auth0
 * initialization completes (letting the nearest `<Suspense>` fallback render),
 * and throws initialization errors so the nearest Error Boundary can handle
 * them. Requires React 19 or later.
 *
 * If initialization fails and the app later becomes authenticated by other
 * means, the session is re-checked once; retrying the Error Boundary then
 * renders if that check succeeded, or throws again if it did not.
 *
 * TUser is an optional type param to provide a type to the `user` field.
 */
const useAuth0Suspense = <TUser extends User = User>(
  context = Auth0Context
): Auth0SuspenseContextInterface<TUser> => {
  if (typeof React.use !== 'function') {
    throw new Error(
      'useAuth0Suspense requires React 19 or later (React.use is unavailable).'
    );
  }

  const ctx = useContext(context) as Auth0ContextInterface<TUser>;

  if (!ctx._initPromise) {
    throw new Error(
      'useAuth0Suspense must be used within an <Auth0Provider>.'
    );
  }

  // Suspends until the init promise resolves; re-throws if it rejected.
  React.use(ctx._initPromise);

  // Memoized so the returned object is referentially stable across renders,
  // matching useAuth0, which hands back the provider's memoized context.
  // Without this, `useEffect(..., [auth])` in a consumer re-runs every render.
  return useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { isLoading, _initPromise, ...rest } = ctx;
    return rest;
  }, [ctx]);
};

export default useAuth0Suspense;
