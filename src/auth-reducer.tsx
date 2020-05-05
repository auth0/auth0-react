import { AuthState } from './auth-state';

export type Action =
  | { type: 'INITIALISED'; isAuthenticated: boolean; user?: unknown }
  | { type: 'ERROR'; error: Error };

export function authReducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'INITIALISED':
      return {
        ...state,
        isAuthenticated: action.isAuthenticated,
        user: action.user,
        isLoading: false,
      };
    case 'ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.error,
      };
  }
}
