import React, { useEffect, useReducer, useState } from 'react';
import {
  Auth0Client,
  Auth0ClientOptions,
  CacheLocation,
  IdToken,
  LogoutOptions,
  PopupLoginOptions,
  PopupConfigOptions,
  RedirectLoginOptions as Auth0RedirectLoginOptions,
} from '@auth0/auth0-spa-js';
import Auth0Context, { RedirectLoginOptions } from './auth0-context';
import { hasAuthParams, loginError, wrappedGetToken } from './utils';
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
   */
  cacheLocation?: CacheLocation;
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
  opts?: Auth0RedirectLoginOptions
): RedirectLoginOptions | undefined => {
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
        if (hasAuthParams()) {
          const { appState } = await client.handleRedirectCallback();
          onRedirectCallback(appState);
        } else {
          await client.checkSession();
        }
        const user = await client.getUser();
        dispatch({ type: 'INITIALISED', isAuthenticated: !!user, user });
      } catch (error) {
        dispatch({ type: 'ERROR', error: loginError(error) });
      }
    })();
  }, [client, onRedirectCallback]);

  const loginWithPopup = async (
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
    dispatch({ type: 'LOGIN_POPUP_COMPLETE', isAuthenticated: !!user, user });
  };

  const logout = (opts: LogoutOptions = {}): void => {
    client.logout(opts);
    if (opts.localOnly) {
      dispatch({ type: 'LOGOUT' });
    }
  };

  return (
    <Auth0Context.Provider
      value={{
        ...state,
        getAccessTokenSilently: wrappedGetToken((opts?) =>
          client.getTokenSilently(opts)
        ),
        getAccessTokenWithPopup: wrappedGetToken((opts?) =>
          client.getTokenWithPopup(opts)
        ),
        getIdTokenClaims: (opts): Promise<IdToken> =>
          client.getIdTokenClaims(opts),
        loginWithRedirect: (opts): Promise<void> =>
          client.loginWithRedirect(toAuth0LoginRedirectOptions(opts)),
        loginWithPopup,
        logout,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};

export default Auth0Provider;
