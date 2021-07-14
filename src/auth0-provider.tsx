import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Auth0Client,
  Auth0ClientOptions,
  CacheLocation,
  IdToken,
  LogoutOptions,
  LogoutUrlOptions,
  PopupLoginOptions,
  PopupConfigOptions,
  RedirectLoginOptions as Auth0RedirectLoginOptions,
  GetTokenWithPopupOptions,
  GetTokenSilentlyOptions,
  GetIdTokenClaimsOptions,
  RedirectLoginResult,
  ICache,
} from '@auth0/auth0-spa-js';
import Auth0Context, { RedirectLoginOptions } from './auth0-context';
import { hasAuthParams, loginError, tokenError } from './utils';
import { reducer } from './reducer';
import { initialAuthState } from './auth-state';

/**
 * The state of the application before the user was redirected to the login page.
 */
export type AppState = {
  returnTo?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * The main configuration to instantiate the `Auth0Provider`.
 */
export interface Auth0ProviderOptions {
  /**
   * The child nodes your Provider has wrapped
   */
  children?: React.ReactNode;
  /**
   * By default this removes the code and state parameters from the url when you are redirected from the authorize page.
   * It uses `window.history` but you might want to overwrite this if you are using a custom router, like `react-router-dom`
   * See the EXAMPLES.md for more info.
   */
  onRedirectCallback?: (appState: AppState) => void;
  /**
   * By default, if the page url has code/state params, the SDK will treat them as Auth0's and attempt to exchange the
   * code for a token. In some cases the code might be for something else (another OAuth SDK perhaps). In these
   * instances you can instruct the client to ignore them eg
   *
   * ```jsx
   * <Auth0Provider
   *   clientId={clientId}
   *   domain={domain}
   *   skipRedirectCallback={window.location.pathname === '/stripe-oauth-callback'}
   * >
   * ```
   */
  skipRedirectCallback?: boolean;
  /**
   * Your Auth0 account domain such as `'example.auth0.com'`,
   * `'example.eu.auth0.com'` or , `'example.mycompany.com'`
   * (when using [custom domains](https://auth0.com/docs/custom-domains))
   */
  domain: string;
  /**
   * The issuer to be used for validation of JWTs, optionally defaults to the domain above
   */
  issuer?: string;
  /**
   * The Client ID found on your Application settings page
   */
  clientId: string;
  /**
   * The default URL where Auth0 will redirect your browser to with
   * the authentication result. It must be whitelisted in
   * the "Allowed Callback URLs" field in your Auth0 Application's
   * settings. If not provided here, it should be provided in the other
   * methods that provide authentication.
   */
  redirectUri?: string;
  /**
   * The value in seconds used to account for clock skew in JWT expirations.
   * Typically, this value is no more than a minute or two at maximum.
   * Defaults to 60s.
   */
  leeway?: number;
  /**
   * The location to use when storing cache data. Valid values are `memory` or `localstorage`.
   * The default setting is `memory`.
   *
   * Read more about [changing storage options in the Auth0 docs](https://auth0.com/docs/libraries/auth0-single-page-app-sdk#change-storage-options)
   */
  cacheLocation?: CacheLocation;
  /**
   * Specify a custom cache implementation to use for token storage and retrieval. This setting takes precedence over `cacheLocation` if they are both specified.
   *
   * Read more about [creating a custom cache](https://github.com/auth0/auth0-spa-js#creating-a-custom-cache)
   */
  cache?: ICache;
  /**
   * If true, refresh tokens are used to fetch new access tokens from the Auth0 server. If false, the legacy technique of using a hidden iframe and the `authorization_code` grant with `prompt=none` is used.
   * The default setting is `false`.
   *
   * **Note**: Use of refresh tokens must be enabled by an administrator on your Auth0 client application.
   */
  useRefreshTokens?: boolean;
  /**
   * A maximum number of seconds to wait before declaring background calls to /authorize as failed for timeout
   * Defaults to 60s.
   */
  authorizeTimeoutInSeconds?: number;
  /**
   * Changes to recommended defaults, like defaultScope
   */
  advancedOptions?: {
    /**
     * The default scope to be included with all requests.
     * If not provided, 'openid profile email' is used. This can be set to `null` in order to effectively remove the default scopes.
     *
     * Note: The `openid` scope is **always applied** regardless of this setting.
     */
    defaultScope?: string;
  };
  /**
   * Maximum allowable elapsed time (in seconds) since authentication.
   * If the last time the user authenticated is greater than this value,
   * the user must be reauthenticated.
   */
  maxAge?: string | number;
  /**
   * The default scope to be used on authentication requests.
   * The defaultScope defined in the Auth0Client is included
   * along with this scope
   */
  scope?: string;
  /**
   * The default audience to be used for requesting API access.
   */
  audience?: string;
  /**
   * The Id of an organization to log in to.
   *
   * This will specify an `organization` parameter in your user's login request and will add a step to validate
   * the `org_id` claim in your user's ID Token.
   */
  organization?: string;
  /**
   * The Id of an invitation to accept. This is available from the user invitation URL that is given when participating in a user invitation flow.
   */
  invitation?: string;
  /**
   * If you need to send custom parameters to the Authorization Server,
   * make sure to use the original parameter name.
   */
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Replaced by the package version at build time.
 * @ignore
 */
declare const __VERSION__: string;

/**
 * @ignore
 */
const toAuth0ClientOptions = (
  opts: Auth0ProviderOptions
): Auth0ClientOptions => {
  const { clientId, redirectUri, maxAge, ...validOpts } = opts;
  return {
    ...validOpts,
    client_id: clientId,
    redirect_uri: redirectUri,
    max_age: maxAge,
    auth0Client: {
      name: 'auth0-react',
      version: __VERSION__,
    },
  };
};

/**
 * @ignore
 */
const toAuth0LoginRedirectOptions = (
  opts?: RedirectLoginOptions
): Auth0RedirectLoginOptions | undefined => {
  if (!opts) {
    return;
  }
  const { redirectUri, ...validOpts } = opts;
  return {
    ...validOpts,
    redirect_uri: redirectUri,
  };
};

/**
 * @ignore
 */
const defaultOnRedirectCallback = (appState?: AppState): void => {
  window.history.replaceState(
    {},
    document.title,
    appState?.returnTo || window.location.pathname
  );
};

/**
 * ```jsx
 * <Auth0Provider
 *   domain={domain}
 *   clientId={clientId}
 *   redirectUri={window.location.origin}>
 *   <MyApp />
 * </Auth0Provider>
 * ```
 *
 * Provides the Auth0Context to its child components.
 */
const Auth0Provider = (opts: Auth0ProviderOptions): JSX.Element => {
  const {
    children,
    skipRedirectCallback,
    onRedirectCallback = defaultOnRedirectCallback,
    ...clientOpts
  } = opts;
  const [client] = useState(
    () => new Auth0Client(toAuth0ClientOptions(clientOpts))
  );
  const [state, dispatch] = useReducer(reducer, initialAuthState);

  useEffect(() => {
    (async (): Promise<void> => {
      try {
        if (hasAuthParams() && !skipRedirectCallback) {
          const { appState } = await client.handleRedirectCallback();
          onRedirectCallback(appState);
        } else {
          await client.checkSession();
        }
        const user = await client.getUser();
        dispatch({ type: 'INITIALISED', user });
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
      }
    })();
  }, [client, onRedirectCallback, skipRedirectCallback]);

  const buildAuthorizeUrl = useCallback(
    (opts?: RedirectLoginOptions): Promise<string> =>
      client.buildAuthorizeUrl(toAuth0LoginRedirectOptions(opts)),
    [client]
  );

  const buildLogoutUrl = useCallback(
    (opts?: LogoutUrlOptions): string => client.buildLogoutUrl(opts),
    [client]
  );

  const loginWithRedirect = useCallback(
    (opts?: RedirectLoginOptions): Promise<void> =>
      client.loginWithRedirect(toAuth0LoginRedirectOptions(opts)),
    [client]
  );

  const loginWithPopup = useCallback(
    async (
      options?: PopupLoginOptions,
      config?: PopupConfigOptions
    ): Promise<void> => {
      dispatch({ type: 'LOGIN_POPUP_STARTED' });
      try {
        await client.loginWithPopup(options, config);
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
        return;
      }
      const user = await client.getUser();
      dispatch({ type: 'LOGIN_POPUP_COMPLETE', user });
    },
    [client]
  );

  const logout = useCallback(
    (opts: LogoutOptions = {}): Promise<void> | void => {
      const maybePromise = client.logout(opts);
      if (opts.localOnly) {
        if (maybePromise && typeof maybePromise.then === 'function') {
          return maybePromise.then(() => dispatch({ type: 'LOGOUT' }));
        }
        dispatch({ type: 'LOGOUT' });
      }
      return maybePromise;
    },
    [client]
  );

  const getAccessTokenSilently = useCallback(
    async (opts?: GetTokenSilentlyOptions): Promise<string> => {
      let token;
      try {
        token = await client.getTokenSilently(opts);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'GET_ACCESS_TOKEN_COMPLETE',
          user: await client.getUser(),
        });
      }
      return token;
    },
    [client]
  );

  const getAccessTokenWithPopup = useCallback(
    async (
      opts?: GetTokenWithPopupOptions,
      config?: PopupConfigOptions
    ): Promise<string> => {
      let token;
      try {
        token = await client.getTokenWithPopup(opts, config);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'GET_ACCESS_TOKEN_COMPLETE',
          user: await client.getUser(),
        });
      }
      return token;
    },
    [client]
  );

  const getIdTokenClaims = useCallback(
    (opts?: GetIdTokenClaimsOptions): Promise<IdToken> =>
      client.getIdTokenClaims(opts),
    [client]
  );

  const handleRedirectCallback = useCallback(
    async (url?: string): Promise<RedirectLoginResult> => {
      try {
        return await client.handleRedirectCallback(url);
      } catch (error) {
        throw tokenError(error);
      } finally {
        dispatch({
          type: 'HANDLE_REDIRECT_COMPLETE',
          user: await client.getUser(),
        });
      }
    },
    [client]
  );

  return (
    <Auth0Context.Provider
      value={{
        ...state,
        buildAuthorizeUrl,
        buildLogoutUrl,
        getAccessTokenSilently,
        getAccessTokenWithPopup,
        getIdTokenClaims,
        loginWithRedirect,
        loginWithPopup,
        logout,
        handleRedirectCallback,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Provider;
