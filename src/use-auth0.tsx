import { useContext } from 'react';
import { User } from '@auth0/auth0-spa-js';
import Auth0Context, { Auth0ContextInterface } from './auth0-context';

/**
 * ```js
 * const { isLoading, isAuthenticated, user, loginWithRedirect, logout } =
 *   useAuth0<TUser>();
 * ```
 *
 * Use the `useAuth0` hook in your components to access the auth state and methods.
 *
 * It returns an {@link Auth0ContextInterface}, which carries the auth state
 * (`isLoading`, `isAuthenticated`, `user`, `error`), the login, logout and token
 * methods, and the four sub-clients:
 * {@link Auth0ContextInterface.mfa | mfa},
 * {@link Auth0ContextInterface.passkey | passkey},
 * {@link Auth0ContextInterface.myAccount | myAccount} and
 * {@link Auth0ContextInterface.anonymous | anonymous}. See that interface for
 * the full set of members.
 *
 * TUser is an optional type param to provide a type to the `user` field.
 *
 * @category Hooks & HOCs
 */
const useAuth0 = <TUser extends User = User>(
  context = Auth0Context
): Auth0ContextInterface<TUser> =>
  useContext(context) as Auth0ContextInterface<TUser>;

export default useAuth0;
