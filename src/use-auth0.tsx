import { useContext, useEffect, useState } from 'react';
import { User } from '@auth0/auth0-spa-js';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * ```js
 * const {
 *   // Auth state:
 *   error,
 *   isAuthenticated,
 *   isLoading,
 *   user,
 *   // Auth methods:
 *   getAccessTokenSilently,
 *   getAccessTokenWithPopup,
 *   getIdTokenClaims,
 *   loginWithRedirect,
 *   loginWithPopup,
 *   logout,
 *   isAuthorized,
 * } = useAuth0<TUser>();
 * ```
 *
 * Use the `useAuth0` hook in your components to access the auth state and methods.
 *
 * TUser is an optional type param to provide a type to the `user` field.
 */
const useAuth0 = <TUser extends User = User>(
  context = Auth0Context,
  options: { audience?: string; scope?: string } = {}
): Auth0ContextInterface<TUser> => {
  const auth0Context = useContext(context) as Auth0ContextInterface<TUser>;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    auth0Context.isAuthenticated
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const { audience, scope } = options;

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);

      if (!auth0Context.isAuthenticated) {
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      if (auth0Context.isAuthorized && (scope || audience)) {
        const hasRequiredScopes = await auth0Context.isAuthorized({
          audience,
          scope,
        });
        setIsAuthenticated(hasRequiredScopes);
      } else {
        setIsAuthenticated(auth0Context.isAuthenticated);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [
    auth0Context.isAuthenticated,
    auth0Context.isAuthorized,
    audience,
    scope,
  ]);

  return {
    ...auth0Context,
    isAuthenticated,
    isLoading: auth0Context.isLoading || isCheckingAuth,
  };
};

export default useAuth0;
