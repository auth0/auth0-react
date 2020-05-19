import {
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  PopupLoginOptions,
  RedirectLoginOptions,
} from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export interface Auth0ContextInterface extends AuthState {
  /**
   * Get an access token.
   */
  getToken: (options?: GetTokenSilentlyOptions) => Promise<string>;

  /**
   * Get an access token interactively.
   */
  getTokenWithPopup: (options?: GetTokenWithPopupOptions) => Promise<string>;

  /**
   * Returns all claims from the id_token if available.
   */
  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  /**
   * Login in with a redirect.
   */
  login: (options?: RedirectLoginOptions) => Promise<void>;

  /**
   * Login in with a popup.
   */
  loginWithPopup: (options?: PopupLoginOptions) => Promise<void>;

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
  getTokenWithPopup: stub,
  getIdTokenClaims: stub,
  login: stub,
  loginWithPopup: stub,
  logout: stub,
});
