import {
  GetTokenSilentlyOptions,
  LogoutOptions,
  RedirectLoginOptions,
} from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export interface Auth0ContextInterface extends AuthState {
  /**
   * Get an access token.
   */
  getToken: (
    options?: GetTokenSilentlyOptions
  ) => Promise<{ [key: string]: unknown }>;

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
  getToken: stub,
  login: stub,
  logout: stub,
});
