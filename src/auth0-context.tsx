import {
  BaseLoginOptions,
  GetIdTokenClaimsOptions,
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions,
  PopupLoginOptions,
  PopupConfigOptions,
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
   * If there's a valid token stored, return it. Otherwise, opens an
   * iframe with the `/authorize` URL using the parameters provided
   * as arguments. Random and secure `state` and `nonce` parameters
   * will be auto-generated. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * If refresh tokens are used, the token endpoint is called directly with the
   * 'refresh_token' grant. If no refresh token is available to make this call,
   * the SDK falls back to using an iframe to the '/authorize' URL.
   *
   * This method may use a web worker to perform the token call if the in-memory
   * cache is used.
   *
   * If an `audience` value is given to this function, the SDK always falls
   * back to using an iframe to make the token exchange.
   *
   * Note that in all cases, falling back to an iframe requires access to
   * the `auth0` cookie.
   */
  getAccessTokenSilently: (
    options?: GetTokenSilentlyOptions
  ) => Promise<string>;

  /**
   * ```js
   * const token = await getTokenWithPopup(options);
   * ```
   *
   * Get an access token interactively.
   *
   * Opens a popup with the `/authorize` URL using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated. If the response is successful,
   * results will be valid according to their expiration times.
   */
  getAccessTokenWithPopup: (
    options?: GetTokenWithPopupOptions
  ) => Promise<string>;

  /**
   * ```js
   * const claims = await getIdTokenClaims();
   * ```
   *
   * Returns all claims from the id_token if available.
   */
  getIdTokenClaims: (options?: GetIdTokenClaimsOptions) => Promise<IdToken>;

  /**
   * ```js
   * await loginWithRedirect(options);
   * ```
   *
   * Performs a redirect to `/authorize` using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   */
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>;

  /**
   * ```js
   * await loginWithPopup(options, config);
   * ```
   *
   * Opens a popup with the `/authorize` URL using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated. If the response is successful,
   * results will be valid according to their expiration times.
   *
   * IMPORTANT: This method has to be called from an event handler
   * that was started by the user like a button click, for example,
   * otherwise the popup will be blocked in most browsers.
   */
  loginWithPopup: (
    options?: PopupLoginOptions,
    config?: PopupConfigOptions
  ) => Promise<void>;

  /**
   * ```js
   * auth0.logout({ returnTo: window.location.origin });
   * ```
   *
   * Clears the application session and performs a redirect to `/v2/logout`, using
   * the parameters provided as arguments, to clear the Auth0 session.
   * If the `federated` option is specified, it also clears the Identity Provider session.
   * If the `localOnly` option is specified, it only clears the application session.
   * It is invalid to set both the `federated` and `localOnly` options to `true`,
   * and an error will be thrown if you do.
   * [Read more about how Logout works at Auth0](https://auth0.com/docs/logout).
   */
  logout: (options?: LogoutOptions) => void;
}

/**
 * @ignore
 */
const stub = (): never => {
  throw new Error('You forgot to wrap your component in <Auth0Provider>.');
};

/**
 * @ignore
 */
const initialContext = {
  ...initialAuthState,
  getAccessTokenSilently: stub,
  getAccessTokenWithPopup: stub,
  getIdTokenClaims: stub,
  loginWithRedirect: stub,
  loginWithPopup: stub,
  logout: stub,
};

/**
 * The Auth0 Context
 */
const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
