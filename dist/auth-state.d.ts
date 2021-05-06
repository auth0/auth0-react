import { User } from 'auth0-spa-js-ionic';
/**
 * The auth state which, when combined with the auth methods, make up the return object of the `useAuth0` hook.
 */
export interface AuthState<TUser extends User = User> {
    error?: Error;
    isAuthenticated: boolean;
    isLoading: boolean;
    user?: TUser;
}
/**
 * The initial auth state.
 */
export declare const initialAuthState: AuthState;
//# sourceMappingURL=auth-state.d.ts.map