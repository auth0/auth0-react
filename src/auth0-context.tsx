import {
  GetTokenSilentlyOptions,
  GetTokenWithPopupOptions,
  IdToken,
  LogoutOptions as SPALogoutOptions,
  PopupLoginOptions,
  PopupConfigOptions,
  RedirectLoginResult,
  User,
  GetTokenSilentlyVerboseResponse,
  RedirectLoginOptions as SPARedirectLoginOptions,
  type Auth0Client,
  RedirectConnectAccountOptions,
  ConnectAccountRedirectResult
} from '@auth0/auth0-spa-js';
import { createContext } from 'react';
import { AuthState, initialAuthState } from './auth-state';
import { AppState } from './auth0-provider';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LogoutOptions extends Omit<SPALogoutOptions, 'onRedirect'> {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RedirectLoginOptions<TAppState = AppState>
  extends Omit<SPARedirectLoginOptions<TAppState>, 'onRedirect'> {}

/**
 * Contains the authenticated state and authentication methods provided by the `useAuth0` hook.
 */
export interface Auth0ContextInterface<TUser extends User = User>
  extends AuthState<TUser> {
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
   * the SDK will only fall back to using an iframe to the '/authorize' URL if 
   * the `useRefreshTokensFallback` setting has been set to `true`. By default this
   * setting is `false`.
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
  getAccessTokenSilently: {
    (
      options: GetTokenSilentlyOptions & { detailedResponse: true }
    ): Promise<GetTokenSilentlyVerboseResponse>;
    (options?: GetTokenSilentlyOptions): Promise<string>;
    (options: GetTokenSilentlyOptions): Promise<
      GetTokenSilentlyVerboseResponse | string
    >;
  };

  /**
   * ```js
   * const token = await getTokenWithPopup(options, config);
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
    options?: GetTokenWithPopupOptions,
    config?: PopupConfigOptions
  ) => Promise<string | undefined>;

  /**
   * ```js
   * const claims = await getIdTokenClaims();
   * ```
   *
   * Returns all claims from the id_token if available.
   */
  getIdTokenClaims: () => Promise<IdToken | undefined>;

  /**
   * ```js
   * await loginWithRedirect(options);
   * ```
   *
   * Performs a redirect to `/authorize` using the parameters
   * provided as arguments. Random and secure `state` and `nonce`
   * parameters will be auto-generated.
   */
  loginWithRedirect: (
    options?: RedirectLoginOptions<AppState>
  ) => Promise<void>;

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
   * await connectAccountWithRedirect({
   *   connection: 'google-oauth2',
   *   authorizationParams: {
   *     access_type: 'offline',
   *     scope: 'openid profile email https://www.googleapis.com/auth/drive.readonly',
   *   }
   * });
   * ```
   *
   * Redirects to the `/connect` URL using the parameters
   * provided as arguments. This then redirects to the connection's login page
   * where the user can authenticate and authorize the account to be connected.
   *
   * If connecting the account is successful `onRedirectCallback` will be called
   * with the details of the connected account.
   */
  connectAccountWithRedirect: (
    options: RedirectConnectAccountOptions
  ) => Promise<void>;

  /**
   * ```js
   * auth0.logout({ logoutParams: { returnTo: window.location.origin } });
   * ```
   *
   * Clears the application session and performs a redirect to `/v2/logout`, using
   * the parameters provided as arguments, to clear the Auth0 session.
   * If the `logoutParams.federated` option is specified, it also clears the Identity Provider session.
   * [Read more about how Logout works at Auth0](https://auth0.com/docs/logout).
   */
  logout: (options?: LogoutOptions) => Promise<void>;

  /**
   * After the browser redirects back to the callback page,
   * call `handleRedirectCallback` to handle success and error
   * responses from Auth0. If the response is successful, results
   * will be valid according to their expiration times.
   *
   * @param url The URL to that should be used to retrieve the `state` and `code` values. Defaults to `window.location.href` if not given.
   */
  handleRedirectCallback: (url?: string) => Promise<RedirectLoginResult | ConnectAccountRedirectResult>;

  /**
   * Returns the current DPoP nonce used for making requests to Auth0.
   *
   * It can return `undefined` because when starting fresh it will not
   * be populated until after the first response from the server.
   *
   * It requires enabling the {@link Auth0ClientOptions.useDpop} option.
   *
   * @param nonce The nonce value.
   * @param id    The identifier of a nonce: if absent, it will get the nonce
   *              used for requests to Auth0. Otherwise, it will be used to
   *              select a specific non-Auth0 nonce.
   */
  getDpopNonce: Auth0Client['getDpopNonce'];

  /**
   * Sets the current DPoP nonce used for making requests to Auth0.
   *
   * It requires enabling the {@link Auth0ClientOptions.useDpop} option.
   *
   * @param nonce The nonce value.
   * @param id    The identifier of a nonce: if absent, it will set the nonce
   *              used for requests to Auth0. Otherwise, it will be used to
   *              select a specific non-Auth0 nonce.
   */
  setDpopNonce: Auth0Client['setDpopNonce'];

  /**
   * Returns a string to be used to demonstrate possession of the private
   * key used to cryptographically bind access tokens with DPoP.
   *
   * It requires enabling the {@link Auth0ClientOptions.useDpop} option.
   */
  generateDpopProof: Auth0Client['generateDpopProof'];

  /**
   * Returns a new `Fetcher` class that will contain a `fetchWithAuth()` method.
   * This is a drop-in replacement for the Fetch API's `fetch()` method, but will
   * handle certain authentication logic for you, like building the proper auth
   * headers or managing DPoP nonces and retries automatically.
   * 
   * Check the `EXAMPLES.md` file for a deeper look into this method.
   */
  createFetcher: Auth0Client['createFetcher'];
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
export const initialContext = {
  ...initialAuthState,
  buildAuthorizeUrl: stub,
  buildLogoutUrl: stub,
  getAccessTokenSilently: stub,
  getAccessTokenWithPopup: stub,
  getIdTokenClaims: stub,
  loginWithRedirect: stub,
  loginWithPopup: stub,
  connectAccountWithRedirect: stub,
  logout: stub,
  handleRedirectCallback: stub,
  getDpopNonce: stub,
  setDpopNonce: stub,
  generateDpopProof: stub,
  createFetcher: stub,
};

/**
 * The Auth0 Context
 */
const Auth0Context = createContext<Auth0ContextInterface>(initialContext);

export default Auth0Context;
