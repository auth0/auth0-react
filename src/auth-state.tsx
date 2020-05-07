export interface AuthState {
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: unknown;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // TODO: SSR support
};
