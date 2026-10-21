import { User } from '@auth0/auth0-spa-js';

/**
 * The auth state which, when combined with the auth methods, make up the return object of the `useAuth0` hook.
 */
export interface AuthState<TUser extends User = User> {
  /**
   * `true` while the SDK is initialising or a redirect callback is being
   * handled. Render a loading state rather than trusting `isAuthenticated`
   * until this is `false`.
   *
   * @category Auth State
   */
  isLoading: boolean;

  /**
   * `true` once there is a valid session for the user.
   *
   * @category Auth State
   */
  isAuthenticated: boolean;

  /**
   * The authenticated user's profile, or `undefined` when there is no session.
   *
   * @category Auth State
   */
  user: TUser | undefined;

  /**
   * The error from the last failed authentication attempt, if any.
   *
   * @category Auth State
   */
  error: Error | undefined;
}

/**
 * The initial auth state.
 */
export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: undefined,
  user: undefined,
};
