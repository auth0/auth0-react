import { LogoutOptions, RedirectLoginOptions } from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export interface Auth0ContextInterface extends AuthState {
  /**
   * Login in with a redirect.
   */
  login: (options?: RedirectLoginOptions) => Promise<void>;

  /**
   * Logout.
   */
  logout: (options?: LogoutOptions) => void;
}

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <Auth0Provider>.');
};

export default createContext<Auth0ContextInterface>({
  ...initialAuthState,
  login: stub,
  logout: stub,
});
