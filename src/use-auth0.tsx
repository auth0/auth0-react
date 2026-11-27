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
 * @typeParam TUser - The type of the `user` field. It defaults to `User`.
 * @param context - The context to read from. Only provide it if you use multiple `Auth0Provider`s and want this component tied to a provider other than the one for the default `Auth0Context`.
 * @returns The auth state and methods of the nearest `Auth0Provider`.
 *
 * @category Hooks & HOCs
 */
const useAuth0 = <TUser extends User = User>(
  context = Auth0Context
): Auth0ContextInterface<TUser> =>
  useContext(context) as Auth0ContextInterface<TUser>;

export default useAuth0;
