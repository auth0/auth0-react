import { useContext } from 'react';
import { User } from './auth-state';
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
 * } = useAuth0<TUser>();
 * ```
 *
 * Use the `useAuth0` hook in your components to access the auth state and methods.
 *
 * TUser is an optional type param to provide a type to the `user` field.
 */
const useAuth0 = <TUser extends User = User>(): Auth0ContextInterface<TUser> =>
  useContext(Auth0Context);

export default useAuth0;
