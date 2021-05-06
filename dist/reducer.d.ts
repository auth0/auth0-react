import { User } from 'auth0-spa-js-ionic';
import { AuthState } from './auth-state';
declare type Action = {
    type: 'LOGIN_POPUP_STARTED';
} | {
    type: 'INITIALISED' | 'LOGIN_POPUP_COMPLETE' | 'GET_ACCESS_TOKEN_COMPLETE' | 'HANDLE_REDIRECT_COMPLETE';
    user?: User;
} | {
    type: 'LOGOUT';
} | {
    type: 'ERROR';
    error: Error;
};
/**
 * Handles how that state changes in the `useAuth0` hook.
 */
export declare const reducer: (state: AuthState, action: Action) => AuthState;
export {};
//# sourceMappingURL=reducer.d.ts.map