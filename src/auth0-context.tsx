import {
  BaseLoginOptions,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  PopupLoginOptions,
} from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';

export interface RedirectLoginOptions extends BaseLoginOptions {
  /**
   * The URL where Auth0 will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth0 Application's
   * settings.
   */
  redirectUri?: string;
  /**
   * Used to store state before doing the redirect
   */
  appState?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Used to add to the URL fragment before redirecting
   */
  fragment?: string;
}

/**
 * Contains the authenticated state and authentication methods provided by the `useAuth0` hook.
 */
export interface Auth0ContextInterface extends AuthState {
  /**
   * ```js
   * const token = await getAccessTokenSilently(options);
   * ```
   *
   * If there's a valid token stored, return it. Otherwise, get one from the authorize server.
   *
   * See: [Auth0Client#getTokenSilently](https://auth0.github.io/auth0-spa-js/classes/auth0client.html#gettokensilently)
   */
  getAccessTokenSilently: (
    options?: GetTokenSilentlyOptions
  ) => Promise<string>;

  /**
   * Get an access token interactively.
   */
  getAccessTokenWithPopup: (
    options?: GetTokenWithPopupOptions
  ) => Promise<string>;

  /**
   * Returns all claims from the id_token if available.
   */
  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  /**
   * Login in with a redirect.
   */
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;

  /**
   * Login in with a popup.
   */
  loginWithPopup: (options?: PopupLoginOptions) => Promise<void>;

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
  getAccessTokenSilently: stub,
  getAccessTokenWithPopup: stub,
  getIdTokenClaims: stub,
  loginWithRedirect: stub,
  loginWithPopup: stub,
  logout: stub,
});

export default Auth0Context;
