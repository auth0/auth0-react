import {
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  PopupConfigOptions,
  PopupLoginOptions,
  RedirectLoginOptions,
} from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export type GetTokenOptions = GetTokenSilentlyOptions;
export type LoginOptions = RedirectLoginOptions;

/**
 * Contains the authenticated state and authentication methods provided by the `useAuth0` hook.
 */
export interface Auth0ContextInterface extends AuthState {
  /**
   * ```js
   * const token = await getToken(options);
   * ```
   *
   * If there's a valid token stored, return it. Otherwise, get one from the authorize server.
   *
   * See: [Auth0Client#getTokenSilently](https://auth0.github.io/auth0-spa-js/classes/auth0client.html#gettokensilently)
   */
  getToken: (options?: GetTokenOptions) => Promise<string>;

  /**
   * Get an access token interactively.
   */
  getTokenWithPopup: (
    options?: GetTokenWithPopupOptions,
    config?: PopupConfigOptions
  ) => Promise<string>;

  /**
   * Returns all claims from the id_token if available.
   */
  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  /**
   * Login in with a redirect.
   */
  login: (options?: LoginOptions) => Promise<void>;

  /**
   * Login in with a popup.
   */
  loginWithPopup: (
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ) => Promise<void>;

  /**
   * Logout.
   */
  logout: (options?: LogoutOptions) => void;
}

/**
 * @ignore
 */
const stub = (): never => {
  throw new Error('You forgot to wrap your component in <Auth0Provider>.');
};

const Auth0Context = createContext<Auth0ContextInterface>({
  ...initialAuthState,
  getToken: stub,
  getTokenWithPopup: stub,
  getIdTokenClaims: stub,
  login: stub,
  loginWithPopup: stub,
  logout: stub,
});

export default Auth0Context;
