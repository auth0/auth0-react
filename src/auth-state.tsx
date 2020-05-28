export type User = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface AuthState {
  error?: Error;
  isAuthenticated: boolean;
  isReady: boolean;
  user?: User;
}

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  // In SSR mode the library will never check the session, so it should be initialised as ready
  isReady: typeof window === 'undefined',
};
