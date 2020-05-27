export type User = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface AuthState {
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // TODO: SSR support
};
