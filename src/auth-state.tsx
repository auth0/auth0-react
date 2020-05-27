export type User = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface AuthState {
  error?: Error;
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: User;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  // In SSR mode the library will never check the session, so loading should be initialised as false
  isLoading: typeof window !== 'undefined',
};
