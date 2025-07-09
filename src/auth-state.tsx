import { User } from '@auth0/auth0-spa-js';

/**
 * The auth state which, when combined with the auth methods, make up the return object of the `useAuth0` hook.
 */
export interface AuthState<TUser extends User = User> {
  error: Error | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TUser | undefined;
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
