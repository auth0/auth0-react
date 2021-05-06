import { User } from 'auth0-spa-js-ionic';
import { Auth0ContextInterface } from './auth0-context';
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
declare const useAuth0: <TUser extends User = User>() => Auth0ContextInterface<TUser>;
export default useAuth0;
//# sourceMappingURL=use-auth0.d.ts.map